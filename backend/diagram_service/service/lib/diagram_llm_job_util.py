from shared_libs.config.llm_generation_config import (
    LLM_GENERATION_JOB_RESERVATION_STALE_SECONDS,
    LLM_GENERATION_JOB_RESERVATION_TTL_SECONDS,
)
from shared_libs.lib.pipeline_job import PipelineJobUtil


class DiagramLLMJobUtil(PipelineJobUtil):
    """Heartbeat queries and start-reservation management for diagram generation pipeline runs."""

    _redis_service_name = "architecture_diagram"
    _heartbeat_key_prefix = "architecture_diagram:llm_generation_job"
    _reservation_key_prefix = "architecture_diagram:generation_job_reservation"
    _reservation_ttl_seconds = LLM_GENERATION_JOB_RESERVATION_TTL_SECONDS
    _reservation_stale_seconds = LLM_GENERATION_JOB_RESERVATION_STALE_SECONDS
