from typing import Any

from engine_libs.llm_runtime.batch_client import BatchLlmClient
from engine_libs.llm_runtime.context import ENGINE_LLM_CONTEXT
from engine_libs.llm_runtime.contracts import LlmJobRequest
from langchain_core.messages import HumanMessage

from shared_libs.protocols import LlmJobRequestProtocol


def make_client(
    *,
    fake_mongo_store_cls: type,
    fake_batch_client_cls: type,
    mongo_store: Any = None,
    batch_client: Any = None,
    max_request_bytes: int = 1048576,
    stale_job_seconds: int = 60,
) -> BatchLlmClient:
    return BatchLlmClient(
        mongo_store=mongo_store or fake_mongo_store_cls(),
        batch_client=batch_client or fake_batch_client_cls(),
        job_queue="queue",
        job_definitions={"qwen3": "qwen-job-definition"},
        max_request_bytes=max_request_bytes,
        stale_job_seconds=stale_job_seconds,
    )


def make_request(request_id: str = "req-1") -> LlmJobRequestProtocol:
    return LlmJobRequest(
        request_id=request_id,
        attempt_id="",
        canonical_llm="qwen3",
        model_tag="qwen3:8b",
        messages=[HumanMessage(content=[{"type": "text", "text": "hello"}])],
        response_mode="json",
        queue_name=ENGINE_LLM_CONTEXT.queue_name,
        task_name=ENGINE_LLM_CONTEXT.task_name,
        task_type=ENGINE_LLM_CONTEXT.task_type,
        project_id="project-1",
    )
