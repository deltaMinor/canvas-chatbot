import json
import logging
import time
from collections.abc import Callable
from dataclasses import replace
from typing import TYPE_CHECKING, Any
from uuid import uuid4

from engine_libs.llm_runtime.bedrock_converse_codec import (
    extract_converse_text,
    extract_converse_usage_metadata,
    to_bedrock_messages,
)
from engine_libs.llm_runtime.contracts import SCHEMA_VERSION
from langchain_core.messages import messages_from_dict
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.protocols import LlmJobRequestProtocol

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from shared_libs.protocols import LlmMongoStoreProtocol

# AWS Bedrock model-invocation-job status values. Anything not listed here
# (Submitted/Validating/Scheduled/InProgress/Stopping) is treated as "still running".
TERMINAL_SUCCESS_STATUSES = {"Completed", "PartiallyCompleted"}
TERMINAL_FAILURE_STATUSES = {"Failed", "Stopped", "Expired"}

SUBMISSION_RESERVATION_WAIT_SECONDS = 30
SUBMISSION_RESERVATION_POLL_SECONDS = 1


class BedrockBatchClient:
    """Submits/polls AWS Bedrock native batch inference jobs.

    Supports two submission strategies selected per call: ``per_request``
    (one Bedrock batch job per LLM call, mirroring the repo's internal AWS
    Batch ``batch`` mode) and ``bulk`` (many pending calls for the same
    model are grouped into one larger Bedrock batch job and demuxed back to
    each caller by recordId == request_id).

    The claim-then-submit transition (PENDING_BULK -> CLAIMED, an atomic
    per-document update) is what prevents double-submission in the bulk
    path, not the flush lease lock acquired in ``_acquire_flush_lock`` — the
    lock only reduces redundant flush attempts across concurrently polling
    callers; two racing flushers reading an overlapping candidate set can
    still only ever claim disjoint documents.
    """

    def __init__(
        self,
        *,
        mongo_store: "LlmMongoStoreProtocol",
        bedrock_client,
        s3_client,
        bucket: str,
        role_arn: str,
        min_records: int,
        max_records: int,
        max_wait_seconds: int,
        job_timeout_seconds: int,
        poll_seconds: int,
        lock_lease_seconds: int,
    ):
        self.mongo_store = mongo_store
        self.bedrock_client = bedrock_client
        self.s3_client = s3_client
        self.bucket = bucket
        self.role_arn = role_arn
        self.min_records = min_records
        self.max_records = max_records
        self.max_wait_seconds = max_wait_seconds
        self.job_timeout_seconds = job_timeout_seconds
        self.poll_seconds = poll_seconds
        self.lock_lease_seconds = lock_lease_seconds

    def submit_and_wait(
        self,
        request: LlmJobRequestProtocol,
        model_id: str,
        *,
        strategy: str,
        status_callback: Callable[[str, str], None] | None = None,
    ) -> dict[str, Any]:
        if strategy == "per_request":
            return self._submit_and_wait_per_request(
                request, model_id, status_callback=status_callback
            )
        return self._submit_and_wait_bulk(
            request, model_id, status_callback=status_callback
        )

    # ------------------------------------------------------------------
    # per_request strategy
    # ------------------------------------------------------------------

    def _submit_and_wait_per_request(
        self,
        request: LlmJobRequestProtocol,
        model_id: str,
        *,
        status_callback: Callable[[str, str], None] | None,
    ) -> dict[str, Any]:
        existing_document = self.mongo_store.get_document(request.request_id)
        existing_job = self._reusable_per_request_job(existing_document)
        if existing_job:
            request = replace(request, attempt_id=existing_job["attempt_id"])
            return self._poll_per_request_job(
                request=request,
                job_arn=existing_job["bedrock_job_arn"],
                output_s3_uri=existing_job["output_s3_uri"],
                status_callback=status_callback,
            )

        request = replace(request, attempt_id=uuid4().hex)
        if not self.mongo_store.reserve_request_submission(request):
            return self._wait_for_concurrent_submission(
                request, status_callback=status_callback
            )

        job_record = self._submit_single_record_job(request=request, model_id=model_id)
        return self._poll_per_request_job(
            request=request,
            job_arn=job_record["bedrock_job_arn"],
            output_s3_uri=job_record["output_s3_uri"],
            status_callback=status_callback,
        )

    @staticmethod
    def _reusable_per_request_job(document: dict | None) -> dict | None:
        job = (document or {}).get("job") or {}
        if job.get("bedrock_job_arn") and job.get("status") == "SUBMITTED":
            return job
        return None

    def _wait_for_concurrent_submission(
        self,
        request: LlmJobRequestProtocol,
        *,
        status_callback: Callable[[str, str], None] | None,
    ) -> dict[str, Any]:
        deadline = time.monotonic() + SUBMISSION_RESERVATION_WAIT_SECONDS
        while time.monotonic() < deadline:
            document = self.mongo_store.get_document(request.request_id)
            job = self._reusable_per_request_job(document)
            if job:
                claimed_request = replace(request, attempt_id=job["attempt_id"])
                return self._poll_per_request_job(
                    request=claimed_request,
                    job_arn=job["bedrock_job_arn"],
                    output_s3_uri=job["output_s3_uri"],
                    status_callback=status_callback,
                )
            time.sleep(SUBMISSION_RESERVATION_POLL_SECONDS)
        raise BadRequest(
            f"Bedrock batch request is already being submitted: {request.request_id}"
        )

    def _submit_single_record_job(
        self, *, request: LlmJobRequestProtocol, model_id: str
    ) -> dict[str, Any]:
        record = {
            "recordId": request.request_id,
            "modelInput": {"messages": to_bedrock_messages(request.messages)},
        }
        input_key = f"input/{request.request_id}.jsonl"
        output_prefix = f"output/{request.request_id}/"
        input_s3_uri = f"s3://{self.bucket}/{input_key}"
        output_s3_uri = f"s3://{self.bucket}/{output_prefix}"
        self._upload_jsonl(input_key, [record])

        try:
            job_arn = self._create_job(
                model_id=model_id,
                input_s3_uri=input_s3_uri,
                output_s3_uri=output_s3_uri,
                client_request_token=request.attempt_id,
            )
        except Exception as exc:
            self.mongo_store.put_job_record(
                {
                    "request_id": request.request_id,
                    "schema_version": SCHEMA_VERSION,
                    "attempt_id": request.attempt_id,
                    "batch_job_id": None,
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
            "schema_version": SCHEMA_VERSION,
            "attempt_id": request.attempt_id,
            "batch_job_id": job_arn,
            "bedrock_job_arn": job_arn,
            "canonical_llm": request.canonical_llm,
            "model_tag": request.model_tag,
            "queue_name": request.queue_name,
            "task_name": request.task_name,
            "task_type": request.task_type,
            "project_id": request.project_id,
            "input_s3_uri": input_s3_uri,
            "output_s3_uri": output_s3_uri,
            "submitted_at": time.time(),
            "status": "SUBMITTED",
        }
        update_result = self.mongo_store.put_job_record(job_record)
        if getattr(update_result, "matched_count", 0) != 1:
            self._stop_job(job_arn)
            raise BadRequest(
                "Bedrock batch job was invalidated before submission completed: "
                f"{request.request_id}"
            )
        return job_record

    def _poll_per_request_job(
        self,
        *,
        request: LlmJobRequestProtocol,
        job_arn: str,
        output_s3_uri: str,
        status_callback: Callable[[str, str], None] | None,
    ) -> dict[str, Any]:
        deadline = time.monotonic() + self.job_timeout_seconds
        last_reported_status: str | None = None

        while time.monotonic() < deadline:
            document = self.mongo_store.get_document(request.request_id)
            if document and document.get("attempt_id") != request.attempt_id:
                raise BadRequest(f"Bedrock batch job invalidated: {job_arn}")

            result = (document or {}).get("result")
            if result is not None:
                return result

            status = self._describe_job_status(job_arn)
            if status and status != last_reported_status:
                if status_callback:
                    status_callback(status, job_arn)
                last_reported_status = status

            if status in TERMINAL_FAILURE_STATUSES:
                raise BadRequest(
                    f"Bedrock batch job failed: {job_arn} status={status}"
                )
            if status in TERMINAL_SUCCESS_STATUSES:
                records = self._download_output_records(output_s3_uri=output_s3_uri)
                record = records.get(request.request_id)
                if record is None:
                    raise BadRequest(
                        f"Bedrock batch result missing for request: {request.request_id}"
                    )
                if "error" in record:
                    raise BadRequest(
                        f"Bedrock batch record failed: {request.request_id}: "
                        f"{record['error']}"
                    )
                result = self._build_result_payload(
                    request_id=request.request_id,
                    attempt_id=request.attempt_id,
                    job_arn=job_arn,
                    canonical_llm=request.canonical_llm,
                    model_tag=request.model_tag,
                    record=record,
                )
                self.mongo_store.put_result(
                    request_id=request.request_id,
                    attempt_id=request.attempt_id,
                    result=result,
                )
                return result

            time.sleep(self.poll_seconds)
        raise BadRequest(
            f"Bedrock batch timed out waiting for request: {request.request_id}"
        )

    # ------------------------------------------------------------------
    # bulk strategy
    # ------------------------------------------------------------------

    def _submit_and_wait_bulk(
        self,
        request: LlmJobRequestProtocol,
        model_id: str,
        *,
        status_callback: Callable[[str, str], None] | None,
    ) -> dict[str, Any]:
        existing_document = self.mongo_store.get_document(request.request_id)
        existing_job = (existing_document or {}).get("job") or {}
        if existing_document and existing_job.get("status") not in (None, "FAILED"):
            request = replace(request, attempt_id=existing_document["attempt_id"])
        else:
            request = replace(request, attempt_id=uuid4().hex)
            if self.mongo_store.reserve_request_submission(request):
                self.mongo_store.put_job_record(
                    self._pending_bulk_job_record(request=request, model_id=model_id)
                )
            else:
                refreshed = self.mongo_store.get_document(request.request_id)
                request = replace(
                    request,
                    attempt_id=(refreshed or {}).get("attempt_id", request.attempt_id),
                )

        return self._wait_for_bulk_result(
            request=request, model_id=model_id, status_callback=status_callback
        )

    @staticmethod
    def _pending_bulk_job_record(
        *, request: LlmJobRequestProtocol, model_id: str
    ) -> dict[str, Any]:
        return {
            "request_id": request.request_id,
            "schema_version": SCHEMA_VERSION,
            "attempt_id": request.attempt_id,
            "batch_job_id": None,
            "canonical_llm": request.canonical_llm,
            "model_tag": request.model_tag,
            "queue_name": request.queue_name,
            "task_name": request.task_name,
            "task_type": request.task_type,
            "project_id": request.project_id,
            "bucket_key": model_id,
            "enqueued_at": time.time(),
            "status": "PENDING_BULK",
        }

    def _wait_for_bulk_result(
        self,
        *,
        request: LlmJobRequestProtocol,
        model_id: str,
        status_callback: Callable[[str, str], None] | None,
    ) -> dict[str, Any]:
        deadline = time.monotonic() + self.job_timeout_seconds
        last_reported_status: str | None = None

        while time.monotonic() < deadline:
            document = self.mongo_store.get_document(request.request_id)
            if document and document.get("attempt_id") != request.attempt_id:
                raise BadRequest(
                    f"Bedrock batch request invalidated: {request.request_id}"
                )

            result = (document or {}).get("result")
            if result is not None:
                return result

            job = (document or {}).get("job") or {}
            status = job.get("status")
            if status and status != last_reported_status:
                if status_callback:
                    status_callback(status, job.get("bedrock_job_arn", ""))
                last_reported_status = status

            if status == "FAILED":
                raise BadRequest(
                    f"Bedrock batch job failed: {request.request_id}: "
                    f"{job.get('error', '')}"
                )
            if status == "PENDING_BULK":
                self._maybe_flush_bucket(model_id=model_id)
            elif status == "SUBMITTED" and job.get("bedrock_job_arn"):
                self._poll_bulk_job(job=job)

            time.sleep(self.poll_seconds)
        raise BadRequest(
            f"Bedrock batch timed out waiting for request: {request.request_id}"
        )

    def _maybe_flush_bucket(self, *, model_id: str) -> None:
        candidates = self.mongo_store.repository.find_multiple(
            filter={"job.status": "PENDING_BULK", "job.bucket_key": model_id},
            sort=[("job.enqueued_at", 1)],
            limit=self.max_records,
        )
        if not candidates:
            return

        oldest_enqueued_at = candidates[0].get("job", {}).get("enqueued_at", time.time())
        eligible = len(candidates) >= self.min_records or (
            time.time() - oldest_enqueued_at
        ) >= self.max_wait_seconds
        if not eligible:
            return

        if not self._acquire_flush_lock(model_id=model_id):
            return

        try:
            self._flush_bucket(model_id=model_id, candidates=candidates)
        except Exception:
            logger.exception(
                "Failed to flush Bedrock batch bucket model_id=%s", model_id
            )

    def _acquire_flush_lock(self, *, model_id: str) -> bool:
        now = time.time()
        lock_id = f"bedrock-batch-lock:{model_id}"
        try:
            claim = self.mongo_store.repository.collection.find_one_and_update(
                {
                    "_id": lock_id,
                    "$or": [
                        {"expires_at": {"$lt": now}},
                        {"expires_at": {"$exists": False}},
                    ],
                },
                {"$set": {"expires_at": now + self.lock_lease_seconds}},
                upsert=True,
                return_document=ReturnDocument.AFTER,
            )
        except DuplicateKeyError:
            return False
        return claim is not None

    def _flush_bucket(self, *, model_id: str, candidates: list[dict]) -> None:
        claim_token = uuid4().hex
        candidate_ids = [candidate["_id"] for candidate in candidates]

        self.mongo_store.repository.collection.update_many(
            {"_id": {"$in": candidate_ids}, "job.status": "PENDING_BULK"},
            {"$set": {"job.status": "CLAIMED", "job.claim_id": claim_token}},
        )
        claimed = self.mongo_store.repository.find_multiple(
            filter={"job.claim_id": claim_token}
        )
        if not claimed:
            return

        input_key = f"input/{claim_token}.jsonl"
        output_prefix = f"output/{claim_token}/"
        input_s3_uri = f"s3://{self.bucket}/{input_key}"
        output_s3_uri = f"s3://{self.bucket}/{output_prefix}"

        try:
            records = []
            for document in claimed:
                messages = messages_from_dict(document["request"]["messages"])
                records.append(
                    {
                        "recordId": document["_id"],
                        "modelInput": {"messages": to_bedrock_messages(messages)},
                    }
                )
            self._upload_jsonl(input_key, records)
            job_arn = self._create_job(
                model_id=model_id,
                input_s3_uri=input_s3_uri,
                output_s3_uri=output_s3_uri,
                client_request_token=claim_token,
            )
        except Exception:
            self.mongo_store.repository.collection.update_many(
                {"job.claim_id": claim_token},
                {
                    "$set": {"job.status": "PENDING_BULK"},
                    "$unset": {"job.claim_id": ""},
                },
            )
            raise

        self.mongo_store.repository.collection.update_many(
            {"job.claim_id": claim_token},
            {
                "$set": {
                    "job.status": "SUBMITTED",
                    "job.bedrock_job_arn": job_arn,
                    "job.batch_job_id": job_arn,
                    "job.input_s3_uri": input_s3_uri,
                    "job.output_s3_uri": output_s3_uri,
                    "job.submitted_at": time.time(),
                }
            },
        )
        logger.info(
            "Submitted Bedrock batch job: claim_id=%s job_arn=%s record_count=%s "
            "model_id=%s",
            claim_token,
            job_arn,
            len(claimed),
            model_id,
        )

    def _poll_bulk_job(self, *, job: dict[str, Any]) -> None:
        job_arn = job.get("bedrock_job_arn")
        if not job_arn:
            return
        status = self._describe_job_status(job_arn)
        if status in TERMINAL_SUCCESS_STATUSES:
            self._fan_out_bulk_results(job=job)
        elif status in TERMINAL_FAILURE_STATUSES:
            self.mongo_store.repository.collection.update_many(
                {"job.bedrock_job_arn": job_arn, "job.status": "SUBMITTED"},
                {
                    "$set": {
                        "job.status": "FAILED",
                        "job.error": f"Bedrock batch job ended with status {status}",
                    }
                },
            )

    def _fan_out_bulk_results(self, *, job: dict[str, Any]) -> None:
        job_arn = job["bedrock_job_arn"]
        records = self._download_output_records(
            output_s3_uri=job.get("output_s3_uri", "")
        )
        if not records:
            return

        siblings = self.mongo_store.repository.find_multiple(
            filter={"job.bedrock_job_arn": job_arn, "job.status": "SUBMITTED"}
        )
        for document in siblings:
            record_id = document["_id"]
            record = records.get(record_id)
            if record is None:
                continue

            attempt_id = document.get("attempt_id", "")
            if "error" in record:
                self.mongo_store.put_job_record(
                    {
                        **document.get("job", {}),
                        "status": "FAILED",
                        "error": str(record["error"]),
                    }
                )
                continue

            result = self._build_result_payload(
                request_id=record_id,
                attempt_id=attempt_id,
                job_arn=job_arn,
                canonical_llm=document.get("job", {}).get("canonical_llm", ""),
                model_tag=document.get("job", {}).get("model_tag", ""),
                record=record,
            )
            self.mongo_store.put_result(
                request_id=record_id,
                attempt_id=attempt_id,
                result=result,
            )

    # ------------------------------------------------------------------
    # Shared AWS Bedrock / S3 helpers
    # ------------------------------------------------------------------

    def _create_job(
        self,
        *,
        model_id: str,
        input_s3_uri: str,
        output_s3_uri: str,
        client_request_token: str,
    ) -> str:
        try:
            response = self.bedrock_client.create_model_invocation_job(
                jobName=f"bedrock-batch-{client_request_token}",
                roleArn=self.role_arn,
                modelId=model_id,
                inputDataConfig={"s3InputDataConfig": {"s3Uri": input_s3_uri}},
                outputDataConfig={"s3OutputDataConfig": {"s3Uri": output_s3_uri}},
                clientRequestToken=client_request_token,
            )
        except Exception as exc:
            raise BadRequest(f"Failed to create Bedrock batch job: {exc}") from exc
        return response["jobArn"]

    def _describe_job_status(self, job_arn: str) -> str | None:
        response = self.bedrock_client.get_model_invocation_job(jobIdentifier=job_arn)
        return response.get("status")

    def _stop_job(self, job_arn: str) -> None:
        try:
            self.bedrock_client.stop_model_invocation_job(jobIdentifier=job_arn)
        except Exception:
            logger.exception("Failed to stop Bedrock batch job job_arn=%s", job_arn)

    def _upload_jsonl(self, key: str, records: list[dict]) -> None:
        body = "\n".join(json.dumps(record) for record in records).encode("utf-8")
        self.s3_client.put_object(Bucket=self.bucket, Key=key, Body=body)

    def _download_output_records(self, *, output_s3_uri: str) -> dict[str, dict]:
        bucket, prefix = self._parse_s3_uri(output_s3_uri)
        records: dict[str, dict] = {}
        paginator = self.s3_client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
            for obj in page.get("Contents", []):
                key = obj["Key"]
                if not key.endswith(".jsonl.out"):
                    continue
                body = self.s3_client.get_object(Bucket=bucket, Key=key)["Body"].read()
                for line in body.decode("utf-8").splitlines():
                    line = line.strip()
                    if not line:
                        continue
                    parsed = json.loads(line)
                    record_id = parsed.get("recordId")
                    if record_id:
                        records[record_id] = parsed
        return records

    @staticmethod
    def _parse_s3_uri(s3_uri: str) -> tuple[str, str]:
        without_scheme = s3_uri.removeprefix("s3://")
        bucket, _, prefix = without_scheme.partition("/")
        return bucket, prefix

    @staticmethod
    def _build_result_payload(
        *,
        request_id: str,
        attempt_id: str,
        job_arn: str,
        canonical_llm: str,
        model_tag: str,
        record: dict,
    ) -> dict[str, Any]:
        model_output = record.get("modelOutput") or {}
        payload = {
            "schema_version": SCHEMA_VERSION,
            "request_id": request_id,
            "attempt_id": attempt_id,
            "batch_job_id": job_arn,
            "canonical_llm": canonical_llm,
            "model_tag": model_tag,
            "content": extract_converse_text(model_output),
        }
        usage_metadata = extract_converse_usage_metadata(model_output)
        if usage_metadata:
            payload["usage_metadata"] = usage_metadata
        return payload
