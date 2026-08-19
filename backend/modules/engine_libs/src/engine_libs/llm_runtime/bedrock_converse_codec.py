from engine_libs.utils.llm_model_util import LLMModelUtil
from langchain_core.messages import BaseMessage, HumanMessage


def to_bedrock_messages(messages: list[BaseMessage]) -> list[dict]:
    bedrock_messages: list[dict] = []
    for message in messages:
        role = "user" if isinstance(message, HumanMessage) else "assistant"
        text = LLMModelUtil.coerce_message_content_text(message.content)
        bedrock_messages.append({"role": role, "content": [{"text": text}]})
    return bedrock_messages


def extract_converse_text(response: dict) -> str:
    content = response.get("output", {}).get("message", {}).get("content", [])
    texts = [item.get("text", "") for item in content if isinstance(item, dict)]
    return "".join(texts).strip()


def extract_converse_usage_metadata(response: dict) -> dict:
    usage = response.get("usage")
    if not isinstance(usage, dict):
        return {}

    usage_metadata = {
        "input_tokens": usage.get("inputTokens"),
        "output_tokens": usage.get("outputTokens"),
        "total_tokens": usage.get("totalTokens"),
    }
    return {
        key: value
        for key, value in usage_metadata.items()
        if isinstance(value, int | float) and not isinstance(value, bool)
    }
