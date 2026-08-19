import logging
import os
import time
from collections.abc import Callable
from dataclasses import replace
from typing import TYPE_CHECKING, Any
from uuid import uuid4

from engine_libs.llm_runtime.config import (
    get_batch_max_request_bytes,
    get_batch_stale_job_seconds,
)
from engine_libs.llm_runtime.contracts import (
    encode_request_payload,
    validate_result_payload,
)

from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.protocols import LlmJobRequestProtocol

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from shared_libs.protocols import LlmMongoStoreProtocol

LIVE_BATCH_STATUSES = {
    "SUBMITTING",
    "SUBMITTED",
    "PENDING",
    "RUNNABLE",
    "STARTING",
    "RUNNING",
}

FAILED_BATCH_STATUSES = {"FAILED"}
REASONING_ENV_NAME_BY_MODEL = {
    "qwen_3_8b_batch": "LLM_MODEL_QWEN_REASONING",
    "ministral_3_8b_batch": "LLM_MODEL_MINISTRAL_REASONING",
}
DATABASE_ENV_NAMES = (
    "DB_URL_MONGODB",
    "RR_DB_NAME",
    "REQUIRE_DB_AUTH",
    "DB_USERNAME",
    "DB_PASSWORD",
    "ASSESSMENT_JOBS_MONGO_COLLECTION",
    "LLM_BATCH_MONGO_COLLECTION",
)
SUBMISSION_RESERVATION_WAIT_SECONDS = 30
SUBMISSION_RESERVATION_POLL_SECONDS = 1


class BatchLlmClient:
    def __init__(
        self,
        *,
        mongo_store: "LlmMongoStoreProtocol",
        batch_client,
        job_queue: str,
        job_definitions: dict[str, str],
        max_request_bytes: int | None = None,
        stale_job_seconds: int | None = None,
    ):
        self.mongo_store = mongo_store
        self.batch_client = batch_client
        self.job_queue = job_queue
        self.job_definitions = job_definitions
        self.max_request_bytes = max_request_bytes or get_batch_max_request_bytes()
        self.stale_job_seconds = (
            stale_job_seconds
            if stale_job_seconds is not None
            else get_batch_stale_job_seconds()
        )

    def get_document(self, request_id: str) -> dict[str, Any] | None:
        return self.mongo_store.get_document(request_id)

    def put_request_document(self, request: LlmJobRequestProtocol) -> None:
        encode_request_payload(request, self.max_request_bytes)
        self.mongo_store.put_request_document(request)

    def put_job_record(self, job_record: dict[str, Any]) -> Any:
        return self.mongo_store.put_job_record(job_record)

    @staticmethod
    def get_runtime_environment_overrides(canonical_llm: str) -> list[dict[str, str]]:
        name = REASONING_ENV_NAME_BY_MODEL.get(canonical_llm)
        if not name or (value := os.getenv(name)) is None:
            return []
        return [{"name": name, "value": value}]

    @staticmethod
    def get_database_environment_overrides() -> list[dict[str, str]]:
        return [
            {"name": name, "value": value}
            for name in DATABASE_ENV_NAMES
            if (value := os.getenv(name)) is not None
        ]

    def submit_request(
        self,
        request: LlmJobRequestProtocol,
        *,
        before_submit: Callable[[], None] | None = None,
    ) -> dict[str, Any]:
        existing_document = self.get_document(request.request_id)
        existing_job = self.get_reusable_job_from_document(
            request=request,
            document=existing_document,
            log_prefix="existing live",
        )
        if existing_job:
            return existing_job

        job_definition = self.job_definitions.get(request.canonical_llm)
        if not job_definition:
            raise BadRequest(
                f"Batch job definition is not configured for model: "
                f"{request.canonical_llm}"
            )

        request = replace(request, attempt_id=uuid4().hex)
        if not self.mongo_store.reserve_request_submission(request):
            return self.wait_for_concurrent_submission(request)

        if before_submit:
            try:
                before_submit()
            except Exception:
                self.mongo_store.abort_request_attempt(
                    request_id=request.request_id,
                    attempt_id=request.attempt_id,
                    reason="assessment_inactive_before_batch_submit",
                )
                raise

        return self.submit_reserved_request(
            request=request,
            job_definition=job_definition,
        )

    def get_reusable_job_from_document(
        self,
        *,
        request: LlmJobRequestProtocol,
        document: dict[str, Any] | None,
        log_prefix: str,
    ) -> dict[str, Any] | None:
        existing_job = (document or {}).get("job")
        if not existing_job:
            return None

        existing_job_id = existing_job.get("batch_job_id")
        if existing_job_id and self.is_reusable_job(existing_job, existing_job_id):
            logger.info(
                "Reusing %s LLM Batch job: request_id=%s job_id=%s "
                "canonical_llm=%s model_tag=%s",
                log_prefix,
                request.request_id,
                existing_job_id,
                request.canonical_llm,
                request.model_tag,
            )
            return existing_job

        return None

    def wait_for_concurrent_submission(
        self, request: LlmJobRequestProtocol
    ) -> dict[str, Any]:
        deadline = time.monotonic() + SUBMISSION_RESERVATION_WAIT_SECONDS
        while time.monotonic() < deadline:
            existing_document = self.get_document(request.request_id)
            existing_job = self.get_reusable_job_from_document(
                request=request,
                document=existing_document,
                log_prefix="concurrently reserved",
            )
            if existing_job:
                return existing_job

            time.sleep(SUBMISSION_RESERVATION_POLL_SECONDS)

        raise BadRequest(
            f"LLM Batch request is already being submitted: {request.request_id}"
        )

    def submit_reserved_request(
        self,
        *,
        request: LlmJobRequestProtocol,
        job_definition: str,
    ) -> dict[str, Any]:
        logger.info(
            "Submitting LLM Batch job: request_id=%s canonical_llm=%s "
            "model_tag=%s job_queue=%s job_definition=%s",
            request.request_id,
            request.canonical_llm,
            request.model_tag,
            self.job_queue,
            job_definition,
        )
        try:
            response = self.batch_client.submit_job(
                jobName=f"llm-{request.canonical_llm}-{request.request_id}",
                jobQueue=self.job_queue,
                jobDefinition=job_definition,
                containerOverrides={
                    "environment": [
                        {"name": "REQUEST_ID", "value": request.request_id},
                        {"name": "ATTEMPT_ID", "value": request.attempt_id},
                        {"name": "MODEL_TAG", "value": request.model_tag},
                        *self.get_database_environment_overrides(),
                        *self.get_runtime_environment_overrides(request.canonical_llm),
                    ]
                },
            )
        except Exception as exc:
            self.put_job_record(
                {
                    "request_id": request.request_id,
                    "schema_version": request.to_payload()["schema_version"],
                    "attempt_id": request.attempt_id,
                    "batch_job_id": None,
                    "job_name": None,
                    "canonical_llm": request.canonical_llm,
                    "model_tag": request.model_tag,
                    "queue_name": request.queue_name,
                    "task_name": request.task_name,
                    "task_type": request.task_type,
                    "project_id": request.project_id,
                    "submitted_at": time.time(),
                    "status": "FAILED",
                    "error": str(exc),
                }
            )
            raise
        job_record = {
            "request_id": request.request_id,
            "schema_version": request.to_payload()["schema_version"],
            "attempt_id": request.attempt_id,
            "batch_job_id": response["jobId"],
            "job_name": response.get("jobName"),
            "canonical_llm": request.canonical_llm,
            "model_tag": request.model_tag,
            "queue_name": request.queue_name,
            "task_name": request.task_name,
            "task_type": request.task_type,
            "project_id": request.project_id,
            "submitted_at": time.time(),
            "status": "SUBMITTED",
        }
        update_result = self.put_job_record(job_record)
        if getattr(update_result, "matched_count", 0) != 1:
            self.stop_submitted_job(
                job_id=job_record["batch_job_id"],
                reason="LLM Batch attempt was invalidated before job record write.",
            )
            raise BadRequest(
                "LLM Batch job was invalidated before submission completed: "
                f"{request.request_id}"
            )
        logger.info(
            "Submitted LLM Batch job: request_id=%s job_id=%s job_name=%s",
            request.request_id,
            job_record["batch_job_id"],
            job_record.get("job_name"),
        )
        return job_record

    def stop_submitted_job(self, *, job_id: str, reason: str) -> None:
        try:
            self.batch_client.cancel_job(jobId=job_id, reason=reason)
            return
        except Exception:
            logger.exception(
                "Failed to cancel LLM Batch job after invalidated submit: job_id=%s",
                job_id,
            )

        try:
            self.batch_client.terminate_job(jobId=job_id, reason=reason)
        except Exception:
            logger.exception(
                "Failed to terminate LLM Batch job after invalidated submit: job_id=%s",
                job_id,
            )

    def is_reusable_job(self, job_record: dict[str, Any], job_id: str) -> bool:
        job = self.describe_job(job_id)
        status = (job or {}).get("status")
        if status not in LIVE_BATCH_STATUSES:
            return False

        submitted_at = self.get_job_submitted_at(job_record, job)
        if submitted_at is None:
            return True

        age_seconds = time.time() - submitted_at
        if age_seconds <= self.stale_job_seconds:
            return True

        logger.warning(
            "Invalidating stale LLM Batch job: request_id=%s job_id=%s "
            "status=%s age_seconds=%.1f stale_job_seconds=%s",
            job_record.get("request_id"),
            job_id,
            status,
            age_seconds,
            self.stale_job_seconds,
        )
        return False

    @staticmethod
    def get_job_submitted_at(
        job_record: dict[str, Any],
        described_job: dict[str, Any] | None,
    ) -> float | None:
        submitted_at = job_record.get("submitted_at")
        if isinstance(submitted_at, int | float):
            return float(submitted_at)

        created_at_ms = (described_job or {}).get("createdAt")
        if isinstance(created_at_ms, int | float):
            return float(created_at_ms) / 1000

        return None

    def is_live_job(self, job_id: str) -> bool:
        status = self.describe_job_status(job_id)
        return status in LIVE_BATCH_STATUSES

    def describe_job(self, job_id: str) -> dict[str, Any] | None:
        response = self.batch_client.describe_jobs(jobs=[job_id])
        jobs = response.get("jobs") or []
        if not jobs:
            return None
        return jobs[0]

    def describe_job_status(self, job_id: str) -> str | None:
        job = self.describe_job(job_id)
        return job.get("status") if job else None

    def get_result(
        self,
        *,
        request_id: str,
        attempt_id: str,
        batch_job_id: str,
        model_tag: str,
    ) -> dict[str, Any] | None:
        document = self.get_document(request_id)
        payload = (document or {}).get("result")
        if payload is None:
            return None
        try:
            return validate_result_payload(
                payload,
                request_id=request_id,
                attempt_id=attempt_id,
                batch_job_id=batch_job_id,
                model_tag=model_tag,
            )
        except BadRequest as exc:
            if "attempt_id mismatch" in str(exc) or "batch_job_id mismatch" in str(exc):
                logger.info(
                    "Ignoring stale LLM Batch result: request_id=%s "
                    "expected_attempt_id=%s expected_job_id=%s",
                    request_id,
                    attempt_id,
                    batch_job_id,
                )
                return None
            raise

    def wait_for_result(
        self,
        *,
        job_record: dict[str, Any],
        request_id: str,
        model_tag: str,
        timeout_seconds: int,
        poll_seconds: int = 5,
        status_callback: Callable[[str, str], None] | None = None,
    ) -> dict[str, Any]:
        deadline = time.monotonic() + timeout_seconds
        job_id = job_record["batch_job_id"]
        attempt_id = job_record["attempt_id"]
        last_reported_status: str | None = None

        while time.monotonic() < deadline:
            document = self.get_document(request_id)
            if document and document.get("attempt_id") != attempt_id:
                raise BadRequest(f"LLM Batch job invalidated: {job_id}")

            result = self.get_result(
                request_id=request_id,
                attempt_id=attempt_id,
                batch_job_id=job_id,
                model_tag=model_tag,
            )
            if result is not None:
                return result

            status = self.describe_job_status(job_id)
            if status and status != last_reported_status:
                if status_callback:
                    status_callback(status, job_id)
                last_reported_status = status
            if status in FAILED_BATCH_STATUSES:
                raise BadRequest(f"LLM Batch job failed: {job_id}")
            if status == "SUCCEEDED":
                raise BadRequest(f"LLM Batch result missing for request: {request_id}")

            time.sleep(poll_seconds)

        raise BadRequest(f"LLM Batch timed out waiting for request: {request_id}")
