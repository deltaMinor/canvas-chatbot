"""Base facade for coordinating a pipeline heartbeat tracker and benchmark recorder."""

from typing import Any

from shared_libs.protocols import (
    PipelineBenchmarkRecorderProtocol,
    PipelineTrackerProtocol,
)


class PipelineProgressReporter:
    """Coordinate checkpoint and lifecycle updates across a tracker and a recorder.

    Subclasses supply a concrete ``tracker`` (a ``PipelineJobTracker`` subclass)
    and a concrete ``benchmark_recorder`` (e.g. ``AssessmentBenchmarkRecorder``
    or ``DiagramBenchmarkRecorder``) by calling ``super().__init__`` with both
    objects.  All common lifecycle methods live here; subclass-specific extras
    (e.g. ``set_progress`` for assessments) are added in the subclass.

    The ``start()`` default message falls back to
    ``self.benchmark_recorder.DEFAULT_START_MESSAGE`` so each recorder can
    advertise its own sensible default without the base needing to know it.
    """

    def __init__(
        self,
        *,
        tracker: PipelineTrackerProtocol,
        benchmark_recorder: PipelineBenchmarkRecorderProtocol,
    ) -> None:
        self.tracker = tracker
        self.benchmark_recorder = benchmark_recorder

    # ------------------------------------------------------------------
    # Common lifecycle methods
    # ------------------------------------------------------------------

    def start(
        self,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        checkpoint = self.benchmark_recorder.start(
            message=message or self.benchmark_recorder.DEFAULT_START_MESSAGE,
            metadata=metadata,
        )
        self.tracker.start()
        if checkpoint:
            self.tracker.touch(latest_checkpoint=checkpoint)

    def record_checkpoint(
        self,
        name: str,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        checkpoint = self.benchmark_recorder.record_checkpoint(
            name,
            message=message,
            metadata=metadata,
        )
        if checkpoint:
            self.tracker.touch(latest_checkpoint=checkpoint)

    def finish(
        self,
        status: str,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        checkpoint = self.benchmark_recorder.finish(
            status,
            message=message,
            metadata=metadata,
        )
        if status == "failed":
            self.tracker.fail(latest_checkpoint=checkpoint)
        elif status == "completed":
            self.tracker.complete(latest_checkpoint=checkpoint)
        elif checkpoint:
            self.tracker.touch(latest_checkpoint=checkpoint)

    # ------------------------------------------------------------------
    # Helper
    # ------------------------------------------------------------------

    @staticmethod
    def _latest_checkpoint(checkpoints: list[dict]) -> dict | None:
        return checkpoints[-1] if checkpoints else None
