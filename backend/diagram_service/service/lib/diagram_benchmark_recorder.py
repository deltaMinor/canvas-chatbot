"""Diagram-generation-specific benchmark recorder."""

import logging
from datetime import datetime, tzinfo
from typing import Any

from shared_libs.lib.pipeline_job import PipelineBenchmarkRecorder

logger = logging.getLogger(__name__)


class DiagramBenchmarkRecorder(PipelineBenchmarkRecorder):
    """Persist diagram generation benchmark status and checkpoints in project_ad.

    Checkpoints are stored under ``ref.llm_generation_benchmark`` — a field
    separate from ``ref.llm_generation``, which the engine tasks manage directly.
    """

    DEFAULT_START_MESSAGE = "Diagram generation queued."
    DEFAULT_COMPLETED_MESSAGE = "Diagram generation completed."
    DEFAULT_FAILED_MESSAGE = "Diagram generation failed. Check worker logs for details."
    DEFAULT_ABORTED_MESSAGE = "Diagram generation aborted."

    _checkpoints_push_field = "ref.llm_generation_benchmark.checkpoints"

    def __init__(
        self,
        *,
        project_ad_service,
        project_id: str,
        canvas_id: str,
        generation_id: str,
        generation_type: str = "",
        user_info: dict | None = None,
        tzinfo_override: tzinfo | None = None,
    ):
        super().__init__(
            project_id=project_id,
            job_id=generation_id,
            user_info=user_info,
            tzinfo_override=tzinfo_override,
        )
        self.project_ad_service = project_ad_service
        self.canvas_id = canvas_id
        self.generation_id = generation_id
        self.generation_type = generation_type

    # ------------------------------------------------------------------
    # Template method implementations
    # ------------------------------------------------------------------

    def _build_start_payload(
        self,
        timestamp: datetime,
        timestamp_epoch: float,
        metadata: dict[str, Any] | None,
    ) -> dict:
        return {
            "ref.llm_generation_benchmark": {
                "generation_id": self.generation_id,
                "canvas_id": self.canvas_id,
                "generation_type": self.generation_type,
                "started_at": timestamp,
                "started_at_epoch": timestamp_epoch,
                "status": "running",
                "metadata": metadata or {},
                "checkpoints": [],
            }
        }

    def _build_finish_payload(
        self,
        status: str,
        timestamp: datetime,
        timestamp_epoch: float,
    ) -> dict:
        return {
            "ref.llm_generation_benchmark.status": status,
            "ref.llm_generation_benchmark.finished_at": timestamp,
            "ref.llm_generation_benchmark.finished_at_epoch": timestamp_epoch,
        }

    def _get_next_step_index(self) -> int:
        try:
            db_project_ad = self.project_ad_service.get_one(
                {"project_id": self.project_id},
                projection={"ref.llm_generation_benchmark.checkpoints": 1},
                override_projection=True,
                user_info=self.user_info,
            )
            checkpoints = (
                ((db_project_ad or {}).get("ref") or {})
                .get("llm_generation_benchmark", {})
                .get("checkpoints", [])
            )
            return len(checkpoints)
        except Exception:
            logger.exception(
                "Failed to read diagram benchmark checkpoint count:"
                " project_id=%s generation_id=%s",
                self.project_id,
                self.generation_id,
            )
            return 0

    def _safe_update(
        self,
        *,
        payload: dict,
        operator: str | None = None,
    ) -> None:
        try:
            kwargs: dict[str, Any] = {"filter": {"project_id": self.project_id}}
            if operator:
                kwargs["operator"] = operator
            self.project_ad_service.update_one(
                **kwargs,
                payload=payload,
                user_info=self.user_info,
            )
        except Exception:
            logger.exception(
                "Failed to record diagram benchmark checkpoint:"
                " project_id=%s generation_id=%s payload_keys=%s",
                self.project_id,
                self.generation_id,
                list(payload.keys()),
            )
