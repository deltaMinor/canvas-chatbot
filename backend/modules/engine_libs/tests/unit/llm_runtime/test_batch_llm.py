from datetime import UTC

import pytest
from django.conf import settings

if not settings.configured:
    settings.configure(TZINFO=UTC)

from engine_libs.lib.bases import MongoPollingLLMBase
from engine_libs.llm_models import BatchOllamaPollingLLM
from engine_libs.llm_runtime.bedrock_converse_codec import (
    extract_converse_usage_metadata,
)
from engine_libs.llm_runtime.context import ENGINE_LLM_CONTEXT
from engine_libs.llm_runtime.mongo_store import ACTIVE_JOB_STATUSES
from langchain_core.messages import AIMessage, HumanMessage

from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.mongo_polling_llm_context import MongoPollingLLMContext
from shared_libs.protocols import BatchOllamaPollingLLMProtocol


class FakeBatchLlmClient:
    def __init__(self, content='{"ok": true}'):
        self.submitted_requests = []
        self.wait_calls = []
        self.content = content

    def submit_request(self, request, *, before_submit=None):
        if before_submit:
            before_submit()
        self.submitted_requests.append(request)
        return {"batch_job_id": "job-1"}

    def wait_for_result(self, **kwargs):
        self.wait_calls.append(kwargs)
        return {"content": self.content}


class FakeMongoStore:
    def __init__(self):
        self.documents = {}
        self.repository = None

    def get_document(self, request_id):
        return self.documents.get(request_id)

    def put_request_document(self, request):
        self.documents[request.request_id] = {
            "_id": request.request_id,
            "request_id": request.request_id,
            "attempt_id": request.attempt_id,
            "request": request.to_payload(),
            "job": None,
            "result": None,
        }

    def reserve_request_submission(self, request):
        document = self.documents.get(request.request_id)
        if document and (document.get("job") or {}).get("status") in ACTIVE_JOB_STATUSES:
            return False
        self.put_request_document(request)
        return True

    def put_job_record(self, job):
        self.documents[job["request_id"]]["job"] = job

    def abort_request_attempt(self, *, request_id, attempt_id, reason):
        document = self.documents.get(request_id)
        if document is None or document.get("attempt_id") != attempt_id:
            return
        document["job"] = {
            **(document.get("job") or {}),
            "status": "ABORTED",
            "invalidation_reason": reason,
        }

    def put_result(self, *, request_id, attempt_id, result):
        document = self.documents.get(request_id)
        if document is None or document.get("attempt_id") != attempt_id:
            return
        document["result"] = result

    def put_job_result(self, *, request_id, attempt_id, job, result=None):
        document = self.documents[request_id]
        if document["attempt_id"] != attempt_id:
            return
        document["job"] = job
        if result is not None:
            document["result"] = result

    def get_active_job_documents(self, *, project_id):
        return [
            document
            for document in self.documents.values()
            if document.get("request", {}).get("project_id") == project_id
            and (document.get("job") or {}).get("status") in ACTIVE_JOB_STATUSES
        ]

    def invalidate_active_jobs(self, *, project_id, reason="manual_abort"):
        documents = self.get_active_job_documents(project_id=project_id)
        for document in documents:
            document["job"] = {
                **(document.get("job") or {}),
                "status": "ABORTED",
                "invalidation_reason": reason,
            }
        return len(documents)


class FakeHostedRunnable:
    def invoke(self, messages):
        return AIMessage(content='{"ok": true}')


@pytest.fixture(autouse=True)
def skip_active_generation_check(monkeypatch):
    monkeypatch.setattr(
        BatchOllamaPollingLLM,
        "_assert_generation_is_active",
        lambda self: None,
    )


@pytest.fixture(autouse=True)
def skip_batch_client_build(monkeypatch):
    monkeypatch.setattr(
        BatchOllamaPollingLLM,
        "_build_batch_client",
        lambda self, *, mongo_store=None: None,
    )


def make_llm(
    fake_client: FakeBatchLlmClient,
    *,
    assessment_id: str = "",
) -> BatchOllamaPollingLLMProtocol:
    context = MongoPollingLLMContext(
        canonical_llm="qwen3",
        llm_model_config={"model_id": "qwen3:8b"},
        response_mode="json",
        name="Qwen 3",
        task_context=ENGINE_LLM_CONTEXT,
        project_id="project-1",
        assessment_id=assessment_id,
        mongo_store=FakeMongoStore(),
        wait_timeout=1,
    )
    llm = BatchOllamaPollingLLM(context)
    llm.batch_client = fake_client
    return llm


def test_batch_ollama_invoke_returns_ai_message_content():
    fake_client = FakeBatchLlmClient()
    llm = make_llm(fake_client)

    result = llm.invoke([HumanMessage(content=[{"type": "text", "text": "hello"}])])

    assert result.content == '{"ok": true}'
    request = fake_client.submitted_requests[0]
    assert request.canonical_llm == "qwen3"
    assert request.model_tag == "qwen3:8b"
    assert request.queue_name == "engine_llm_queue"
    assert fake_client.wait_calls[0]["request_id"] == request.request_id


def test_batch_ollama_extract_json_matches_ollama_content_parsing():
    fake_client = FakeBatchLlmClient()
    llm = make_llm(fake_client)

    result = llm.invoke([HumanMessage(content=[{"type": "text", "text": "hello"}])])

    assert llm.extract_json(result) == {"ok": True}


def test_batch_ollama_repair_json_uses_batch_invoke():
    fake_client = FakeBatchLlmClient(content='{"ok": true}')
    llm = make_llm(fake_client)

    result = llm.repair_json(
        json_struc='{"ok": boolean}',
        schema={
            "type": "object",
            "properties": {"ok": {"type": "boolean"}},
            "required": ["ok"],
        },
        returned_result={"ok": "not-a-boolean"},
    )

    assert result == {"ok": True}
    assert len(fake_client.submitted_requests) == 1
    repair_request = fake_client.submitted_requests[0]
    assert (
        repair_request.messages[0]
        .content.strip()
        .startswith("The input JSON needs to follow a particular format.")
    )


def test_batch_ollama_request_id_includes_assessment_id():
    message = [HumanMessage(content=[{"type": "text", "text": "hello"}])]
    first_client = FakeBatchLlmClient()
    second_client = FakeBatchLlmClient()

    make_llm(first_client, assessment_id="assessment-1").invoke(message)
    make_llm(second_client, assessment_id="assessment-2").invoke(message)

    first_request = first_client.submitted_requests[0]
    second_request = second_client.submitted_requests[0]
    assert first_request.request_id != second_request.request_id
    assert first_request.metadata["assessment_id"] == "assessment-1"
    assert second_request.metadata["assessment_id"] == "assessment-2"


def test_batch_ollama_rejects_image_payload_before_submit():
    fake_client = FakeBatchLlmClient()
    llm = make_llm(fake_client)

    with pytest.raises(BadRequest):
        llm.invoke(
            [
                HumanMessage(
                    content=[
                        {"type": "text", "text": "hello"},
                        {"type": "image_url", "image_url": {"url": "data:image/png"}},
                    ]
                )
            ]
        )

    assert fake_client.submitted_requests == []


def test_mongo_polling_llm_writes_job_and_result_to_mongo():
    mongo_store = FakeMongoStore()
    context = MongoPollingLLMContext(
        response_mode="json",
        canonical_llm="openai",
        llm_model_config={"model_id": "gpt-5.2"},
        task_context=ENGINE_LLM_CONTEXT,
        project_id="project-1",
        mongo_store=mongo_store,
        wait_timeout=3,
    )
    llm = MongoPollingLLMBase(context)
    llm.llm = FakeHostedRunnable()

    result = llm.invoke([HumanMessage(content=[{"type": "text", "text": "hello"}])])

    assert result.content == '{"ok": true}'
    document = next(iter(mongo_store.documents.values()))
    assert document["job"]["status"] == "SUCCEEDED"
    assert document["job"]["batch_job_id"].startswith("hosted-openai-")
    assert document["result"]["content"] == '{"ok": true}'


def test_bedrock_converse_usage_metadata_is_normalized():
    response = {
        "usage": {
            "inputTokens": 11,
            "outputTokens": 7,
            "totalTokens": 18,
        }
    }

    assert extract_converse_usage_metadata(response) == {
        "input_tokens": 11,
        "output_tokens": 7,
        "total_tokens": 18,
    }
