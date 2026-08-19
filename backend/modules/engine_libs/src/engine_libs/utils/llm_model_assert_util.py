from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.mongo_polling_llm_context import MongoPollingLLMContext


class LLMModelAssertUtil:
    @staticmethod
    def _context_model_id(*, context: MongoPollingLLMContext) -> str:
        return str(context.llm_model_config.get("model_id", "")).strip()

    @staticmethod
    def assert_context_required_for_polling(
        *, context: MongoPollingLLMContext, provider_name: str
    ) -> None:
        if context.response_mode is None:
            raise BadRequest(
                f"context.response_mode is required for {provider_name} polling."
            )
        if not context.canonical_llm.strip():
            raise BadRequest(
                f"context.canonical_llm is required for {provider_name} polling."
            )
        if not LLMModelAssertUtil._context_model_id(context=context):
            raise BadRequest(
                f"context.model_id is required for {provider_name} polling."
            )

    @staticmethod
    def assert_context_model_id_required(
        *, context: MongoPollingLLMContext, model_type: str
    ) -> None:
        if LLMModelAssertUtil._context_model_id(context=context):
            return
        raise BadRequest(
            f"context.model_id is required for {model_type} model: "
            f"{context.canonical_llm}"
        )

    @staticmethod
    def assert_mongo_store_required(*, mongo_store, message: str) -> None:
        if mongo_store is None:
            raise BadRequest(message)
