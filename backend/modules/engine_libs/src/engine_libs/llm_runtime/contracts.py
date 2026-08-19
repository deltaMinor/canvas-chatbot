import json
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from langchain_core.messages import BaseMessage

    from shared_libs.protocols import LlmJobRequestProtocol

from shared_libs.exceptions.api_exceptions import BadRequest

SCHEMA_VERSION = "llm-batch-v1"


@dataclass(frozen=True)
class LlmJobRequest:
    request_id: str
    attempt_id: str
    canonical_llm: str
    model_tag: str
    messages: list["BaseMessage"]
    response_mode: str | None
    queue_name: str
    task_name: str
    task_type: str
    project_id: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_payload(self) -> dict[str, Any]:
        from langchain_core.messages import message_to_dict

        return {
            "schema_version": SCHEMA_VERSION,
            "request_id": self.request_id,
            "attempt_id": self.attempt_id,
            "canonical_llm": self.canonical_llm,
            "model_tag": self.model_tag,
            "messages": [message_to_dict(message) for message in self.messages],
            "response_mode": self.response_mode,
            "queue_name": self.queue_name,
            "task_name": self.task_name,
            "task_type": self.task_type,
            "project_id": self.project_id,
            "metadata": self.metadata,
        }


def encode_payload(payload: dict[str, Any]) -> bytes:
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")


def encode_request_payload(
    request: "LlmJobRequestProtocol", max_request_bytes: int
) -> bytes:
    encoded = encode_payload(request.to_payload())
    if len(encoded) > max_request_bytes:
        raise BadRequest(
            "LLM Batch request is too large: "
            f"{len(encoded)} bytes exceeds limit {max_request_bytes} bytes"
        )
    return encoded


def decode_payload(raw_payload: bytes | str) -> dict[str, Any]:
    if isinstance(raw_payload, bytes):
        raw_payload = raw_payload.decode("utf-8")
    try:
        payload = json.loads(raw_payload)
    except json.JSONDecodeError as exc:
        raise BadRequest("Invalid LLM Batch JSON payload") from exc
    if not isinstance(payload, dict):
        raise BadRequest("Invalid LLM Batch payload shape")
    return payload


def validate_result_payload(
    payload: dict[str, Any],
    *,
    request_id: str,
    attempt_id: str | None = None,
    batch_job_id: str | None = None,
    model_tag: str,
) -> dict[str, Any]:
    if payload.get("schema_version") != SCHEMA_VERSION:
        raise BadRequest("LLM Batch result schema version mismatch")
    if payload.get("request_id") != request_id:
        raise BadRequest("LLM Batch result request_id mismatch")
    if attempt_id is not None and payload.get("attempt_id") != attempt_id:
        raise BadRequest("LLM Batch result attempt_id mismatch")
    if batch_job_id is not None and payload.get("batch_job_id") != batch_job_id:
        raise BadRequest("LLM Batch result batch_job_id mismatch")
    if payload.get("model_tag") != model_tag:
        raise BadRequest("LLM Batch result model_tag mismatch")
    if "content" not in payload:
        raise BadRequest("LLM Batch result missing content")
    return payload
