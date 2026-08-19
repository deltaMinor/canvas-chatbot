import os
from typing import Any

from langchain_ollama import ChatOllama


def env_bool(name: str, default: bool = False) -> bool:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    return raw_value.strip().lower() in {"1", "true", "yes", "y", "on"}


def get_reasoning_env_name(model_tag: str) -> str | None:
    if model_tag.startswith("qwen3"):
        return "LLM_MODEL_QWEN_REASONING"
    if model_tag.startswith("ministral-3"):
        return "LLM_MODEL_MINISTRAL_REASONING"
    return None


def build_llm(*, model_tag: str, response_mode: str | None) -> ChatOllama:
    kwargs: dict[str, Any] = {
        "model": model_tag,
        "base_url": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        "timeout": int(os.getenv("OLLAMA_INFERENCE_TIMEOUT", "600")),
    }
    if response_mode:
        kwargs["format"] = response_mode
    reasoning_env_name = get_reasoning_env_name(model_tag)
    if reasoning_env_name and env_bool(reasoning_env_name):
        kwargs["reasoning"] = True
    return ChatOllama(**kwargs)
