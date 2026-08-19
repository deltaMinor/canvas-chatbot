from dataclasses import replace

import pytest
from engine_libs.llm_runtime.batch_client import BatchLlmClient
from engine_libs.llm_runtime.contracts import (
    SCHEMA_VERSION,
)
from engine_libs.llm_runtime.mongo_store import LlmMongoStore

from shared_libs.exceptions.api_exceptions import BadRequest

from .helpers import (
    make_client as make_client_base,
)
from .helpers import (
    make_request,
)


class FakeUpdateResult:
    def __init__(self, matched_count=1):
        self.matched_count = matched_count


class FakeMongoStore:
    def __init__(self):
        self.documents = {}
        self.put_request_calls = []
        self.put_job_calls = []

    def get_document(self, request_id):
        return self.documents.get(request_id)

    def put_request_document(self, request):
        self.put_request_calls.append(request)
        self.documents[request.request_id] = {
            "_id": request.request_id,
            "schema_version": request.to_payload()["schema_version"],
            "request_id": request.request_id,
            "attempt_id": request.attempt_id,
            "request": request.to_payload(),
            "job": None,
            "result": None,
        }

    def put_job_record(self, job_record):
        self.put_job_calls.append(job_record)
        document = self.documents[job_record["request_id"]]
        document["job"] = job_record
        return FakeUpdateResult()

    def abort_request_attempt(self, *, request_id, attempt_id, reason):
        document = self.documents[request_id]
        if document["attempt_id"] != attempt_id:
            return FakeUpdateResult(matched_count=0)
        document["job"]["status"] = "ABORTED"
        document["job"]["invalidation_reason"] = reason
        return FakeUpdateResult()

    def reserve_request_submission(self, request):
        document = self.documents.get(request.request_id)
        if document and (document.get("job") or {}).get("status") in {
            "SUBMITTING",
            "SUBMITTED",
            "PENDING",
            "RUNNABLE",
            "STARTING",
            "RUNNING",
        }:
            return False

        self.documents[request.request_id] = {
            "_id": request.request_id,
            "schema_version": request.to_payload()["schema_version"],
            "request_id": request.request_id,
            "attempt_id": request.attempt_id,
            "request": request.to_payload(),
            "job": {
                "request_id": request.request_id,
                "attempt_id": request.attempt_id,
                "batch_job_id": None,
                "status": "SUBMITTING",
            },
            "result": None,
        }
        return True


class ConcurrentSubmissionMongoStore(FakeMongoStore):
    def __init__(self):
        super().__init__()
        self.get_calls = 0

    def reserve_request_submission(self, request):
        self.documents[request.request_id] = {
            "_id": request.request_id,
            "schema_version": request.to_payload()["schema_version"],
            "request_id": request.request_id,
            "attempt_id": "attempt-existing",
            "request": request.to_payload(),
            "job": {
                "request_id": request.request_id,
                "attempt_id": "attempt-existing",
                "batch_job_id": None,
                "status": "SUBMITTING",
            },
            "result": None,
        }
        return False

    def get_document(self, request_id):
        self.get_calls += 1
        document = self.documents.get(request_id)
        if self.get_calls > 1 and document:
            document["job"] = {
                **document["job"],
                "batch_job_id": "job-existing",
                "status": "SUBMITTED",
            }
        return document


class InvalidatedAfterSubmitMongoStore(FakeMongoStore):
    def put_job_record(self, job_record):
        self.put_job_calls.append(job_record)
        return FakeUpdateResult(matched_count=0)


class FakeBatchClient:
    def __init__(self, status="RUNNING", created_at=None):
        self.status = status
        self.created_at = created_at
        self.submit_calls = []
        self.describe_calls = []
        self.cancel_calls = []
        self.terminate_calls = []

    def submit_job(self, **kwargs):
        self.submit_calls.append(kwargs)
        return {"jobId": "job-new", "jobName": kwargs["jobName"]}

    def describe_jobs(self, *, jobs):
        self.describe_calls.append(jobs)
        job = {"jobId": jobs[0], "status": self.status}
        if self.created_at is not None:
            job["createdAt"] = self.created_at
        return {"jobs": [job]}

    def cancel_job(self, **kwargs):
        self.cancel_calls.append(kwargs)

    def terminate_job(self, **kwargs):
        self.terminate_calls.append(kwargs)


class FakeRepository:
    def __init__(self, documents):
        self.documents = documents
        self.update_calls = []

    def find_multiple(self, *, filter):
        project_id = filter["request.project_id"]
        active_statuses = set(filter["job.status"]["$in"])
        return [
            document
            for document in self.documents
            if document.get("request", {}).get("project_id") == project_id
            and (document.get("job") or {}).get("status") in active_statuses
        ]

    def update_single(self, *, filter, payload, user_info):
        self.update_calls.append(
            {
                "filter": filter,
                "payload": payload,
                "user_info": user_info,
            }
        )
        for document in self.documents:
            if document["_id"] == filter["_id"]:
                document.update(payload)
                return FakeUpdateResult()
        return FakeUpdateResult(matched_count=0)


def make_client(
    mongo_store: FakeMongoStore | None = None,
    batch_client: FakeBatchClient | None = None,
    max_request_bytes=1048576,
    stale_job_seconds=60,
) -> BatchLlmClient:
    return make_client_base(
        fake_mongo_store_cls=FakeMongoStore,
        fake_batch_client_cls=FakeBatchClient,
        mongo_store=mongo_store,
        batch_client=batch_client,
        max_request_bytes=max_request_bytes,
        stale_job_seconds=stale_job_seconds,
    )


def test_put_request_document_writes_explicit_message_contract():
    mongo_store = FakeMongoStore()
    client = make_client(mongo_store=mongo_store)

    request = make_request()
    client.put_request_document(request)
    document = client.get_document("req-1")
    payload = document["request"]

    assert document["_id"] == "req-1"
    assert document["job"] is None
    assert document["result"] is None
    assert payload["schema_version"] == SCHEMA_VERSION
    assert payload["request_id"] == "req-1"
    assert payload["model_tag"] == "qwen3:8b"
    assert payload["messages"][0]["type"] == "human"
    assert payload["messages"][0]["data"]["content"][0]["text"] == "hello"


def test_request_over_max_bytes_fails_before_mongo_write():
    mongo_store = FakeMongoStore()
    client = make_client(mongo_store=mongo_store, max_request_bytes=10)

    with pytest.raises(BadRequest):
        client.put_request_document(make_request())

    assert mongo_store.put_request_calls == []


def test_missing_mongo_document_returns_none():
    client = make_client()

    assert client.get_document("missing") is None


def test_existing_live_job_record_prevents_duplicate_submit():
    mongo_store = FakeMongoStore()
    batch_client = FakeBatchClient(status="RUNNING")
    client = make_client(mongo_store=mongo_store, batch_client=batch_client)
    mongo_store.documents["req-1"] = {
        "_id": "req-1",
        "request_id": "req-1",
        "attempt_id": "attempt-existing",
        "request": make_request().to_payload(),
        "job": {
            "request_id": "req-1",
            "attempt_id": "attempt-existing",
            "batch_job_id": "job-existing",
        },
        "result": None,
    }

    job_record = client.submit_request(make_request())

    assert job_record["batch_job_id"] == "job-existing"
    assert batch_client.describe_calls == [["job-existing"]]
    assert batch_client.submit_calls == []


def test_concurrent_submission_waits_for_reserved_job(monkeypatch):
    mongo_store = ConcurrentSubmissionMongoStore()
    batch_client = FakeBatchClient(status="RUNNING")
    client = make_client(mongo_store=mongo_store, batch_client=batch_client)
    monkeypatch.setattr(
        "engine_libs.llm_runtime.batch_client.SUBMISSION_RESERVATION_WAIT_SECONDS",
        2,
    )
    monkeypatch.setattr(
        "engine_libs.llm_runtime.batch_client.SUBMISSION_RESERVATION_POLL_SECONDS",
        0,
    )

    job_record = client.submit_request(make_request())

    assert job_record["batch_job_id"] == "job-existing"
    assert batch_client.describe_calls == [["job-existing"]]
    assert batch_client.submit_calls == []


def test_existing_stale_running_job_record_submits_new_job():
    mongo_store = FakeMongoStore()
    batch_client = FakeBatchClient(status="RUNNING")
    client = make_client(
        mongo_store=mongo_store,
        batch_client=batch_client,
        stale_job_seconds=10,
    )
    mongo_store.documents["req-1"] = {
        "_id": "req-1",
        "request_id": "req-1",
        "attempt_id": "attempt-existing",
        "request": make_request().to_payload(),
        "job": {
            "request_id": "req-1",
            "attempt_id": "attempt-existing",
            "batch_job_id": "job-existing",
            "submitted_at": 1,
        },
        "result": None,
    }

    job_record = client.submit_request(make_request())

    assert job_record["batch_job_id"] == "job-new"
    assert job_record["attempt_id"]
    assert batch_client.describe_calls == [["job-existing"]]
    assert len(batch_client.submit_calls) == 1


def test_existing_succeeded_job_record_submits_new_job():
    mongo_store = FakeMongoStore()
    batch_client = FakeBatchClient(status="SUCCEEDED")
    client = make_client(mongo_store=mongo_store, batch_client=batch_client)
    mongo_store.documents["req-1"] = {
        "_id": "req-1",
        "request_id": "req-1",
        "attempt_id": "attempt-existing",
        "request": make_request().to_payload(),
        "job": {
            "request_id": "req-1",
            "attempt_id": "attempt-existing",
            "batch_job_id": "job-existing",
            "submitted_at": 1,
        },
        "result": None,
    }

    job_record = client.submit_request(make_request())

    assert job_record["batch_job_id"] == "job-new"
    assert batch_client.describe_calls == [["job-existing"]]
    assert len(batch_client.submit_calls) == 1


def test_submit_request_writes_job_record_with_batch_environment():
    mongo_store = FakeMongoStore()
    batch_client = FakeBatchClient()
    client = make_client(mongo_store=mongo_store, batch_client=batch_client)

    job_record = client.submit_request(make_request())

    assert job_record["batch_job_id"] == "job-new"
    assert job_record["attempt_id"]
    env = batch_client.submit_calls[0]["containerOverrides"]["environment"]
    assert {"name": "REQUEST_ID", "value": "req-1"} in env
    assert {"name": "ATTEMPT_ID", "value": job_record["attempt_id"]} in env
    assert {"name": "MODEL_TAG", "value": "qwen3:8b"} in env
    document = client.get_document("req-1")
    assert document["request"]["request_id"] == "req-1"
    assert document["job"]["batch_job_id"] == "job-new"
    assert document["result"] is None


def test_submit_request_stops_batch_job_when_attempt_was_invalidated():
    mongo_store = InvalidatedAfterSubmitMongoStore()
    batch_client = FakeBatchClient()
    client = make_client(mongo_store=mongo_store, batch_client=batch_client)

    with pytest.raises(BadRequest):
        client.submit_request(make_request())

    assert len(batch_client.submit_calls) == 1
    assert batch_client.cancel_calls == [
        {
            "jobId": "job-new",
            "reason": "LLM Batch attempt was invalidated before job record write.",
        }
    ]
    assert batch_client.terminate_calls == []


def test_submit_request_rechecks_abort_after_reservation_before_aws_submit():
    mongo_store = FakeMongoStore()
    batch_client = FakeBatchClient()
    client = make_client(mongo_store=mongo_store, batch_client=batch_client)

    with pytest.raises(BadRequest):
        client.submit_request(
            make_request(),
            before_submit=lambda: (_ for _ in ()).throw(BadRequest("aborted")),
        )

    document = client.get_document("req-1")
    assert document["job"]["status"] == "ABORTED"
    assert document["job"]["invalidation_reason"] == (
        "assessment_inactive_before_batch_submit"
    )
    assert batch_client.submit_calls == []


def test_submit_request_passes_reasoning_environment_overrides(monkeypatch):
    monkeypatch.setenv("LLM_MODEL_QWEN_REASONING", "true")
    monkeypatch.setenv("LLM_MODEL_MINISTRAL_REASONING", "false")
    batch_client = FakeBatchClient()
    client = make_client(batch_client=batch_client)

    client.submit_request(make_request())

    env = batch_client.submit_calls[0]["containerOverrides"]["environment"]
    assert {"name": "LLM_MODEL_QWEN_REASONING", "value": "true"} in env
    assert {"name": "LLM_MODEL_MINISTRAL_REASONING", "value": "false"} not in env


def test_result_identity_mismatch_fails_before_consumption():
    mongo_store = FakeMongoStore()
    client = make_client(mongo_store=mongo_store)
    mongo_store.documents["req-1"] = {
        "_id": "req-1",
        "result": {
            "schema_version": SCHEMA_VERSION,
            "request_id": "other-request",
            "attempt_id": "attempt-1",
            "batch_job_id": "job-1",
            "model_tag": "qwen3:8b",
            "content": "hello",
        },
    }

    with pytest.raises(BadRequest):
        client.get_result(
            request_id="req-1",
            attempt_id="attempt-1",
            batch_job_id="job-1",
            model_tag="qwen3:8b",
        )


def test_stale_attempt_result_is_ignored():
    mongo_store = FakeMongoStore()
    client = make_client(mongo_store=mongo_store)
    mongo_store.documents["req-1"] = {
        "_id": "req-1",
        "result": {
            "schema_version": SCHEMA_VERSION,
            "request_id": "req-1",
            "attempt_id": "old-attempt",
            "batch_job_id": "old-job",
            "model_tag": "qwen3:8b",
            "content": "old",
        },
    }

    result = client.get_result(
        request_id="req-1",
        attempt_id="new-attempt",
        batch_job_id="new-job",
        model_tag="qwen3:8b",
    )

    assert result is None


def test_valid_result_payload_is_returned():
    mongo_store = FakeMongoStore()
    client = make_client(mongo_store=mongo_store)
    mongo_store.documents["req-1"] = {
        "_id": "req-1",
        "result": {
            "schema_version": SCHEMA_VERSION,
            "request_id": "req-1",
            "attempt_id": "attempt-1",
            "batch_job_id": "job-1",
            "model_tag": "qwen3:8b",
            "content": "hello",
        },
    }

    result = client.get_result(
        request_id="req-1",
        attempt_id="attempt-1",
        batch_job_id="job-1",
        model_tag="qwen3:8b",
    )

    assert result["content"] == "hello"


def test_wait_for_result_reports_batch_status_before_result():
    mongo_store = FakeMongoStore()
    batch_client = FakeBatchClient(status="RUNNING")
    client = make_client(mongo_store=mongo_store, batch_client=batch_client)
    request = make_request()
    request = replace(request, attempt_id="attempt-1")
    mongo_store.put_request_document(request)
    job_record = {
        "request_id": request.request_id,
        "attempt_id": request.attempt_id,
        "batch_job_id": "job-1",
    }
    status_updates = []

    def status_callback(status, job_id):
        status_updates.append((status, job_id))
        mongo_store.documents[request.request_id]["result"] = {
            "schema_version": SCHEMA_VERSION,
            "request_id": request.request_id,
            "attempt_id": request.attempt_id,
            "batch_job_id": job_id,
            "model_tag": request.model_tag,
            "content": "done",
        }

    result = client.wait_for_result(
        job_record=job_record,
        request_id=request.request_id,
        model_tag=request.model_tag,
        timeout_seconds=1,
        poll_seconds=0,
        status_callback=status_callback,
    )

    assert status_updates == [("RUNNING", "job-1")]
    assert result["content"] == "done"


def test_invalidate_active_jobs_aborts_jobs_and_stales_old_attempt():
    old_attempt_id = "attempt-running"
    documents = [
        {
            "_id": "req-running",
            "attempt_id": old_attempt_id,
            "request": {"project_id": "project-1"},
            "job": {
                "attempt_id": old_attempt_id,
                "status": "RUNNING",
            },
            "result": {"content": "partial"},
        },
        {
            "_id": "req-complete",
            "attempt_id": "attempt-complete",
            "request": {"project_id": "project-1"},
            "job": {
                "attempt_id": "attempt-complete",
                "status": "SUCCEEDED",
            },
            "result": {"content": "done"},
        },
    ]
    store = LlmMongoStore(FakeRepository(documents))

    count = store.invalidate_active_jobs(
        project_id="project-1",
        reason="manual_abort",
    )

    assert count == 1
    running_document = documents[0]
    assert running_document["attempt_id"].startswith("aborted-")
    assert running_document["attempt_id"] != old_attempt_id
    assert running_document["job"]["status"] == "ABORTED"
    assert running_document["job"]["invalidation_reason"] == "manual_abort"
    assert running_document["result"] is None
    assert documents[1]["attempt_id"] == "attempt-complete"
