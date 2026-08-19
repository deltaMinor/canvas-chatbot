import logging
import os
import sys

from engine_libs.llm_runtime.mongo_store import build_batch_llm_mongo_store
from langchain_core.messages import messages_from_dict
from langchain_ollama import ChatOllama

from shared_libs.infrastructure.database_client.database_client_manager import (
    DatabaseClientManager,
)
from shared_libs.lib.url_resolver_util.url_constructor import UrlConstructor
from shared_libs.protocols import LlmMongoStoreProtocol

SCHEMA_VERSION = "llm-batch-v1"

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)


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


def require_env(name: str) -> str:
    value = os.getenv(name, "")
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def get_mongo_url() -> str:
    base_url = require_env("DB_URL_MONGODB")
    constructor = UrlConstructor(
        base_url=base_url,
        require_auth=os.getenv("REQUIRE_DB_AUTH", "FALSE"),
        username=os.getenv("DB_USERNAME", ""),
        password=os.getenv("DB_PASSWORD", ""),
    )
    return constructor.resolved_url


def get_mongo_store() -> LlmMongoStoreProtocol:
    database_client_manager = DatabaseClientManager(
        DB_URL=get_mongo_url(),
        DB_NAME=require_env("RR_DB_NAME"),
    )
    return build_batch_llm_mongo_store(database_client_manager.database_client)


def build_llm(*, model_tag: str, response_mode: str | None):
    kwargs = {
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


def main() -> int:
    request_id = require_env("REQUEST_ID")
    attempt_id = require_env("ATTEMPT_ID")
    model_tag = require_env("MODEL_TAG")
    batch_job_id = os.getenv("AWS_BATCH_JOB_ID", "")

    logger.info(
        "[ RR-SCRIPT ] Starting LLM Batch inference request_id=%s attempt_id=%s model_tag=%s",
        request_id,
        attempt_id,
        model_tag,
    )

    mongo_store = get_mongo_store()
    document = mongo_store.get_document(request_id)
    if not document:
        raise RuntimeError(f"Missing LLM Batch Mongo document: {request_id}")
    if document.get("attempt_id") != attempt_id:
        raise RuntimeError("Attempt id mismatch")

    request_payload = document.get("request")
    if not isinstance(request_payload, dict):
        raise RuntimeError("Request payload must be a JSON object")

    if request_payload.get("schema_version") != SCHEMA_VERSION:
        raise RuntimeError("Request schema_version mismatch")
    if request_payload.get("request_id") != request_id:
        raise RuntimeError("Request id mismatch")
    if request_payload.get("model_tag") != model_tag:
        raise RuntimeError("Model tag mismatch")

    messages = messages_from_dict(request_payload["messages"])
    llm = build_llm(
        model_tag=model_tag,
        response_mode=request_payload.get("response_mode"),
    )
    response = llm.invoke(messages)
    result_payload = {
        "schema_version": SCHEMA_VERSION,
        "request_id": request_id,
        "attempt_id": attempt_id,
        "batch_job_id": batch_job_id,
        "canonical_llm": request_payload.get("canonical_llm"),
        "model_tag": model_tag,
        "content": response.content,
    }
    update_result = mongo_store.put_result(
        request_id=request_id,
        attempt_id=attempt_id,
        result=result_payload,
    )
    if update_result.matched_count != 1:
        raise RuntimeError("Failed to write result for current LLM Batch attempt")
    logger.info("[ RR-SCRIPT ] Completed LLM Batch inference request_id=%s", request_id)
    return 0


if __name__ == "__main__":
    sys.exit(main())
