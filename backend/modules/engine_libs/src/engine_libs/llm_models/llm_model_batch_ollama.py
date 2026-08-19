import hashlib
import logging
import time

import boto3
from engine_libs.lib.bases import MongoPollingLLMBase
from engine_libs.llm_runtime.batch_client import BatchLlmClient
from engine_libs.llm_runtime.config import (
    get_batch_job_definitions,
    get_batch_job_queue,
)
from engine_libs.llm_runtime.contracts import LlmJobRequest, encode_payload
from engine_libs.utils.llm_model_assert_util import LLMModelAssertUtil
from langchain_core.messages import (
    BaseMessage,
    message_to_dict,
)

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.mongo_polling_llm_context import MongoPollingLLMContext
from shared_libs.protocols import LlmMongoStoreProtocol

logger = logging.getLogger(__name__)


class BatchOllamaPollingLLM(MongoPollingLLMBase):
    @staticmethod
    def _assert_batch_job_queue_required(*, job_queue: str) -> None:
        if not job_queue:
            raise BadRequest("LLM_BATCH_JOB_QUEUE is required for Batch LLM execution")

    def _assert_batch_job_definition_configured(self, *, job_definitions: dict) -> None:
        if not job_definitions.get(self.canonical_llm):
            raise BadRequest(
                f"Batch job definition is not configured for model: "
                f"{self.canonical_llm}"
            )

    def _assert_generation_still_active(self, *, heartbeat: dict | None) -> None:
        if heartbeat:
            return
        raise BadRequest(
            "LLM generation is no longer active; skipping LLM Batch job submission."
        )

    @staticmethod
    def _assert_no_image_part(*, part: dict) -> None:
        if isinstance(part, dict) and part.get("type") == "image_url":
            raise BadRequest(
                "MODEL_CAPABILITY_UNSUPPORTED: Batch Ollama models do not support image payloads in v1"
            )

    def __init__(
        self,
        context: MongoPollingLLMContext,
    ):
        LLMModelAssertUtil.assert_context_model_id_required(
            context=context,
            model_type="batch",
        )
        super().__init__(context)
        self.generation_heartbeat_getter = context.generation_heartbeat_getter
        LLMModelAssertUtil.assert_mongo_store_required(
            mongo_store=context.mongo_store,
            message="mongo_store is required for Batch LLM execution",
        )
        self.batch_client = self._build_batch_client(
            mongo_store=context.mongo_store,
        )

    def _build_batch_client(
        self,
        *,
        mongo_store: "LlmMongoStoreProtocol | None" = None,
    ) -> BatchLlmClient:
        job_queue = get_batch_job_queue()
        job_definitions = get_batch_job_definitions()
        self._assert_batch_job_queue_required(job_queue=job_queue)
        self._assert_batch_job_definition_configured(job_definitions=job_definitions)
        LLMModelAssertUtil.assert_mongo_store_required(
            mongo_store=mongo_store,
            message="mongo_store is required for Batch LLM execution",
        )
        return BatchLlmClient(
            mongo_store=mongo_store,
            batch_client=boto3.client("batch"),
            job_queue=job_queue,
            job_definitions=job_definitions,
        )

    def _assert_generation_is_active(self) -> None:
        if self.generation_heartbeat_getter is None:
            return
        heartbeat = self.generation_heartbeat_getter()
        self._assert_generation_still_active(heartbeat=heartbeat)

    def _report_batch_status(
        self, status: str, job_id: str, request_id: str = ""
    ) -> None:
        if status in {"SUBMITTED", "PENDING", "RUNNABLE", "STARTING"}:
            progress_info = "Waiting for LLM Batch job to start."
        elif status == "RUNNING":
            progress_info = "LLM Batch job started. Waiting for job to complete."
        else:
            progress_info = f"LLM Batch job status: {status}."
        logger.info(
            "[ LLM-BATCH ] LLM Batch status update: request_job_id=%s status=%s progress_info=%s",
            job_id,
            status,
            progress_info,
        )
        self._report_llm_progress(
            progress_info,
            self._llm_progress_metadata(
                event="status",
                execution="batch",
                request_id=request_id,
                job_id=job_id,
                extra={
                    "checkpoint_name": "llm.batch.status",
                    "batch_status": status,
                },
            ),
        )

    @staticmethod
    def _assert_supported_messages(messages: list[BaseMessage]) -> None:
        for message in messages:
            if not isinstance(message.content, list):
                continue
            for part in message.content:
                BatchOllamaPollingLLM._assert_no_image_part(part=part)

    def _request_id(self, messages: list[BaseMessage]) -> str:
        payload = {
            "canonical_llm": self.canonical_llm,
            "model_tag": self.model_tag,
            "messages": [message_to_dict(message) for message in messages],
            "project_id": self.project_id,
            "assessment_id": self.assessment_id,
            "queue_name": self.queue_name,
            "task_name": self.task_name,
            "task_type": self.task_type,
            "invoke_count": self._invoke_count,
        }
        return f"llm-{hashlib.sha256(encode_payload(payload)).hexdigest()[:32]}"

    @raise_exception(
        "Failed to invoke batch ollama model.",
        exception_logger=logger,
    )
    def invoke(self, message):
        messages: list[BaseMessage] = self._coerce_messages(message)
        self._assert_supported_messages(messages)
        self._invoke_count += 1
        request = LlmJobRequest(
            request_id=self._request_id(messages),
            attempt_id="",
            canonical_llm=self.canonical_llm,
            model_tag=self.model_tag,
            messages=messages,
            response_mode=self.response_mode,
            queue_name=self.queue_name,
            task_name=self.task_name,
            task_type=self.task_type,
            project_id=self.project_id,
            metadata={"assessment_id": self.assessment_id},
        )
        started_at = time.monotonic()
        self._report_llm_progress(
            "LLM Batch call started.",
            self._llm_progress_metadata(
                event="started",
                execution="batch",
                request_id=request.request_id,
            ),
        )
        job_record = None
        try:
            self._assert_generation_is_active()
            job_record = self.batch_client.submit_request(
                request,
                before_submit=self._assert_generation_is_active,
            )
            job_id = job_record.get("batch_job_id", "")
            self._report_llm_progress(
                "LLM Batch job submitted. Waiting for result.",
                self._llm_progress_metadata(
                    event="submitted",
                    execution="batch",
                    request_id=request.request_id,
                    job_id=job_id,
                    extra={
                        "checkpoint_name": "llm.invoke.submitted",
                        "attempt_id": job_record.get("attempt_id", ""),
                        "batch_status": job_record.get("status", ""),
                    },
                ),
            )
            result = self.batch_client.wait_for_result(
                job_record=job_record,
                request_id=request.request_id,
                model_tag=self.model_tag,
                timeout_seconds=self.wait_timeout,
                status_callback=lambda status, job_id: self._report_batch_status(
                    status,
                    job_id,
                    request.request_id,
                ),
            )
        except Exception as exc:
            self._report_llm_progress(
                "LLM Batch call failed.",
                self._llm_progress_metadata(
                    event="failed",
                    execution="batch",
                    request_id=request.request_id,
                    job_id=(job_record or {}).get("batch_job_id", ""),
                    duration_seconds=time.monotonic() - started_at,
                    error=exc,
                ),
            )
            raise
        self._report_llm_progress(
            "LLM Batch call completed.",
            self._llm_progress_metadata(
                event="succeeded",
                execution="batch",
                request_id=request.request_id,
                job_id=job_record.get("batch_job_id", ""),
                duration_seconds=time.monotonic() - started_at,
                extra={
                    key: value
                    for key, value in {
                        "attempt_id": job_record.get("attempt_id", ""),
                        "batch_status": "SUCCEEDED",
                        "usage_metadata": result.get("usage_metadata"),
                    }.items()
                    if value
                },
            ),
        )
        return self._ai_message_from_result(result)
