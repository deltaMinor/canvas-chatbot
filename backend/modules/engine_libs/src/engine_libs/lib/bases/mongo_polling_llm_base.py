"""Mongo-backed hosted polling adapter for LLM invocation.

This module defines :class:`MongoPollingLLMBase`, which extends
``GeneralLLMBase`` to support asynchronous hosted execution with request/job
state persisted in MongoDB. It provides:

- deterministic request ID generation for deduplication,
- reusable running-job detection and wait logic,
- background hosted invocation execution, and
- conversion of stored results back into ``AIMessage`` responses.
"""

import hashlib
import logging
import time
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

from engine_libs.llm_runtime.config import get_batch_wait_timeout
from engine_libs.llm_runtime.context import LlmTaskContext
from engine_libs.llm_runtime.contracts import LlmJobRequest, encode_payload
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    message_to_dict,
)

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.mongo_polling_llm_context import MongoPollingLLMContext
from shared_libs.protocols import LlmJobRequestProtocol

from .general_llm_base import GeneralLLMBase

logger = logging.getLogger(__name__)
HOSTED_LLM_EXECUTOR = ThreadPoolExecutor(max_workers=16)


class MongoPollingLLMBase(GeneralLLMBase):
    """LLM wrapper that polls MongoDB for hosted async job completion."""

    @staticmethod
    def _assert_not_invalidated_document(
        *, document: dict | None, attempt_id: str, job_id: str
    ) -> None:
        """Raise when persisted document no longer matches the active attempt."""
        if document and document.get("attempt_id") != attempt_id:
            raise BadRequest(f"Hosted LLM job invalidated: {job_id}")

    @staticmethod
    def _assert_not_failed_job(*, job: dict, attempt_id: str, job_id: str) -> None:
        """Raise when the tracked hosted job has failed for the current attempt."""
        if (
            job.get("attempt_id") == attempt_id
            and job.get("batch_job_id") == job_id
            and job.get("status") == "FAILED"
        ):
            raise BadRequest(f"Hosted LLM job failed: {job_id}: {job.get('error', '')}")

    @staticmethod
    def _raise_wait_timeout(*, request_id: str) -> None:
        """Raise a timeout error for an unfinished hosted request."""
        raise BadRequest(f"Hosted LLM timed out waiting for request: {request_id}")

    def __init__(
        self,
        context: MongoPollingLLMContext,
    ):
        """Initialize hosted polling configuration from runtime context."""
        super().__init__(context.response_mode, name=context.name)
        self.canonical_llm = context.canonical_llm
        self.model_tag = str(context.llm_model_config.get("model_id", "")).strip()
        task_context: LlmTaskContext | None = context.task_context
        self.queue_name = task_context.queue_name if task_context else ""
        self.task_name = task_context.task_name if task_context else ""
        self.task_type = task_context.task_type if task_context else ""
        self.project_id = context.project_id
        self.assessment_id = context.assessment_id
        self.mongo_store = context.mongo_store
        self.progress_info_reporter = context.progress_info_reporter
        self.wait_timeout = context.wait_timeout or get_batch_wait_timeout()
        self._invoke_count = 0

    def _llm_progress_metadata(
        self,
        *,
        event: str,
        execution: str,
        request_id: str = "",
        job_id: str = "",
        duration_seconds: float | None = None,
        error: Exception | None = None,
        extra: dict | None = None,
    ) -> dict:
        metadata = {
            "checkpoint_name": f"llm.invoke.{event}",
            "event": event,
            "execution": execution,
            "canonical_llm": self.canonical_llm,
            "model_tag": self.model_tag,
            "project_id": self.project_id,
            "assessment_id": self.assessment_id,
            "request_id": request_id,
            "job_id": job_id,
            "invoke_count": self._invoke_count,
            "queue_name": self.queue_name,
            "task_name": self.task_name,
            "task_type": self.task_type,
        }
        if duration_seconds is not None:
            metadata["duration_seconds"] = round(duration_seconds, 3)
        if error is not None:
            metadata["error_type"] = error.__class__.__name__
            metadata["error_message"] = str(error)
        if extra:
            metadata.update(extra)
        return metadata

    def _report_llm_progress(
        self, progress_info: str, metadata: dict | None = None
    ) -> None:
        if self.progress_info_reporter is None:
            return
        try:
            self.progress_info_reporter(progress_info, metadata)
        except Exception:
            logger.exception(
                "Failed to update LLM progress info: project_id=%s request_id=%s",
                self.project_id,
                (metadata or {}).get("request_id", ""),
            )

    @staticmethod
    def _ai_message_from_result(result: dict) -> AIMessage:
        kwargs = {"content": result["content"]}
        usage_metadata = result.get("usage_metadata")
        if usage_metadata:
            kwargs["usage_metadata"] = usage_metadata
        return AIMessage(**kwargs)

    def _request_id(self, messages: list[BaseMessage]) -> str:
        """Build a deterministic request ID from invocation payload fields."""
        payload = {
            "canonical_llm": self.canonical_llm,
            "model_tag": self.model_tag,
            "messages": [message_to_dict(message) for message in messages],
            "project_id": self.project_id,
            "queue_name": self.queue_name,
            "task_name": self.task_name,
            "task_type": self.task_type,
            "invoke_count": self._invoke_count,
        }
        return f"llm-{hashlib.sha256(encode_payload(payload)).hexdigest()[:32]}"

    def _build_request(self, messages: list[BaseMessage]) -> LlmJobRequestProtocol:
        """Create a base request envelope prior to assigning an attempt ID."""
        return LlmJobRequest(
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
        )

    @staticmethod
    def _with_attempt_id(
        request: LlmJobRequestProtocol, attempt_id: str
    ) -> LlmJobRequestProtocol:
        """Clone an ``LlmJobRequest`` with a specific attempt identifier."""
        return LlmJobRequest(
            request_id=request.request_id,
            attempt_id=attempt_id,
            canonical_llm=request.canonical_llm,
            model_tag=request.model_tag,
            messages=request.messages,
            response_mode=request.response_mode,
            queue_name=request.queue_name,
            task_name=request.task_name,
            task_type=request.task_type,
            project_id=request.project_id,
            metadata=request.metadata,
        )

    @staticmethod
    def _coerce_messages(message) -> list[BaseMessage]:
        """Normalize raw input into a list of ``BaseMessage`` instances."""
        return (
            [HumanMessage(content=message)]
            if isinstance(message, str)
            else [m for m in message]
        )

    @staticmethod
    def _extract_usage_metadata(response) -> dict:
        """Return provider token usage from a LangChain response when available."""
        usage = getattr(response, "usage_metadata", None)
        if isinstance(usage, dict) and usage:
            return dict(usage)

        response_metadata = getattr(response, "response_metadata", None)
        if not isinstance(response_metadata, dict):
            return {}

        for key in ("token_usage", "usage_metadata"):
            usage = response_metadata.get(key)
            if isinstance(usage, dict) and usage:
                return dict(usage)

        ollama_usage = {
            "input_tokens": response_metadata.get("prompt_eval_count"),
            "output_tokens": response_metadata.get("eval_count"),
        }
        ollama_usage = {
            key: value for key, value in ollama_usage.items() if value is not None
        }
        if not ollama_usage:
            return {}
        input_tokens = ollama_usage.get("input_tokens")
        output_tokens = ollama_usage.get("output_tokens")
        if isinstance(input_tokens, int) and isinstance(output_tokens, int):
            ollama_usage["total_tokens"] = input_tokens + output_tokens
        return ollama_usage

    def _result_payload(
        self,
        *,
        request: LlmJobRequestProtocol,
        job_id: str,
        content,
        usage_metadata: dict | None = None,
    ):
        """Build persisted result payload for a completed hosted job."""
        payload = {
            "schema_version": request.to_payload()["schema_version"],
            "request_id": request.request_id,
            "attempt_id": request.attempt_id,
            "batch_job_id": job_id,
            "canonical_llm": request.canonical_llm,
            "model_tag": request.model_tag,
            "content": content,
        }
        if usage_metadata:
            payload["usage_metadata"] = usage_metadata
        return payload

    def _job_record(
        self,
        *,
        request: LlmJobRequestProtocol,
        job_id: str,
        status: str,
        submitted_at: float,
        completed_at: float | None = None,
        error: str | None = None,
    ) -> dict:
        """Build persisted job metadata for running/succeeded/failed states."""
        job = {
            "request_id": request.request_id,
            "schema_version": request.to_payload()["schema_version"],
            "attempt_id": request.attempt_id,
            "batch_job_id": job_id,
            "job_name": f"llm-{request.canonical_llm}-{request.request_id}",
            "canonical_llm": request.canonical_llm,
            "model_tag": request.model_tag,
            "queue_name": request.queue_name,
            "task_name": request.task_name,
            "task_type": request.task_type,
            "project_id": request.project_id,
            "submitted_at": submitted_at,
            "status": status,
            "execution": "hosted",
        }
        if completed_at is not None:
            job["completed_at"] = completed_at
        if error is not None:
            job["error"] = error
        return job

    def _run_hosted_job(
        self,
        *,
        request: LlmJobRequestProtocol,
        job_id: str,
        submitted_at: float,
        messages: list[BaseMessage],
    ) -> None:
        """Execute hosted LLM call and persist success/failure outcomes."""
        try:
            response = self.llm.invoke(messages)
            usage_metadata = self._extract_usage_metadata(response)
            result = self._result_payload(
                request=request,
                job_id=job_id,
                content=response.content,
                usage_metadata=usage_metadata,
            )
            self.mongo_store.put_job_result(
                request_id=request.request_id,
                attempt_id=request.attempt_id,
                job=self._job_record(
                    request=request,
                    job_id=job_id,
                    status="SUCCEEDED",
                    submitted_at=submitted_at,
                    completed_at=time.time(),
                ),
                result=result,
            )
        except Exception as exc:
            logger.exception(
                "Hosted LLM job failed: request_id=%s job_id=%s",
                request.request_id,
                job_id,
            )
            self.mongo_store.put_job_result(
                request_id=request.request_id,
                attempt_id=request.attempt_id,
                job=self._job_record(
                    request=request,
                    job_id=job_id,
                    status="FAILED",
                    submitted_at=submitted_at,
                    completed_at=time.time(),
                    error=str(exc),
                ),
            )

    def _wait_for_result(self, *, request: LlmJobRequestProtocol, job_id: str):
        """Poll MongoDB until a matching result arrives or timeout is reached."""
        deadline = time.monotonic() + self.wait_timeout
        while time.monotonic() < deadline:
            document = self.mongo_store.get_document(request.request_id)
            self._assert_not_invalidated_document(
                document=document,
                attempt_id=request.attempt_id,
                job_id=job_id,
            )
            result = (document or {}).get("result")
            if result is not None:
                if (
                    result.get("attempt_id") == request.attempt_id
                    and result.get("batch_job_id") == job_id
                    and result.get("model_tag") == request.model_tag
                ):
                    return result
            job = (document or {}).get("job") or {}
            self._assert_not_failed_job(
                job=job,
                attempt_id=request.attempt_id,
                job_id=job_id,
            )
            time.sleep(1)
        self._raise_wait_timeout(request_id=request.request_id)

    def _is_reusable_hosted_job(self, job: dict) -> bool:
        """Return whether an existing running job can still be reused."""
        if job.get("status") != "RUNNING":
            return False
        submitted_at = job.get("submitted_at")
        if not isinstance(submitted_at, int | float):
            return True
        return (time.time() - float(submitted_at)) <= self.wait_timeout

    @raise_exception(
        "Failed to invoke hosted polling llm model.", exception_logger=logger
    )
    def invoke(self, message):
        """Invoke hosted model flow with persistence, reuse checks, and polling.

        Falls back to direct model invocation when Mongo storage is unavailable.
        """
        messages = self._coerce_messages(message)
        self._invoke_count += 1
        if self.mongo_store is None:
            started_at = time.monotonic()
            self._report_llm_progress(
                "Direct LLM call started.",
                self._llm_progress_metadata(event="started", execution="direct"),
            )
            try:
                response = self.llm.invoke(messages)
                usage_metadata = self._extract_usage_metadata(response)
            except Exception as exc:
                self._report_llm_progress(
                    "Direct LLM call failed.",
                    self._llm_progress_metadata(
                        event="failed",
                        execution="direct",
                        duration_seconds=time.monotonic() - started_at,
                        error=exc,
                    ),
                )
                raise
            self._report_llm_progress(
                "Direct LLM call completed.",
                self._llm_progress_metadata(
                    event="succeeded",
                    execution="direct",
                    duration_seconds=time.monotonic() - started_at,
                    extra={"usage_metadata": usage_metadata}
                    if usage_metadata
                    else None,
                ),
            )
            return response

        request = self._build_request(messages)
        started_at = time.monotonic()
        self._report_llm_progress(
            "Hosted LLM call started.",
            self._llm_progress_metadata(
                event="started",
                execution="hosted",
                request_id=request.request_id,
            ),
        )
        existing_document = self.mongo_store.get_document(request.request_id)
        existing_job = (existing_document or {}).get("job") or {}
        existing_job_id = existing_job.get("batch_job_id")
        existing_attempt_id = existing_job.get("attempt_id")
        if (
            existing_job_id
            and existing_attempt_id
            and self._is_reusable_hosted_job(existing_job)
        ):
            request = self._with_attempt_id(request, existing_attempt_id)
            self._report_llm_progress(
                "Waiting for existing hosted LLM job.",
                self._llm_progress_metadata(
                    event="waiting",
                    execution="hosted",
                    request_id=request.request_id,
                    job_id=existing_job_id,
                    extra={"checkpoint_name": "llm.invoke.waiting"},
                ),
            )
            try:
                result = self._wait_for_result(request=request, job_id=existing_job_id)
            except Exception as exc:
                self._report_llm_progress(
                    "Hosted LLM call failed.",
                    self._llm_progress_metadata(
                        event="failed",
                        execution="hosted",
                        request_id=request.request_id,
                        job_id=existing_job_id,
                        duration_seconds=time.monotonic() - started_at,
                        error=exc,
                    ),
                )
                raise
            self._report_llm_progress(
                "Hosted LLM call completed.",
                self._llm_progress_metadata(
                    event="succeeded",
                    execution="hosted",
                    request_id=request.request_id,
                    job_id=existing_job_id,
                    duration_seconds=time.monotonic() - started_at,
                    extra={
                        key: value
                        for key, value in {
                            "reused_job": True,
                            "usage_metadata": result.get("usage_metadata"),
                        }.items()
                        if value
                    },
                ),
            )
            return self._ai_message_from_result(result)

        request = self._with_attempt_id(request, uuid4().hex)
        job_id = f"hosted-{self.canonical_llm}-{request.attempt_id[:16]}"
        submitted_at = time.time()
        self.mongo_store.put_request_document(request)
        self.mongo_store.put_job_record(
            self._job_record(
                request=request,
                job_id=job_id,
                status="RUNNING",
                submitted_at=submitted_at,
            )
        )
        HOSTED_LLM_EXECUTOR.submit(
            self._run_hosted_job,
            request=request,
            job_id=job_id,
            submitted_at=submitted_at,
            messages=messages,
        )
        self._report_llm_progress(
            "Hosted LLM job submitted. Waiting for result.",
            self._llm_progress_metadata(
                event="submitted",
                execution="hosted",
                request_id=request.request_id,
                job_id=job_id,
                extra={"checkpoint_name": "llm.invoke.submitted"},
            ),
        )
        try:
            result = self._wait_for_result(request=request, job_id=job_id)
        except Exception as exc:
            self._report_llm_progress(
                "Hosted LLM call failed.",
                self._llm_progress_metadata(
                    event="failed",
                    execution="hosted",
                    request_id=request.request_id,
                    job_id=job_id,
                    duration_seconds=time.monotonic() - started_at,
                    error=exc,
                ),
            )
            raise
        self._report_llm_progress(
            "Hosted LLM call completed.",
            self._llm_progress_metadata(
                event="succeeded",
                execution="hosted",
                request_id=request.request_id,
                job_id=job_id,
                duration_seconds=time.monotonic() - started_at,
                extra={"usage_metadata": result.get("usage_metadata")}
                if result.get("usage_metadata")
                else None,
            ),
        )
        return self._ai_message_from_result(result)
