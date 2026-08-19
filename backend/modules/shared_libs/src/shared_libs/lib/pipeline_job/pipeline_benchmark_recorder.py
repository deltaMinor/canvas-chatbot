"""Base benchmark recorder for pipeline runs.

Subclasses supply the four things that differ between pipelines:

* ``DEFAULT_*`` message class variables — human-readable status strings.
* ``_checkpoints_push_field`` — the MongoDB dot-path used to ``$push`` new
  checkpoints, e.g. ``"assessment.benchmark.checkpoints"``.
* ``_build_start_payload`` / ``_build_finish_payload`` — the document shapes
  written on pipeline start and finish respectively.
* ``_get_next_step_index`` / ``_safe_update`` — service-specific DB access.

Everything else — ``_now``, ``record_checkpoint``, ``record_messages``,
``finish``, and ``_coerce_messages`` — is identical across pipelines and lives
here.
"""

import logging
import time
from datetime import datetime, tzinfo
from typing import Any

from shared_libs.config import DEFAULT_TZINFO
from shared_libs.constants.system import SYSTEM_USER_INFO

logger = logging.getLogger(__name__)


class PipelineBenchmarkRecorder:
    """Record benchmark status and checkpoints for a single pipeline run.

    Args:
        project_id: The project this run belongs to.
        job_id: A run-scoped identifier used in log messages (e.g.
            ``assessment_id`` or ``generation_id``).
        user_info: User context forwarded to every DB write.
        tzinfo_override: Override the default timezone for timestamp fields.
    """

    # Subclasses override with pipeline-specific wording.
    DEFAULT_START_MESSAGE: str = "Pipeline queued."
    DEFAULT_COMPLETED_MESSAGE: str = "Pipeline completed."
    DEFAULT_FAILED_MESSAGE: str = "Pipeline failed. Check worker logs for details."
    DEFAULT_ABORTED_MESSAGE: str = "Pipeline aborted."

    # Subclasses set this to the dot-path used when pushing individual
    # checkpoint dicts, e.g. ``"assessment.benchmark.checkpoints"``.
    _checkpoints_push_field: str

    def __init__(
        self,
        *,
        project_id: str,
        job_id: str = "",
        user_info: dict | None = None,
        tzinfo_override: tzinfo | None = None,
    ):
        self.project_id = project_id
        self.job_id = job_id
        self.user_info = user_info or SYSTEM_USER_INFO
        self.tzinfo = tzinfo_override or DEFAULT_TZINFO

    # ------------------------------------------------------------------
    # Template methods — subclasses must implement
    # ------------------------------------------------------------------

    def _build_start_payload(
        self,
        timestamp: datetime,
        timestamp_epoch: float,
        metadata: dict[str, Any] | None,
    ) -> dict:
        """Return the document payload written to the DB on ``start()``."""
        raise NotImplementedError

    def _build_finish_payload(
        self,
        status: str,
        timestamp: datetime,
        timestamp_epoch: float,
    ) -> dict:
        """Return the document payload written to the DB on ``finish()``."""
        raise NotImplementedError

    def _get_next_step_index(self) -> int:
        """Return the 0-based index for the next checkpoint (current count)."""
        raise NotImplementedError

    def _safe_update(
        self,
        *,
        payload: dict,
        operator: str | None = None,
    ) -> None:
        """Persist *payload* to the backing store, swallowing and logging errors."""
        raise NotImplementedError

    # ------------------------------------------------------------------
    # Shared implementations
    # ------------------------------------------------------------------

    def _now(self) -> tuple[datetime, float]:
        return datetime.now(self.tzinfo), time.time()

    def start(
        self,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict | None:
        timestamp, timestamp_epoch = self._now()
        self._safe_update(
            payload=self._build_start_payload(timestamp, timestamp_epoch, metadata)
        )
        return self.record_checkpoint(
            "pipeline.start",
            message=message or self.DEFAULT_START_MESSAGE,
            metadata=metadata,
        )

    def record_checkpoint(
        self,
        name: str,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict | None:
        if not message:
            return None

        timestamp, timestamp_epoch = self._now()
        checkpoint = {
            "step_index": self._get_next_step_index(),
            "name": name,
            "timestamp": timestamp.isoformat(),
            "timestamp_epoch": timestamp_epoch,
            "message": message,
            "metadata": metadata or {},
        }
        self._safe_update(
            payload={self._checkpoints_push_field: checkpoint},
            operator="$push",
        )
        return checkpoint

    def record_messages(
        self,
        name: str,
        messages: str | list[str] | tuple[str, ...] | None,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> list[dict]:
        checkpoints = []
        for message in self._coerce_messages(messages):
            checkpoint = self.record_checkpoint(
                name,
                message=message,
                metadata=metadata,
            )
            if checkpoint:
                checkpoints.append(checkpoint)
        return checkpoints

    def finish(
        self,
        status: str,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict | None:
        timestamp, timestamp_epoch = self._now()
        finish_message = message
        if not finish_message and status == "completed":
            finish_message = self.DEFAULT_COMPLETED_MESSAGE
        elif not finish_message and status == "failed":
            finish_message = self.DEFAULT_FAILED_MESSAGE
        elif not finish_message and status == "aborted":
            finish_message = self.DEFAULT_ABORTED_MESSAGE
        checkpoint = self.record_checkpoint(
            f"pipeline.{status}",
            message=finish_message,
            metadata=metadata,
        )
        self._safe_update(
            payload=self._build_finish_payload(status, timestamp, timestamp_epoch)
        )
        return checkpoint

    @staticmethod
    def _coerce_messages(
        messages: str | list[str] | tuple[str, ...] | None,
    ) -> list[str]:
        if not messages:
            return []
        if isinstance(messages, str):
            return [messages]
        return [message for message in messages if message]
