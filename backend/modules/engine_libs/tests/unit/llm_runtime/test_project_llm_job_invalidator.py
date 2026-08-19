from unittest.mock import patch

from botocore.exceptions import NoRegionError
from service.lib.project_llm_job_invalidator import ProjectLlmJobInvalidator


class FakeBatchClient:
    def __init__(self):
        self.cancel_calls = []
        self.terminate_calls = []

    def cancel_job(self, **kwargs):
        self.cancel_calls.append(kwargs)

    def terminate_job(self, **kwargs):
        self.terminate_calls.append(kwargs)


class FakeBedrockClient:
    def __init__(self):
        self.stop_calls = []

    def stop_model_invocation_job(self, **kwargs):
        self.stop_calls.append(kwargs)


class FakeMongoStore:
    def __init__(self, documents=None):
        self.documents = documents or []
        self.invalidated_projects = []

    def get_active_job_documents(self, *, project_id):
        return [
            document
            for document in self.documents
            if document.get("request", {}).get("project_id") == project_id
        ]

    def invalidate_active_jobs(self, *, project_id, reason="assessment_abort"):
        self.invalidated_projects.append((project_id, reason))
        return len(self.get_active_job_documents(project_id=project_id))


def test_from_database_does_not_create_batch_client_until_needed():
    mongo_store = FakeMongoStore()

    with (
        patch(
            "service.lib.project_llm_job_invalidator.build_batch_llm_mongo_store",
            return_value=mongo_store,
        ),
        patch(
            "service.lib.project_llm_job_invalidator.boto3.client",
            side_effect=NoRegionError(),
        ) as mock_boto_client,
    ):
        invalidator = ProjectLlmJobInvalidator.from_database(object())
        count = invalidator.invalidate_active_jobs(project_id="project-1")

    assert count == 0
    mock_boto_client.assert_not_called()


def test_hosted_llm_job_ids_are_invalidated_without_aws_batch_client():
    mongo_store = FakeMongoStore(
        [
            {
                "request": {"project_id": "project-1"},
                "job": {
                    "batch_job_id": "hosted-openai-job-1",
                    "status": "RUNNING",
                },
            }
        ]
    )
    invalidator = ProjectLlmJobInvalidator(
        mongo_store,
        batch_client_factory=lambda: (_ for _ in ()).throw(NoRegionError()),
    )

    count = invalidator.invalidate_active_jobs(
        project_id="project-1",
        reason="assessment_abort",
    )

    assert count == 1
    assert mongo_store.invalidated_projects == [("project-1", "assessment_abort")]


def test_bedrock_batch_job_is_stopped_via_bedrock_client_not_aws_batch():
    mongo_store = FakeMongoStore(
        [
            {
                "request": {"project_id": "project-1"},
                "job": {
                    "batch_job_id": "arn:aws:bedrock:job-1",
                    "bedrock_job_arn": "arn:aws:bedrock:job-1",
                    "status": "SUBMITTED",
                },
            }
        ]
    )
    batch_client = FakeBatchClient()
    bedrock_client = FakeBedrockClient()
    invalidator = ProjectLlmJobInvalidator(
        mongo_store,
        batch_client=batch_client,
        bedrock_client=bedrock_client,
    )

    count = invalidator.invalidate_active_jobs(
        project_id="project-1",
        reason="assessment_abort",
    )

    assert count == 1
    assert bedrock_client.stop_calls == [{"jobIdentifier": "arn:aws:bedrock:job-1"}]
    assert batch_client.cancel_calls == []
    assert batch_client.terminate_calls == []


def test_bedrock_batch_pending_pool_record_needs_no_aws_call():
    mongo_store = FakeMongoStore(
        [
            {
                "request": {"project_id": "project-1"},
                "job": {"status": "PENDING_BULK", "bucket_key": "amazon.nova-lite-v1:0"},
            }
        ]
    )
    invalidator = ProjectLlmJobInvalidator(
        mongo_store,
        bedrock_client_factory=lambda: (_ for _ in ()).throw(NoRegionError()),
    )

    count = invalidator.invalidate_active_jobs(
        project_id="project-1",
        reason="assessment_abort",
    )

    assert count == 1


def test_real_batch_job_ids_are_stopped_before_local_invalidation():
    mongo_store = FakeMongoStore(
        [
            {
                "request": {"project_id": "project-1"},
                "job": {"batch_job_id": "job-submitted", "status": "SUBMITTED"},
            },
            {
                "request": {"project_id": "project-1"},
                "job": {"batch_job_id": "job-running", "status": "RUNNING"},
            },
        ]
    )
    batch_client = FakeBatchClient()
    invalidator = ProjectLlmJobInvalidator(mongo_store, batch_client=batch_client)

    count = invalidator.invalidate_active_jobs(
        project_id="project-1",
        reason="assessment_abort",
    )

    assert count == 2
    assert batch_client.cancel_calls == [
        {"jobId": "job-submitted", "reason": "assessment_abort"}
    ]
    assert batch_client.terminate_calls == [
        {"jobId": "job-running", "reason": "assessment_abort"}
    ]
