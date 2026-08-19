import logging
import os
from enum import Enum

import boto3
from botocore.exceptions import ClientError
from engine_libs.lib.bases import MongoPollingLLMBase
from engine_libs.llm_runtime.bedrock_converse_codec import (
    extract_converse_text,
    extract_converse_usage_metadata,
    to_bedrock_messages,
)
from engine_libs.utils.llm_model_assert_util import LLMModelAssertUtil
from engine_libs.utils.llm_model_util import LLMModelUtil
from langchain_core.messages import AIMessage, BaseMessage

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.mongo_polling_llm_context import MongoPollingLLMContext

logger = logging.getLogger(__name__)


class BedrockEndpoint(str, Enum):
    """Bedrock service endpoints. See docs/bedrock/model-availability-consolidated.md."""

    RUNTIME = "bedrock-runtime"
    MANTLE = "bedrock-mantle"


class BedrockApiOperation(str, Enum):
    """Bedrock inference APIs a model can expose. See docs/bedrock/model-availability-consolidated.md."""

    CONVERSE = "Converse"
    INVOKE = "Invoke"
    CHAT_COMPLETIONS = "ChatCompletions"
    RESPONSES = "Responses"
    MESSAGES = "Messages"


class BedrockServiceTier(str, Enum):
    """Bedrock request service tiers. See docs/bedrock/capacity-and-performance.md."""

    DEFAULT = "default"
    FLEX = "flex"
    PRIORITY = "priority"
    RESERVED = "reserved"


class _BedrockConverseWrapper:
    @staticmethod
    def _assert_client_error_not_resource_not_found(
        *, error_code: str, model_id: str, region_name: str, exc: ClientError
    ) -> None:
        if error_code in {"ResourceNotFoundException", "ValidationException"}:
            raise BadRequest(
                "Bedrock model is unavailable. "
                f"model_id={model_id}, region={region_name or 'default'}."
            ) from exc

    @staticmethod
    def _assert_client_error_not_access_denied(
        *, error_code: str, model_id: str, region_name: str, exc: ClientError
    ) -> None:
        if error_code in {"AccessDeniedException", "UnauthorizedOperation"}:
            raise BadRequest(
                "Bedrock access denied while validating model availability. "
                f"model_id={model_id}, region={region_name or 'default'}."
            ) from exc

    @staticmethod
    def _raise_bedrock_validation_failed(
        *, model_id: str, region_name: str, exc: ClientError
    ) -> None:
        raise BadRequest(
            "Failed to validate Bedrock model availability. "
            f"model_id={model_id}, region={region_name or 'default'}."
        ) from exc

    @staticmethod
    def _assert_invoke_not_access_denied(*, error_code: str, exc: ClientError) -> None:
        if error_code in {"AccessDeniedException", "UnauthorizedOperation"}:
            raise BadRequest("Bedrock invoke denied.") from exc

    @staticmethod
    def _assert_invoke_not_model_unavailable(
        *, error_code: str, exc: ClientError
    ) -> None:
        if error_code in {"ResourceNotFoundException", "ValidationException"}:
            raise BadRequest("Bedrock invoke failed due to unavailable model.") from exc

    def __init__(
        self,
        *,
        model_id: str,
        region_name: str = "",
        endpoint: BedrockEndpoint = BedrockEndpoint.RUNTIME,
        api_operation: BedrockApiOperation = BedrockApiOperation.CONVERSE,
        service_tier: BedrockServiceTier = BedrockServiceTier.DEFAULT,
    ):
        if endpoint is not BedrockEndpoint.RUNTIME or api_operation is not BedrockApiOperation.CONVERSE:
            raise NotImplementedError(
                f"Bedrock endpoint={endpoint.value!r} api_operation={api_operation.value!r} "
                "is not implemented. This wrapper only supports "
                f"{BedrockEndpoint.RUNTIME.value!r}/{BedrockApiOperation.CONVERSE.value!r} today."
            )
        client_kwargs = {}
        if region_name:
            client_kwargs["region_name"] = region_name
        self._endpoint = endpoint
        self._api_operation = api_operation
        self._service_tier = service_tier
        self._client = boto3.client(endpoint.value, **client_kwargs)
        self._control_client = boto3.client("bedrock", **client_kwargs)
        self._model_id = model_id
        self._region_name = region_name or os.getenv("AWS_REGION", "")
        self._verify_model_availability()

    def _verify_model_availability(self) -> None:
        try:
            self._control_client.get_foundation_model(modelIdentifier=self._model_id)
        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code", "")
            self._assert_client_error_not_resource_not_found(
                error_code=error_code,
                model_id=self._model_id,
                region_name=self._region_name,
                exc=exc,
            )
            self._assert_client_error_not_access_denied(
                error_code=error_code,
                model_id=self._model_id,
                region_name=self._region_name,
                exc=exc,
            )
            self._raise_bedrock_validation_failed(
                model_id=self._model_id,
                region_name=self._region_name,
                exc=exc,
            )

    def invoke(self, messages: list[BaseMessage]) -> AIMessage:
        converse_kwargs = {
            "modelId": self._model_id,
            "messages": to_bedrock_messages(messages),
        }
        if self._service_tier is not BedrockServiceTier.DEFAULT:
            converse_kwargs["service_tier"] = self._service_tier.value
        try:
            response = self._client.converse(**converse_kwargs)
        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code", "")
            self._assert_invoke_not_access_denied(error_code=error_code, exc=exc)
            self._assert_invoke_not_model_unavailable(error_code=error_code, exc=exc)
            raise
        return AIMessage(
            content=extract_converse_text(response),
            usage_metadata=extract_converse_usage_metadata(response),
        )


class BedrockPollingLLM(MongoPollingLLMBase):
    def __init__(
        self,
        context: MongoPollingLLMContext,
        *,
        endpoint: BedrockEndpoint = BedrockEndpoint.RUNTIME,
        api_operation: BedrockApiOperation = BedrockApiOperation.CONVERSE,
        service_tier: BedrockServiceTier = BedrockServiceTier.DEFAULT,
    ):
        LLMModelAssertUtil.assert_context_model_id_required(
            context=context,
            model_type="bedrock",
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
        self.llm = _BedrockConverseWrapper(
            model_id=self.model_tag,
            region_name=region_name,
            endpoint=endpoint,
            api_operation=api_operation,
            service_tier=service_tier,
        )

    @raise_exception(
        "Failed to extract json (bedrock).",
        exception_logger=logger,
    )
    def extract_json(self, ai_content):
        return LLMModelUtil.extract_json_from_content(ai_content.content)
