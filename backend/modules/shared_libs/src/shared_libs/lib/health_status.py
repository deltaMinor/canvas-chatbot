"""
Startup health status publisher for Django services.

Publishes a short-lived heartbeat to Redis on service startup so
external systems can observe service liveness without long retention.
"""

from __future__ import annotations

import json
import logging
import os
import socket
import sys
import threading
import time

from shared_libs.lib.redis_util.connection_manager import get_redis_client

logger = logging.getLogger(__name__)


def _resolve_cli_queues() -> list[str]:
    argv = sys.argv
    for idx, arg in enumerate(argv):
        if arg in {"-Q", "--queues"} and idx + 1 < len(argv):
            return [q.strip() for q in argv[idx + 1].split(",") if q.strip()]
        if arg.startswith("-Q=") or arg.startswith("--queues="):
            _, value = arg.split("=", 1)
            return [q.strip() for q in value.split(",") if q.strip()]
    return []


DEFAULT_HEALTH_TTL_SECONDS = int(os.environ.get("DJANGO_HEALTH_TTL_SECONDS", "75"))
DEFAULT_HEALTH_PERIOD_SECONDS = int(
    os.environ.get("DJANGO_HEALTH_PERIOD_SECONDS", "120")
)
_publisher_started = False
_publisher_lock = threading.Lock()


def build_worker_service_name(
    sender: object | None,
) -> str:
    base_name = _resolve_service_base_name(sender)
    queues = _resolve_sender_queues(sender)

    if not queues:
        return base_name

    seen = set()
    ordered = []
    for queue_name in queues:
        if not queue_name or queue_name in seen:
            continue
        seen.add(queue_name)
        ordered.append(queue_name)

    if not ordered:
        return base_name

    return f"{base_name}_{'_'.join(ordered)}"


def _resolve_service_base_name(sender: object | None) -> str:
    if sender is None:
        return "unknown_service_worker"

    if isinstance(sender, str):
        return "unknown_service_worker"

    sender_app = getattr(sender, "app", None)
    app_main = getattr(sender_app, "main", None) if sender_app else None
    if app_main:
        return f"{app_main}_worker"

    return "unknown_service_worker"


def _resolve_sender_queues(sender: object | None) -> list[str]:
    if sender is None or isinstance(sender, str):
        return []

    queues = None
    sender_consumer = getattr(sender, "consumer", None)
    if sender_consumer is not None:
        queues = getattr(sender_consumer, "queues", None)

    if queues is None:
        queues = getattr(sender, "queues", None)

    if not queues:
        sender_options = getattr(sender, "options", None) or {}
        if isinstance(sender_options, dict):
            queues = sender_options.get("queues") or sender_options.get("queue")

    if not queues:
        env_queues = os.environ.get("CELERY_QUEUES") or os.environ.get("CELERY_QUEUE")
        if env_queues:
            queues = env_queues

    if not queues:
        queues = _resolve_cli_queues()

    if not queues:
        return []

    resolved = []
    if isinstance(queues, str):
        queues = [q.strip() for q in queues.split(",") if q.strip()]

    for queue in queues:
        queue_name = None
        if isinstance(queue, str):
            queue_name = queue
        else:
            queue_name = getattr(queue, "name", None)
            if not queue_name and isinstance(queue, dict):
                queue_name = queue.get("name")
        if queue_name:
            resolved.append(queue_name)

    return resolved


def start_periodic_health_publisher(
    service_name: str | None = None,
    ttl_seconds: int | None = None,
    period_seconds: int | None = None,
) -> None:
    """
    Start a background thread that periodically publishes health to Redis.

    Args:
        ttl_seconds: Optional TTL override in seconds.
        period_seconds: Optional publish period override in seconds.
    """
    global _publisher_started

    with _publisher_lock:
        if _publisher_started:
            return
        _publisher_started = True

    service_name = service_name or "unknown_service"
    hostname = os.environ.get("HOSTNAME") or socket.gethostname()
    pid = os.getpid()
    ttl = DEFAULT_HEALTH_TTL_SECONDS if ttl_seconds is None else ttl_seconds
    period = DEFAULT_HEALTH_PERIOD_SECONDS if period_seconds is None else period_seconds

    if ttl <= period:
        ttl = period + max(5, int(period * 0.25))

    key = f"service_health:{service_name}:{hostname}:{pid}"

    def _loop() -> None:
        while True:
            payload = {
                "service": service_name,
                "host": hostname,
                "pid": pid,
                "status": "running",
                "timestamp": int(time.time()),
            }
            _publish_health(key, ttl, payload)
            time.sleep(period)

    thread = threading.Thread(
        target=_loop,
        name=f"health-publisher-{service_name}-{pid}",
        daemon=True,
    )
    thread.start()


def _publish_health(key: str, ttl: int, payload: dict) -> None:
    try:
        redis_client = get_redis_client(payload.get("service", "default"))
        redis_client.setex(key, ttl, json.dumps(payload))
        logger.info("[ SHARED-LIB ] Published health to Redis")
    except Exception as exc:
        logger.warning(
            "Failed to publish health to Redis: %s",
            exc,
            extra={"service": payload.get("service")},
        )
