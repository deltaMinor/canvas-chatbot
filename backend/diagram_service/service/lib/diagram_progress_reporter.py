"""Diagram-generation-specific progress reporter."""

from service.lib.diagram_benchmark_recorder import DiagramBenchmarkRecorder
from service.lib.diagram_generation_job_tracker import DiagramGenerationJobTracker

from shared_libs.lib.pipeline_job import PipelineProgressReporter


class DiagramProgressReporter(PipelineProgressReporter):
    """Facade for progress and checkpoint updates during diagram generation execution.

    Extends ``PipelineProgressReporter`` with no additional methods — diagram
    generation has no percentage-based progress, so ``start``, ``record_checkpoint``,
    and ``finish`` from the base are the complete interface.
    """

    def __init__(
        self,
        *,
        project_ad_service,
        project_id: str,
        canvas_id: str,
        generation_id: str,
        generation_type: str = "",
        user_info: dict | None = None,
        tracker: DiagramGenerationJobTracker | None = None,
    ):
        super().__init__(
            tracker=tracker
            or DiagramGenerationJobTracker(
                project_id=project_id,
                generation_id=generation_id,
                canvas_id=canvas_id,
                generation_type=generation_type,
            ),
            benchmark_recorder=DiagramBenchmarkRecorder(
                project_ad_service=project_ad_service,
                project_id=project_id,
                canvas_id=canvas_id,
                generation_id=generation_id,
                generation_type=generation_type,
                user_info=user_info,
            ),
        )
