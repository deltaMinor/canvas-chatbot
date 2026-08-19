import json
from dataclasses import replace
from datetime import UTC
from types import SimpleNamespace

import pytest
from django.conf import settings

if not settings.configured:
    settings.configure(TZINFO=UTC)

from engine_libs.llm_runtime.bedrock_batch_client import BedrockBatchClient
from engine_libs.llm_runtime.context import ENGINE_LLM_CONTEXT
from engine_libs.llm_runtime.contracts import LlmJobRequest
from langchain_core.messages import HumanMessage
from pymongo.errors import DuplicateKeyError

from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.protocols import LlmJobRequestProtocol

BUCKET_KEY_STATUSES = {
    "SUBMITTING",
    "SUBMITTED",
    "PENDING",
    "RUNNABLE",
    "STARTING",
    "RUNNING",
    "PENDING_BULK",
    "CLAIMED",
}


class InMemoryCollection:
    """Minimal pymongo-compatible fake scoped to the operators bedrock_batch_client.py uses."""

    def __init__(self):
        self.documents: dict[str, dict] = {}

    @staticmethod
    def _get_path(document, path):
        node = document
        for part in path.split("."):
            if not isinstance(node, dict) or part not in node:
                return None
            node = node[part]
        return node

    @staticmethod
    def _path_exists(document, path):
        node = document
        for part in path.split("."):
            if not isinstance(node, dict) or part not in node:
                return False
            node = node[part]
        return True

    @staticmethod
    def _set_path(document, path, value):
        parts = path.split(".")
        node = document
        for part in parts[:-1]:
            node = node.setdefault(part, {})
        node[parts[-1]] = value

    @staticmethod
    def _unset_path(document, path):
        parts = path.split(".")
        node = document
        for part in parts[:-1]:
            node = node.get(part)
            if not isinstance(node, dict):
                return
        node.pop(parts[-1], None)

    def _matches(self, document, filter_):
        for key, condition in filter_.items():
            if key == "$or":
                if not any(self._matches(document, sub) for sub in condition):
                    return False
                continue
            if isinstance(condition, dict) and any(
                str(k).startswith("$") for k in condition
            ):
                for op, operand in condition.items():
                    value = self._get_path(document, key)
                    if op == "$lt":
                        if value is None or not (value < operand):
                            return False
                    elif op == "$exists":
                        if self._path_exists(document, key) != operand:
                            return False
                    elif op == "$in":
                        if value not in operand:
                            return False
                    else:
                        raise NotImplementedError(op)
            else:
                if self._get_path(document, key) != condition:
                    return False
        return True

    def _apply_update(self, document, update):
        for op, payload in update.items():
            if op == "$set":
                for path, value in payload.items():
                    self._set_path(document, path, value)
            elif op == "$unset":
                for path in payload:
                    self._unset_path(document, path)
            else:
                raise NotImplementedError(op)

    def find(self, filter=None, sort=None, limit=0, **_ignored):
        filter = filter or {}
        results = [
            document
            for document in self.documents.values()
            if self._matches(document, filter)
        ]
        if sort:
            for key, direction in reversed(sort):
                results.sort(
                    key=lambda d: self._get_path(d, key), reverse=direction < 0
                )
        if limit:
            results = results[:limit]
        return results

    def update_many(self, filter, update):
        count = 0
        for document in self.documents.values():
            if self._matches(document, filter):
                self._apply_update(document, update)
                count += 1
        return SimpleNamespace(matched_count=count)

    def find_one_and_update(self, filter, update, upsert=False, return_document=None):
        for document in self.documents.values():
            if self._matches(document, filter):
                self._apply_update(document, update)
                return document
        if upsert:
            new_id = filter.get("_id")
            if new_id in self.documents:
                raise DuplicateKeyError("duplicate lock document")
            document = {"_id": new_id}
            self._apply_update(document, update)
            self.documents[new_id] = document
            return document
        return None


class FakeRepository:
    def __init__(self, collection: InMemoryCollection):
        self.collection = collection

    def find_multiple(self, *, filter=None, sort=None, limit=0):
        return self.collection.find(filter=filter, sort=sort, limit=limit)


class FakeMongoStore:
    def __init__(self):
        self.collection = InMemoryCollection()
        self.repository = FakeRepository(self.collection)

    def get_document(self, request_id):
        return self.collection.documents.get(request_id)

    def put_request_document(self, request):
        self.collection.documents[request.request_id] = {
            "_id": request.request_id,
            "schema_version": request.to_payload()["schema_version"],
            "request_id": request.request_id,
            "attempt_id": request.attempt_id,
            "request": request.to_payload(),
            "job": None,
            "result": None,
        }

    def reserve_request_submission(self, request):
        document = self.collection.documents.get(request.request_id)
        if document and (document.get("job") or {}).get("status") in BUCKET_KEY_STATUSES:
            return False
        self.collection.documents[request.request_id] = {
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

    def put_job_record(self, job_record):
        document = self.collection.documents.get(job_record["request_id"])
        if document is None or document.get("attempt_id") != job_record["attempt_id"]:
            return SimpleNamespace(matched_count=0)
        document["job"] = job_record
        return SimpleNamespace(matched_count=1)

    def put_result(self, *, request_id, attempt_id, result):
        document = self.collection.documents.get(request_id)
        if document is None or document.get("attempt_id") != attempt_id:
            return SimpleNamespace(matched_count=0)
        document["result"] = result
        return SimpleNamespace(matched_count=1)


class FakeBedrockClient:
    def __init__(self):
        self.jobs: dict[str, dict] = {}
        self.create_calls: list[dict] = []
        self.stop_calls: list[str] = []
        self._counter = 0

    def create_model_invocation_job(self, **kwargs):
        self.create_calls.append(kwargs)
        self._counter += 1
        job_arn = f"arn:aws:bedrock:job-{self._counter}"
        self.jobs[job_arn] = {"status": "InProgress"}
        return {"jobArn": job_arn}

    def get_model_invocation_job(self, *, jobIdentifier):
        return {"status": self.jobs[jobIdentifier]["status"]}

    def stop_model_invocation_job(self, *, jobIdentifier):
        self.stop_calls.append(jobIdentifier)
        self.jobs[jobIdentifier]["status"] = "Stopped"


class FakeS3Client:
    def __init__(self):
        self.objects: dict[tuple[str, str], bytes] = {}

    def put_object(self, *, Bucket, Key, Body):
        self.objects[(Bucket, Key)] = Body

    def get_object(self, *, Bucket, Key):
        return {"Body": _Body(self.objects[(Bucket, Key)])}

    def get_paginator(self, operation_name):
        assert operation_name == "list_objects_v2"
        return _ListObjectsPaginator(self)


class _Body:
    def __init__(self, data: bytes):
        self._data = data

    def read(self) -> bytes:
        return self._data


class _ListObjectsPaginator:
    def __init__(self, s3_client: FakeS3Client):
        self.s3_client = s3_client

    def paginate(self, *, Bucket, Prefix):
        contents = [
            {"Key": key}
            for (bucket, key) in self.s3_client.objects
            if bucket == Bucket and key.startswith(Prefix)
        ]
        yield {"Contents": contents}


def make_request(request_id: str = "req-1") -> LlmJobRequestProtocol:
    return LlmJobRequest(
        request_id=request_id,
        attempt_id="",
        canonical_llm="nova_lite",
        model_tag="amazon.nova-lite-v1:0",
        messages=[HumanMessage(content=[{"type": "text", "text": "hello"}])],
        response_mode="json",
        queue_name=ENGINE_LLM_CONTEXT.queue_name,
        task_name=ENGINE_LLM_CONTEXT.task_name,
        task_type=ENGINE_LLM_CONTEXT.task_type,
        project_id="project-1",
    )


def make_bedrock_batch_client(mongo_store=None, bedrock_client=None, s3_client=None, **overrides):
    kwargs = dict(
        mongo_store=mongo_store or FakeMongoStore(),
        bedrock_client=bedrock_client or FakeBedrockClient(),
        s3_client=s3_client or FakeS3Client(),
        bucket="test-bucket",
        role_arn="arn:aws:iam::123456789012:role/bedrock-batch",
        min_records=3,
        max_records=10,
        max_wait_seconds=60,
        job_timeout_seconds=5,
        poll_seconds=0,
        lock_lease_seconds=30,
    )
    kwargs.update(overrides)
    return BedrockBatchClient(**kwargs)


def _stage_completed_output(client, kwargs, records):
    job_arn = None
    for arn, job in client.bedrock_client.jobs.items():
        job_arn = arn
        job["status"] = "Completed"
    output_uri = kwargs["outputDataConfig"]["s3OutputDataConfig"]["s3Uri"]
    bucket, prefix = client._parse_s3_uri(output_uri)
    body = "\n".join(json.dumps(record) for record in records).encode("utf-8")
    client.s3_client.put_object(Bucket=bucket, Key=f"{prefix}output.jsonl.out", Body=body)
    return job_arn


def converse_output(text: str) -> dict:
    return {"output": {"message": {"content": [{"text": text}]}}}


# ---------------------------------------------------------------------------
# per_request strategy
# ---------------------------------------------------------------------------


def test_per_request_submit_and_poll_success():
    mongo_store = FakeMongoStore()
    bedrock_client = FakeBedrockClient()
    client = make_bedrock_batch_client(mongo_store, bedrock_client)
    request = make_request()

    original_create = bedrock_client.create_model_invocation_job

    def create_and_complete(**kwargs):
        response = original_create(**kwargs)
        _stage_completed_output(
            client,
            kwargs,
            [
                {
                    "recordId": request.request_id,
                    "modelOutput": {
                        **converse_output("hello back"),
                        "usage": {
                            "inputTokens": 3,
                            "outputTokens": 2,
                            "totalTokens": 5,
                        },
                    },
                }
            ],
        )
        return response

    bedrock_client.create_model_invocation_job = create_and_complete

    result = client.submit_and_wait(
        request, "amazon.nova-lite-v1:0", strategy="per_request"
    )

    assert result["content"] == "hello back"
    assert result["usage_metadata"] == {
        "input_tokens": 3,
        "output_tokens": 2,
        "total_tokens": 5,
    }
    assert len(bedrock_client.create_calls) == 1
    document = mongo_store.get_document(request.request_id)
    assert document["result"]["content"] == "hello back"


def test_per_request_submit_and_poll_failure():
    mongo_store = FakeMongoStore()
    bedrock_client = FakeBedrockClient()
    client = make_bedrock_batch_client(mongo_store, bedrock_client)
    request = make_request()

    original_create = bedrock_client.create_model_invocation_job

    def create_and_fail(**kwargs):
        response = original_create(**kwargs)
        bedrock_client.jobs[response["jobArn"]]["status"] = "Failed"
        return response

    bedrock_client.create_model_invocation_job = create_and_fail

    with pytest.raises(BadRequest):
        client.submit_and_wait(request, "amazon.nova-lite-v1:0", strategy="per_request")


def test_per_request_concurrent_duplicate_reuses_reserved_job():
    mongo_store = FakeMongoStore()
    bedrock_client = FakeBedrockClient()
    client = make_bedrock_batch_client(mongo_store, bedrock_client)
    request = make_request()

    mongo_store.reserve_request_submission(replace(request, attempt_id="attempt-existing"))
    job_arn = "arn:aws:bedrock:existing-job"
    bedrock_client.jobs[job_arn] = {"status": "Completed"}
    document = mongo_store.get_document(request.request_id)
    document["job"] = {
        **document["job"],
        "attempt_id": "attempt-existing",
        "bedrock_job_arn": job_arn,
        "batch_job_id": job_arn,
        "status": "SUBMITTED",
        "output_s3_uri": "s3://test-bucket/output/existing/",
    }
    client.s3_client.put_object(
        Bucket="test-bucket",
        Key="output/existing/output.jsonl.out",
        Body=json.dumps(
            {"recordId": request.request_id, "modelOutput": converse_output("reused")}
        ).encode("utf-8"),
    )

    result = client.submit_and_wait(
        request, "amazon.nova-lite-v1:0", strategy="per_request"
    )

    assert result["content"] == "reused"
    assert bedrock_client.create_calls == []


# ---------------------------------------------------------------------------
# bulk strategy
# ---------------------------------------------------------------------------


def test_bulk_enqueue_below_min_records_does_not_flush():
    mongo_store = FakeMongoStore()
    bedrock_client = FakeBedrockClient()
    client = make_bedrock_batch_client(
        mongo_store,
        bedrock_client,
        min_records=3,
        max_wait_seconds=999,
        job_timeout_seconds=0.05,
    )
    request = make_request()

    with pytest.raises(BadRequest):
        client.submit_and_wait(request, "amazon.nova-lite-v1:0", strategy="bulk")

    assert bedrock_client.create_calls == []
    document = mongo_store.get_document(request.request_id)
    assert document["job"]["status"] == "PENDING_BULK"


def test_bulk_reaching_min_records_triggers_single_flush():
    mongo_store = FakeMongoStore()
    bedrock_client = FakeBedrockClient()
    client = make_bedrock_batch_client(
        mongo_store, bedrock_client, min_records=3, max_records=10
    )

    pending_requests = [make_request(f"req-{i}") for i in range(2)]
    for pending in pending_requests:
        pending = replace(pending, attempt_id=f"attempt-{pending.request_id}")
        mongo_store.reserve_request_submission(pending)
        mongo_store.put_job_record(
            client._pending_bulk_job_record(
                request=pending, model_id="amazon.nova-lite-v1:0"
            )
        )

    triggering_request = make_request("req-2")

    original_create = bedrock_client.create_model_invocation_job

    def create_and_complete(**kwargs):
        response = original_create(**kwargs)
        _stage_completed_output(
            client,
            kwargs,
            [
                {"recordId": f"req-{i}", "modelOutput": converse_output(f"out-{i}")}
                for i in range(3)
            ],
        )
        return response

    bedrock_client.create_model_invocation_job = create_and_complete

    result = client.submit_and_wait(
        triggering_request, "amazon.nova-lite-v1:0", strategy="bulk"
    )

    assert result["content"] == "out-2"
    assert len(bedrock_client.create_calls) == 1
    input_keys = [key for (_, key) in client.s3_client.objects if key.startswith("input/")]
    assert len(input_keys) == 1
    for pending in pending_requests:
        document = mongo_store.get_document(pending.request_id)
        index = pending.request_id.split("-")[1]
        assert document["result"]["content"] == f"out-{index}"


def test_bulk_max_wait_seconds_forces_flush_of_single_record():
    mongo_store = FakeMongoStore()
    bedrock_client = FakeBedrockClient()
    client = make_bedrock_batch_client(
        mongo_store, bedrock_client, min_records=5, max_wait_seconds=0
    )
    request = make_request()

    original_create = bedrock_client.create_model_invocation_job

    def create_and_complete(**kwargs):
        response = original_create(**kwargs)
        _stage_completed_output(
            client,
            kwargs,
            [{"recordId": request.request_id, "modelOutput": converse_output("solo")}],
        )
        return response

    bedrock_client.create_model_invocation_job = create_and_complete

    result = client.submit_and_wait(request, "amazon.nova-lite-v1:0", strategy="bulk")

    assert result["content"] == "solo"
    assert len(bedrock_client.create_calls) == 1


def test_bulk_flush_failure_releases_claim_for_retry():
    mongo_store = FakeMongoStore()
    bedrock_client = FakeBedrockClient()
    client = make_bedrock_batch_client(
        mongo_store,
        bedrock_client,
        min_records=1,
        max_wait_seconds=0,
        job_timeout_seconds=0.2,
    )

    def failing_create(**_kwargs):
        raise RuntimeError("boom")

    bedrock_client.create_model_invocation_job = failing_create
    request = make_request()

    with pytest.raises(BadRequest):
        client.submit_and_wait(request, "amazon.nova-lite-v1:0", strategy="bulk")

    document = mongo_store.get_document(request.request_id)
    assert document["job"]["status"] == "PENDING_BULK"
    assert "claim_id" not in document["job"]


def test_bulk_fan_out_does_not_write_result_for_invalidated_attempt():
    mongo_store = FakeMongoStore()
    bedrock_client = FakeBedrockClient()
    client = make_bedrock_batch_client(
        mongo_store, bedrock_client, min_records=1, max_wait_seconds=0
    )
    request = make_request()

    original_create = bedrock_client.create_model_invocation_job

    def create_and_invalidate(**kwargs):
        response = original_create(**kwargs)
        _stage_completed_output(
            client,
            kwargs,
            [{"recordId": request.request_id, "modelOutput": converse_output("late")}],
        )
        # Simulate a concurrent project-abort bumping the attempt_id right
        # after the shared job was submitted but before results were read.
        mongo_store.get_document(request.request_id)["attempt_id"] = "aborted-xyz"
        return response

    bedrock_client.create_model_invocation_job = create_and_invalidate

    with pytest.raises(BadRequest):
        client.submit_and_wait(request, "amazon.nova-lite-v1:0", strategy="bulk")

    document = mongo_store.get_document(request.request_id)
    assert document["result"] is None
