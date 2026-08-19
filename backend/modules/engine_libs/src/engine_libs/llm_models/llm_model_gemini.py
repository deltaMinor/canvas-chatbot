import json
import logging
import os

from engine_libs.lib.bases import MongoPollingLLMBase
from engine_libs.utils.llm_model_assert_util import LLMModelAssertUtil
from langchain_google_genai import ChatGoogleGenerativeAI

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.mongo_polling_llm_context import MongoPollingLLMContext

logger = logging.getLogger(__name__)


class GeminiPollingLLM(MongoPollingLLMBase):
    @staticmethod
    def _assert_gemini_apikey_required(*, apikey: str) -> None:
        if apikey.strip():
            return
        raise BadRequest("llm_apikey_gemini is required for Gemini polling.")

    @classmethod
    def _resolve_gemini_apikey(cls, *, context: MongoPollingLLMContext) -> str:
        apikey = str(context.llm_model_config.get("apikey", "")).strip()
        cls._assert_gemini_apikey_required(apikey=apikey)
        return apikey

    def __init__(
        self,
        context: MongoPollingLLMContext,
    ):
        LLMModelAssertUtil.assert_context_required_for_polling(
            context=context,
            provider_name="Gemini",
        )
        apikey = self._resolve_gemini_apikey(context=context)
        super().__init__(context)
        if "GOOGLE_API_KEY" not in os.environ:
            os.environ["GOOGLE_API_KEY"] = apikey
        config = (
            {"response_mime_type": "application/json"}
            if self.response_mode == "json"
            else {}
        )
        self.llm = ChatGoogleGenerativeAI(
            model=self.model_tag,
            model_kwargs={"generation_config": config} if config else {},
            timeout=300,
            safety_settings={"HARM_CATEGORY_CIVIC_INTEGRITY": "BLOCK_NONE"},
        )

    def _extract_json(self, ai_content):
        if ai_content is None:
            return None
        if isinstance(ai_content, list):
            parts = []
            for p in ai_content:
                if isinstance(p, str):
                    parts.append(p)
                elif isinstance(p, dict):
                    parts.append(p.get("text") or p.get("content") or "")
                else:
                    parts.append(str(p))
            ai_content = "".join(parts)
        if not isinstance(ai_content, str):
            ai_content = str(ai_content)
        text = ai_content.strip()
        if not text:
            return None
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
        return None

    @raise_exception(
        "Failed to extract json message (gemini).",
        exception_logger=logger,
    )
    def extract_json_message(self, ai_content):
        return self._extract_json(ai_content["text"])

    @raise_exception(
        "Failed to extract json (gemini).",
        exception_logger=logger,
    )
    def extract_json(self, ai_content):
        return self._extract_json(ai_content.content)
