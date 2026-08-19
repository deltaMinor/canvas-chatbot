import time
from typing import Any
from uuid import uuid4

from engine_libs.llm_runtime.config import get_batch_mongo_collection
from pymongo.errors import DuplicateKeyError

from shared_libs.infrastructure.repository.service import Repository
from shared_libs.infrastructure.repository_collection import RepositoryCollection
from shared_libs.protocols import LlmJobRequestProtocol, LlmMongoStoreProtocol

SYSTEM_USER = {
    "user_id": "llm_batch",
    "username": "LLM Batch",
}

ACTIVE_JOB_STATUSES = {
    "SUBMITTING",
    "SUBMITTED",
    "PENDING",
    "RUNNABLE",
    "STARTING",
    "RUNNING",
    # Bedrock batch bulk-strategy pending pool states (llm_model_bedrock_batch.py).
    "PENDING_BULK",
    "CLAIMED",
}


def build_batch_llm_mongo_store(database) -> "LlmMongoStoreProtocol":
    return LlmMongoStore(
        repository=Repository(
            collection=RepositoryCollection(
                database=database,
                name=get_batch_mongo_collection(),
            )
        )
    )


class LlmMongoStore:
    def __init__(self, repository):
        self.repository = repository

    @staticmethod
    def document_id(request_id: str) -> str:
        return request_id

    def get_document(self, request_id: str) -> dict[str, Any] | None:
        return self.repository.find_single(filter={"_id": self.document_id(request_id)})

    def put_request_document(self, request: LlmJobRequestProtocol) -> None:
        now = time.time()
        self.repository.update_single(
            filter={"_id": self.document_id(request.request_id)},
            payload={
                "schema_version": request.to_payload()["schema_version"],
                "request_id": request.request_id,
                "attempt_id": request.attempt_id,
                "request": request.to_payload(),
                "job": None,
                "result": None,
                "created_at": now,
                "updated_at": now,
            },
            user_info=SYSTEM_USER,
            upsert=True,
        )

    def reserve_request_submission(self, request: LlmJobRequestProtocol) -> bool:
        now = time.time()
        request_payload = request.to_payload()
        submitting_job = {
            "request_id": request.request_id,
            "schema_version": request_payload["schema_version"],
            "attempt_id": request.attempt_id,
            "batch_job_id": None,
            "job_name": None,
            "canonical_llm": request.canonical_llm,
            "model_tag": request.model_tag,
            "queue_name": request.queue_name,
            "task_name": request.task_name,
            "task_type": request.task_type,
            "project_id": request.project_id,
            "submitted_at": now,
            "status": "SUBMITTING",
        }
        filter_ = {
            "_id": self.document_id(request.request_id),
            "$or": [
                {"job": None},
                {"job": {"$exists": False}},
                {"job.status": {"$nin": list(ACTIVE_JOB_STATUSES)}},
            ],
        }
        update = {
            "$setOnInsert": {
                "created_at": now,
            },
            "$set": {
                "schema_version": request_payload["schema_version"],
                "request_id": request.request_id,
                "attempt_id": request.attempt_id,
                "request": request_payload,
                "job": submitting_job,
                "result": None,
                "updated_at": now,
            },
        }

        try:
            result = self.repository.collection.update_one(
                filter_,
                update,
                upsert=True,
            )
        except DuplicateKeyError:
            return False

        return bool(result.matched_count or result.upserted_id)

    def put_job_record(self, job_record: dict[str, Any]):
        return self.repository.update_single(
            filter={
                "_id": self.document_id(job_record["request_id"]),
                "attempt_id": job_record["attempt_id"],
            },
            payload={
                "job": job_record,
                "updated_at": time.time(),
            },
            user_info=SYSTEM_USER,
        )

    def abort_request_attempt(
        self,
        *,
        request_id: str,
        attempt_id: str,
        reason: str,
    ):
        return self.repository.update_single(
            filter={
                "_id": self.document_id(request_id),
                "attempt_id": attempt_id,
            },
            payload={
                "job.status": "ABORTED",
                "job.invalidation_reason": reason,
                "job.invalidated_at": time.time(),
                "updated_at": time.time(),
            },
            user_info=SYSTEM_USER,
        )

    def put_result(self, *, request_id: str, attempt_id: str, result: dict[str, Any]):
        return self.repository.update_single(
            filter={
                "_id": self.document_id(request_id),
                "attempt_id": attempt_id,
            },
            payload={
                "result": result,
                "updated_at": time.time(),
            },
            user_info=SYSTEM_USER,
        )

    def put_job_result(
        self,
        *,
        request_id: str,
        attempt_id: str,
        job: dict[str, Any],
        result: dict[str, Any] | None = None,
    ):
        payload = {
            "job": job,
            "updated_at": time.time(),
        }
        if result is not None:
            payload["result"] = result
        return self.repository.update_single(
            filter={
                "_id": self.document_id(request_id),
                "attempt_id": attempt_id,
            },
            payload=payload,
            user_info=SYSTEM_USER,
        )

    def get_active_job_documents(self, *, project_id: str) -> list[dict[str, Any]]:
        return list(
            self.repository.find_multiple(
                filter={
                    "request.project_id": project_id,
                    "job.status": {"$in": list(ACTIVE_JOB_STATUSES)},
                }
            )
        )

    def invalidate_active_jobs(
        self,
        *,
        project_id: str,
        reason: str = "manual_abort",
    ) -> int:
        documents = self.get_active_job_documents(project_id=project_id)
        invalidated_count = 0
        invalidated_at = time.time()

        for document in documents:
            job = document.get("job") or {}
            aborted_attempt_id = f"aborted-{uuid4().hex}"
            job = {
                **job,
                "status": "ABORTED",
                "invalidated_at": invalidated_at,
                "invalidation_reason": reason,
            }
            self.repository.update_single(
                filter={"_id": document["_id"]},
                payload={
                    "attempt_id": aborted_attempt_id,
                    "job": job,
                    "result": None,
                    "updated_at": invalidated_at,
                },
                user_info=SYSTEM_USER,
            )
            invalidated_count += 1

        return invalidated_count
