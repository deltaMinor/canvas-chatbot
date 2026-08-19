"""Diagram generation pipeline job tracker."""

import logging
import time
from typing import Any

from shared_libs.config.llm_generation_config import (
    LLM_GENERATION_JOB_HEARTBEAT_REFRESH_SECONDS,
    LLM_GENERATION_JOB_HEARTBEAT_TTL_SECONDS,
)
from shared_libs.infrastructure.redis_repository.service import RedisRepository
from shared_libs.lib.pipeline_job import PipelineJobTracker

logger = logging.getLogger(__name__)

_KEY_PREFIX = "architecture_diagram:llm_generation_job"


class DiagramGenerationJobTracker(PipelineJobTracker):
    """Manage lifecycle and heartbeat for a single LLM diagram generation pipeline run.

    Extends ``PipelineJobTracker`` with diagram-specific fields (``canvas_id``
    and ``generation_type``) and checkpoint support.  Checkpoints are stored in
    the Redis heartbeat under ``generation_latest_checkpoint`` so that
    post-mortem inspection is possible when a worker dies mid-generation.

    ``touch/fail/complete`` all accept an optional ``latest_checkpoint`` kwarg
    (inherited from the base).  The base ``_write()`` preserves the checkpoint
    across every write automatically because ``_checkpoint_field`` is set.

    Use ``record_checkpoint()`` as a convenience when you want to build and
    register a named checkpoint in one call.
    """

    _checkpoint_field = "generation_latest_checkpoint"

    def __init__(
        self,
        project_id: str,
        generation_id: str,
        canvas_id: str = "",
        generation_type: str = "",
        redis_repository: RedisRepository | None = None,
        ttl_seconds: int = LLM_GENERATION_JOB_HEARTBEAT_TTL_SECONDS,
        refresh_seconds: int = LLM_GENERATION_JOB_HEARTBEAT_REFRESH_SECONDS,
    ):
        super().__init__(
            project_id=project_id,
            job_id=generation_id,
            redis_key=f"{_KEY_PREFIX}:{project_id}:{generation_id}",
            redis_repository=redis_repository
            or RedisRepository(service_name="architecture_diagram"),
            ttl_seconds=ttl_seconds,
            refresh_seconds=refresh_seconds,
        )
        self.generation_id = generation_id
        self.canvas_id = canvas_id
        self.generation_type = generation_type

    def _build_payload(self, is_running: bool) -> dict:
        payload = super()._build_payload(is_running)
        payload["canvas_id"] = self.canvas_id
        payload["generation_type"] = self.generation_type
        return payload

    # ------------------------------------------------------------------
    # Checkpoint convenience
    # ------------------------------------------------------------------

    def record_checkpoint(
        self,
        name: str,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict | None:
        """Build a named checkpoint dict, store it in the heartbeat, and return it.

        Checkpoints are stored only in the Redis heartbeat (not persisted to
        MongoDB).  Returns ``None`` when *message* is empty.

        Args:
            name: Dot-separated checkpoint name, e.g. ``"pipeline.init"``.
            message: Human-readable description of the step.
            metadata: Optional extra data attached to the checkpoint.
        """
        if not message:
            return None

        checkpoint = {
            "name": name,
            "message": message,
            "timestamp_epoch": time.time(),
            "metadata": metadata or {},
        }
        self.touch(latest_checkpoint=checkpoint)
        return checkpoint
