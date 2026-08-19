import hashlib
import logging
import os
import time

import boto3
from engine_libs.lib.bases import MongoPollingLLMBase
from engine_libs.llm_runtime.bedrock_batch_client import BedrockBatchClient
from engine_libs.llm_runtime.config import (
    get_bedrock_batch_job_timeout_seconds,
    get_bedrock_batch_lock_lease_seconds,
    get_bedrock_batch_max_records,
    get_bedrock_batch_max_wait_seconds,
    get_bedrock_batch_min_records,
    get_bedrock_batch_poll_seconds,
    get_bedrock_batch_role_arn,
    get_bedrock_batch_s3_bucket,
    get_bedrock_batch_strategy,
)
from engine_libs.llm_runtime.contracts import LlmJobRequest, encode_payload
from engine_libs.utils.llm_model_assert_util import LLMModelAssertUtil
from engine_libs.utils.llm_model_util import LLMModelUtil
from langchain_core.messages import BaseMessage, message_to_dict

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.mongo_polling_llm_context import MongoPollingLLMContext

logger = logging.getLogger(__name__)


class BedrockBatchPollingLLM(MongoPollingLLMBase):
    @staticmethod
    def _assert_bucket_configured(*, bucket: str) -> None:
        if not bucket:
            raise BadRequest(
                "LLM_BEDROCK_BATCH_S3_BUCKET is required for Bedrock batch execution"
            )

    @staticmethod
    def _assert_role_arn_configured(*, role_arn: str) -> None:
        if not role_arn:
            raise BadRequest(
                "LLM_BEDROCK_BATCH_ROLE_ARN is required for Bedrock batch execution"
            )

    def __init__(self, context: MongoPollingLLMContext):
        LLMModelAssertUtil.assert_context_model_id_required(
            context=context,
            model_type="bedrock_batch",
        )
        LLMModelAssertUtil.assert_mongo_store_required(
            mongo_store=context.mongo_store,
            message="mongo_store is required for Bedrock batch execution",
        )
        bedrock_region_map = LLMModelUtil.parse_key_value_map(
            os.getenv("LLM_BEDROCK_REGIONS", "")
            or os.getenv("LLM_BEDROCK_REGION_MAP", "")
        )
        family = LLMModelUtil.resolve_model_family(context.canonical_llm)
        region_name = (
            bedrock_region_map.get(context.canonical_llm, "")
            or (os.getenv(f"LLM_BEDROCK_REGION_{family}", "") if family else "")
            or os.getenv("LLM_BEDROCK_REGION_DEFAULT", "")
            or os.getenv("LLM_BEDROCK_DEFAULT_REGION", "")
            or os.getenv("AWS_REGION", "")
        ).strip()
        super().__init__(context)
        self.model_id = self.model_tag
        self.bedrock_batch_client = self._build_bedrock_batch_client(
            region_name=region_name
        )

    def _build_bedrock_batch_client(self, *, region_name: str) -> BedrockBatchClient:
        bucket = get_bedrock_batch_s3_bucket()
        role_arn = get_bedrock_batch_role_arn()
        self._assert_bucket_configured(bucket=bucket)
        self._assert_role_arn_configured(role_arn=role_arn)
        client_kwargs = {"region_name": region_name} if region_name else {}
        return BedrockBatchClient(
            mongo_store=self.mongo_store,
            bedrock_client=boto3.client("bedrock", **client_kwargs),
            s3_client=boto3.client("s3", **client_kwargs),
            bucket=bucket,
            role_arn=role_arn,
            min_records=get_bedrock_batch_min_records(),
            max_records=get_bedrock_batch_max_records(),
            max_wait_seconds=get_bedrock_batch_max_wait_seconds(),
            job_timeout_seconds=get_bedrock_batch_job_timeout_seconds(),
            poll_seconds=get_bedrock_batch_poll_seconds(),
            lock_lease_seconds=get_bedrock_batch_lock_lease_seconds(),
        )

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

    def _report_bedrock_batch_status(
        self, status: str, job_arn: str, request_id: str = ""
    ) -> None:
        logger.info(
            "[ LLM-BEDROCK-BATCH ] Bedrock batch status update: "
            "request_id=%s job_arn=%s status=%s",
            request_id,
            job_arn,
            status,
        )
        self._report_llm_progress(
            f"Bedrock batch job status: {status}.",
            self._llm_progress_metadata(
                event="status",
                execution="bedrock_batch",
                request_id=request_id,
                job_id=job_arn,
                extra={
                    "checkpoint_name": "llm.bedrock_batch.status",
                    "bedrock_batch_status": status,
                },
            ),
        )

    @raise_exception(
        "Failed to invoke bedrock batch model.",
        exception_logger=logger,
    )
    def invoke(self, message):
        messages: list[BaseMessage] = self._coerce_messages(message)
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
            "Bedrock batch call started.",
            self._llm_progress_metadata(
                event="started",
                execution="bedrock_batch",
                request_id=request.request_id,
            ),
        )
        try:
            result = self.bedrock_batch_client.submit_and_wait(
                request,
                self.model_id,
                strategy=get_bedrock_batch_strategy(),
                status_callback=(
                    lambda status, job_arn: self._report_bedrock_batch_status(
                        status, job_arn, request.request_id
                    )
                ),
            )
        except Exception as exc:
            self._report_llm_progress(
                "Bedrock batch call failed.",
                self._llm_progress_metadata(
                    event="failed",
                    execution="bedrock_batch",
                    request_id=request.request_id,
                    duration_seconds=time.monotonic() - started_at,
                    error=exc,
                ),
            )
            raise
        self._report_llm_progress(
            "Bedrock batch call completed.",
            self._llm_progress_metadata(
                event="succeeded",
                execution="bedrock_batch",
                request_id=request.request_id,
                job_id=result.get("batch_job_id", ""),
                duration_seconds=time.monotonic() - started_at,
                extra={"usage_metadata": result.get("usage_metadata")}
                if result.get("usage_metadata")
                else None,
            ),
        )
        return self._ai_message_from_result(result)

    @raise_exception(
        "Failed to extract json (bedrock batch).",
        exception_logger=logger,
    )
    def extract_json(self, ai_content):
        return LLMModelUtil.extract_json_from_content(ai_content.content)
