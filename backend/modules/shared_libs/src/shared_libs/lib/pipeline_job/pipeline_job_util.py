"""Base utility class for querying pipeline job heartbeats and managing start reservations.

Both ``AssessmentLLMJobUtil`` (risk-register) and ``DiagramLLMJobUtil``
(diagram service) inherit from ``PipelineJobUtil``.  Subclasses configure
four class variables — the Redis service name, key prefixes, and TTL
constants — and get all heartbeat-query and reservation methods for free.

Heartbeat queries
-----------------
Active heartbeats are discovered by scanning the Redis key pattern
``{_heartbeat_key_prefix}:{project_id}:*`` and filtering for
``is_running=True`` entries.  The pattern always ends in ``*`` so that a
single project can run at most one job (the prefix is project-scoped).

Start reservation
-----------------
The reservation is a Redis NX key that prevents two concurrent API requests
from both dispatching a pipeline when no heartbeat is yet visible (the brief
window between dispatch and the pipeline task starting its heartbeat thread).

The pipeline task clears the reservation immediately after calling
``tracker.start()``, at which point the heartbeat takes over as the sole
liveness signal.
"""

import json
import logging
import time
from json import dumps

from shared_libs.infrastructure.redis_repository.service import RedisRepository
from shared_libs.lib.pipeline_job.pipeline_job_tracker import scan_active_heartbeats

logger = logging.getLogger(__name__)


class PipelineJobUtil:
    """Base utility for heartbeat queries and start-reservation management.

    Subclasses must define:

    .. code-block:: python

        class MyJobUtil(PipelineJobUtil):
            _redis_service_name = "my_service"
            _heartbeat_key_prefix = "my_service:job"
            _reservation_key_prefix = "my_service:job_reservation"
            _reservation_ttl_seconds = 300
            _reservation_stale_seconds = 60
    """

    _redis_service_name: str
    _heartbeat_key_prefix: str
    _reservation_key_prefix: str
    _reservation_ttl_seconds: int
    _reservation_stale_seconds: int

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @classmethod
    def _repository(
        cls,
        redis_repository: RedisRepository | None = None,
    ) -> RedisRepository:
        return redis_repository or RedisRepository(service_name=cls._redis_service_name)

    @classmethod
    def get_reservation_key(cls, project_id: str) -> str:
        """Return the Redis key used for the start reservation of *project_id*."""
        return f"{cls._reservation_key_prefix}:{project_id}"

    # ------------------------------------------------------------------
    # Heartbeat queries
    # ------------------------------------------------------------------

    @classmethod
    def get_active_heartbeats(
        cls,
        project_id: str,
        redis_repository: RedisRepository | None = None,
    ) -> list[dict]:
        """Return all active (``is_running=True``) heartbeats for *project_id*."""
        repository = cls._repository(redis_repository)
        return scan_active_heartbeats(
            key_pattern=f"{cls._heartbeat_key_prefix}:{project_id}:*",
            redis_repository=repository,
        )

    @classmethod
    def has_active_job(
        cls,
        project_id: str,
        redis_repository: RedisRepository | None = None,
    ) -> bool:
        return bool(cls.get_active_heartbeats(project_id, redis_repository))

    @classmethod
    def get_active_heartbeat(
        cls,
        project_id: str,
        redis_repository: RedisRepository | None = None,
    ) -> dict | None:
        """Return the most-recently-updated active heartbeat, or ``None``."""
        heartbeats = cls.get_active_heartbeats(project_id, redis_repository)
        if not heartbeats:
            return None
        return max(heartbeats, key=lambda h: float(h.get("updated_at") or 0))

    # ------------------------------------------------------------------
    # Start reservation
    # ------------------------------------------------------------------

    @classmethod
    def reserve_start(
        cls,
        project_id: str,
        job_id: str,
        redis_repository: RedisRepository | None = None,
    ) -> bool:
        """Atomically acquire the start-reservation slot for *project_id*.

        Uses Redis NX so that only one concurrent caller succeeds.  The
        pipeline task clears the reservation via ``clear_start_reservation``
        as soon as its heartbeat is running, after which liveness is tracked
        by the heartbeat alone.

        Returns:
            ``True`` if the reservation was acquired, ``False`` if one
            already exists.
        """
        repository = cls._repository(redis_repository)
        return bool(
            repository.redis_client.set(
                cls.get_reservation_key(project_id),
                dumps(
                    {
                        "project_id": project_id,
                        "job_id": job_id,
                        "reserved_at": time.time(),
                    }
                ),
                nx=True,
                ex=cls._reservation_ttl_seconds,
            )
        )

    @classmethod
    def get_start_reservation(
        cls,
        project_id: str,
        redis_repository: RedisRepository | None = None,
    ) -> dict | None:
        repository = cls._repository(redis_repository)
        raw = repository.redis_client.get(cls.get_reservation_key(project_id))
        if not raw:
            return None
        try:
            return json.loads(raw)
        except Exception:
            logger.warning(
                "Failed to parse pipeline job reservation payload for"
                " project_id=%s util=%s",
                project_id,
                cls.__name__,
            )
            return None

    @classmethod
    def clear_start_reservation(
        cls,
        project_id: str,
        redis_repository: RedisRepository | None = None,
    ) -> None:
        repository = cls._repository(redis_repository)
        repository.redis_client.delete(cls.get_reservation_key(project_id))

    @classmethod
    def is_start_reservation_stale(
        cls,
        project_id: str,
        redis_repository: RedisRepository | None = None,
    ) -> bool:
        reservation = cls.get_start_reservation(
            project_id, redis_repository=redis_repository
        )
        if not reservation:
            return False
        reserved_at = reservation.get("reserved_at")
        if not isinstance(reserved_at, (int, float)):
            return True
        return (time.time() - float(reserved_at)) >= cls._reservation_stale_seconds
