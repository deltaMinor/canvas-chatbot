from typing import Any, Protocol


class LlmJobRequestProtocol(Protocol):
    request_id: str
    attempt_id: str
    canonical_llm: str
    model_tag: str
    messages: list[Any]
    response_mode: str | None
    queue_name: str
    task_name: str
    task_type: str
    project_id: str
    metadata: dict[str, Any]

    def to_payload(self) -> dict[str, Any]: ...


__all__ = [
    "LlmJobRequestProtocol",
]
