"""AWS connectivity checker with Redis-backed caching.

Performs a lightweight STS ``get_caller_identity`` probe to verify that the
process has valid AWS credentials.  A successful result is written to Redis
with a configurable TTL so subsequent calls within the window are free.  On
failure nothing is written, ensuring every retry performs a live check.

Usage::

    from shared_libs.lib.aws_connectivity_checker import AwsConnectivityChecker

    if AwsConnectivityChecker.is_bedrock_available():
        ...  # proceed with Bedrock model
    else:
        ...  # fall back to non-Bedrock model
"""

from __future__ import annotations

import logging
import os
import socket

logger = logging.getLogger(__name__)

_DEFAULT_TTL = int(os.environ.get("AWS_CONNECTIVITY_CACHE_TTL", "300"))


def _instance_redis_key() -> str:
    """Build a per-process Redis key: ``aws:bedrock:connectivity:{hostname}:{pid}``."""
    hostname = socket.gethostname()
    pid = os.getpid()
    return f"aws:bedrock:connectivity:{hostname}:{pid}"


class AwsConnectivityChecker:
    """Check AWS/Bedrock reachability with a Redis-cached result."""

    @classmethod
    def is_bedrock_available(cls) -> bool:
        """Return True when AWS credentials are valid and reachable.

        Checks Redis first.  On a cache miss it performs a live STS probe; a
        success is written back to Redis with TTL.  Failures are never cached
        so the next call always re-tries.
        """
        cached = cls._get_cached()
        if cached is not None:
            return cached

        available = cls._probe_aws()
        if available:
            cls._set_cached()
        return available

    @classmethod
    def resolve_with_fallback(cls, model_key: str, default_model: str) -> str:
        """Return *model_key* unless it is a Bedrock model and Bedrock is down.

        Uses :data:`shared_libs.constants.llm.LLM_BEDROCK_CATALOG` to detect
        Bedrock-only models without importing ``engine_libs``.
        """
        from shared_libs.constants.llm import LLM_BEDROCK_CATALOG  # local import avoids cycles

        if model_key in LLM_BEDROCK_CATALOG and not cls.is_bedrock_available():
            logger.warning(
                "AWS Bedrock unavailable — falling back from %r to %r",
                model_key,
                default_model,
            )
            return default_model
        return model_key

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @classmethod
    def _get_cached(cls) -> bool | None:
        """Return True/False from Redis, or None on cache miss / Redis error."""
        try:
            from shared_libs.lib.redis_util.connection_manager import get_redis_client

            client = get_redis_client()
            value = client.get(_instance_redis_key())
            if value is not None:
                return value == "1"
        except Exception as exc:
            logger.debug("AwsConnectivityChecker: Redis read failed: %s", exc)
        return None

    @classmethod
    def _set_cached(cls, ttl: int = _DEFAULT_TTL) -> None:
        """Write success marker to Redis with TTL."""
        try:
            from shared_libs.lib.redis_util.connection_manager import get_redis_client

            client = get_redis_client()
            key = _instance_redis_key()
            client.set(key, "1", ex=ttl)
            logger.debug("AwsConnectivityChecker: cached %r for %ds", key, ttl)
        except Exception as exc:
            logger.debug("AwsConnectivityChecker: Redis write failed: %s", exc)

    @classmethod
    def _probe_aws(cls) -> bool:
        """Perform a live STS probe.  Returns True on success, False on any error."""
        try:
            import boto3

            boto3.client("sts").get_caller_identity()
            logger.info("AwsConnectivityChecker: AWS connectivity confirmed via STS")
            return True
        except Exception as exc:
            logger.warning("AwsConnectivityChecker: AWS connectivity check failed: %s", exc)
            return False
