import json
import logging
from urllib.parse import urlparse

from engine_libs.lib.bases import MongoPollingLLMBase
from engine_libs.utils.llm_model_assert_util import LLMModelAssertUtil
from engine_libs.utils.llm_model_ollama_util import LLMModelOllamaUtil
from engine_libs.utils.llm_model_util import LLMModelUtil
from langchain_ollama import ChatOllama

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.mongo_polling_llm_context import MongoPollingLLMContext

logger = logging.getLogger(__name__)


class LocalOllamaPollingLLM(MongoPollingLLMBase):
    @staticmethod
    def _assert_ollama_model_configured(*, context: MongoPollingLLMContext) -> None:
        if context.llm_model_config:
            return
        raise BadRequest(
            f"Ollama model key '{context.canonical_llm}' is not configured. "
            "Update shared_libs.constants.llm.LLM_LOCAL_CATALOG."
        )

    @classmethod
    def _resolve_base_url(cls, *, context: MongoPollingLLMContext) -> str:
        base_url = str(context.llm_model_config.get("local_url", "")).strip()
        cls._assert_base_url_valid(base_url=base_url)
        return base_url

    @staticmethod
    def _assert_base_url_valid(*, base_url: str) -> None:
        value = base_url.strip()
        if not value:
            raise BadRequest("llm_local_url is required for local ollama polling.")
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise BadRequest(
                "llm_local_url must be a valid http(s) URL for local ollama polling."
            )

    @staticmethod
    def _resolve_reasoning(*, context: MongoPollingLLMContext) -> bool:
        reasoning_cfg = context.llm_model_config.get("reasoning")
        if isinstance(reasoning_cfg, bool):
            return reasoning_cfg
        if isinstance(reasoning_cfg, str):
            return LLMModelOllamaUtil.env_bool(reasoning_cfg.strip())
        return False

    def __init__(
        self,
        context: MongoPollingLLMContext,
    ):
        self._assert_ollama_model_configured(context=context)
        base_url = self._resolve_base_url(context=context)
        LLMModelAssertUtil.assert_context_model_id_required(
            context=context,
            model_type="local",
        )
        LLMModelOllamaUtil.assert_ollama_model_available(
            base_url,
            str(context.llm_model_config.get("model_id", "")).strip(),
        )
        super().__init__(context)

        kwargs = {"model": self.model_tag, "base_url": base_url, "timeout": 300}
        if self.response_mode is not None:
            kwargs["format"] = self.response_mode
        if self._resolve_reasoning(context=context):
            kwargs["reasoning"] = True

        self.llm = ChatOllama(**kwargs)

    @raise_exception(
        "Failed to extract json message (local polling ollama).",
        exception_logger=logger,
    )
    def extract_json_message(self, ai_content):
        try:
            return json.loads(ai_content["text"])
        except Exception as e:
            logger.info(f"[ RR-LLM ] JSON extraction problem - {e}")
            return None

    @raise_exception(
        "Failed to extract json (local polling ollama).",
        exception_logger=logger,
    )
    def extract_json(self, ai_content):
        return LLMModelUtil.extract_json_from_content(ai_content.content)
