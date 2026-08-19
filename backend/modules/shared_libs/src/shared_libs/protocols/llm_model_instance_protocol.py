from typing import Any, Protocol, TypeAlias


class _PollingLLMProtocol(Protocol):
    name: str | None
    llm: Any

    def invoke(self, message: Any) -> Any: ...

    def extract_json(self, ai_content: Any) -> dict[str, Any] | list[Any] | None: ...

    def extract_json_message(
        self, ai_content: Any
    ) -> dict[str, Any] | list[Any] | None: ...

    def check_nonempty_json(self, schema: Any, returned_result: Any) -> bool: ...


class BatchOllamaPollingLLMProtocol(_PollingLLMProtocol, Protocol):
    pass


class BedrockPollingLLMProtocol(_PollingLLMProtocol, Protocol):
    pass


class GeminiPollingLLMProtocol(_PollingLLMProtocol, Protocol):
    pass


class LocalOllamaPollingLLMProtocol(_PollingLLMProtocol, Protocol):
    pass


class OpenAIPollingLLMProtocol(_PollingLLMProtocol, Protocol):
    pass


LlmModelInstanceProtocol: TypeAlias = (
    BatchOllamaPollingLLMProtocol
    | BedrockPollingLLMProtocol
    | GeminiPollingLLMProtocol
    | LocalOllamaPollingLLMProtocol
    | OpenAIPollingLLMProtocol
)


__all__ = [
    "BatchOllamaPollingLLMProtocol",
    "BedrockPollingLLMProtocol",
    "GeminiPollingLLMProtocol",
    "LlmModelInstanceProtocol",
    "LocalOllamaPollingLLMProtocol",
    "OpenAIPollingLLMProtocol",
]
