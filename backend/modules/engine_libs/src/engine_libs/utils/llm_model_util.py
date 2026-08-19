import json
import logging
from typing import Any

from engine_libs.llm_runtime.config import normalize_model_key

logger = logging.getLogger(__name__)


class LLMModelUtil:
    @staticmethod
    def resolve_model_family(canonical_llm: str) -> str:
        if canonical_llm.startswith("openai_"):
            return "OPENAI"
        if canonical_llm.startswith("gemini_"):
            return "GEMINI"
        if canonical_llm.startswith("qwen_"):
            return "QWEN"
        if canonical_llm.startswith("ministral_"):
            return "MINISTRAL"
        return ""

    @staticmethod
    def parse_key_value_map(raw_value: str) -> dict[str, str]:
        mapping: dict[str, str] = {}
        for item in raw_value.split(","):
            if not item.strip():
                continue
            model_key, separator, model_id = item.partition("=")
            if not separator:
                continue
            key = normalize_model_key(model_key.strip())
            value = model_id.strip()
            if key and value:
                mapping[key] = value
        return mapping

    @staticmethod
    def coerce_message_content_text(raw: Any) -> str:
        """Coerce LLM message content to a plain string.

        The canonical shape is ``str``.  ``list[str]`` (multi-part text) and
        ``list[dict]`` (OpenAI-style content blocks with "text"/"content" keys)
        are accepted because different LLM providers return different formats.
        Any other type is unexpected — a warning is emitted before coercion.
        """
        if isinstance(raw, list):
            parts = []
            for part in raw:
                if isinstance(part, str):
                    parts.append(part)
                elif isinstance(part, dict):
                    parts.append(part.get("text") or part.get("content") or "")
                else:
                    logger.warning(
                        "coerce_message_content_text: unexpected list item type %s"
                        " — coercing via str(). Provider should return str or dict.",
                        type(part).__name__,
                    )
                    parts.append(str(part))
            raw = "".join(parts)
        if raw is None:
            logger.warning(
                "coerce_message_content_text: received None — expected str."
                " Provider returned empty content.",
            )
            raw = ""
        if not isinstance(raw, str):
            logger.warning(
                "coerce_message_content_text: unexpected type %s — coercing via str()."
                " Provider should return str or list.",
                type(raw).__name__,
            )
            raw = str(raw)
        return raw.strip()

    @staticmethod
    def extract_json_from_content(raw: Any):
        text = LLMModelUtil.coerce_message_content_text(raw)
        if not text:
            return None

        try:
            return json.loads(text)
        except Exception:
            pass

        if "</think>" in text:
            text = text.split("</think>", 1)[1].strip()
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
                except Exception as e:
                    logger.info(f"[ RR-LLM ] JSON extraction problem - {e}")

        first = text.find("{")
        last = text.rfind("}")
        if first != -1 and last != -1 and last > first:
            try:
                return json.loads(text[first : last + 1])
            except Exception as e:
                logger.info(f"[ RR-LLM ] JSON extraction problem - {e}")

        return None
