import json
import logging
import os

from engine_libs.lib.bases import MongoPollingLLMBase
from engine_libs.utils.llm_model_assert_util import LLMModelAssertUtil
from langchain_openai import ChatOpenAI

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.mongo_polling_llm_context import MongoPollingLLMContext

logger = logging.getLogger(__name__)


class OpenAIPollingLLM(MongoPollingLLMBase):
    @staticmethod
    def _assert_openai_apikey_required(*, apikey: str) -> None:
        if apikey.strip():
            return
        raise BadRequest("llm_apikey_openai is required for OpenAI polling.")

    @classmethod
    def _resolve_openai_apikey(cls, *, context: MongoPollingLLMContext) -> str:
        apikey = str(context.llm_model_config.get("apikey", "")).strip()
        cls._assert_openai_apikey_required(apikey=apikey)
        return apikey

    def __init__(
        self,
        context: MongoPollingLLMContext,
    ):
        LLMModelAssertUtil.assert_context_required_for_polling(
            context=context,
            provider_name="OpenAI",
        )
        apikey = self._resolve_openai_apikey(context=context)
        super().__init__(context)
        if "OPENAI_API_KEY" not in os.environ:
            os.environ["OPENAI_API_KEY"] = apikey
        openai_model = ChatOpenAI(model=self.model_tag, timeout=300)
        self.llm = (
            openai_model.bind(response_format={"type": "json_object"})
            if self.response_mode == "json"
            else openai_model
        )

    @raise_exception(
        "Failed to extract json message (openai).",
        exception_logger=logger,
    )
    def extract_json_message(self, ai_content):
        try:
            return json.loads(ai_content["text"])
        except Exception as e:
            logger.info(f"[ RR-LLM ] JSON extraction problem - {e}")
            return None

    @raise_exception(
        "Failed to extract json (openai).",
        exception_logger=logger,
    )
    def extract_json(self, ai_content):
        text = ai_content.content
        if isinstance(text, str):
            try:
                return json.loads(text)
            except Exception:
                pass
            if "```json" in text:
                start = text.find("```json") + len("```json")
                end = text.find("```", start)
                if end != -1:
                    try:
                        return json.loads(text[start:end].strip())
                    except Exception:
                        pass
            first = text.find("{")
            last = text.rfind("}")
            if first != -1 and last != -1 and last > first:
                try:
                    return json.loads(text[first : last + 1])
                except Exception:
                    pass
        logger.info("[ RR-LLM ] JSON extraction problem - could not parse content")
        return None
