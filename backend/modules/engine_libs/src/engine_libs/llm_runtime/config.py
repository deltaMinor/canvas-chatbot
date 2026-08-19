import os

from shared_libs.constants.llm import (
    LLM_API_CATALOG,
    LLM_BATCH_CATALOG,
    LLM_BEDROCK_BATCH_CATALOG,
    LLM_BEDROCK_CATALOG,
    LLM_LOCAL_CATALOG,
)
from shared_libs.types import LlmExecutionMode

API_MODELS = set(LLM_API_CATALOG.keys())
LOCAL_MODELS = set(LLM_LOCAL_CATALOG.keys())
BATCH_MODELS = set(LLM_BATCH_CATALOG.keys())
BEDROCK_MODELS = set(LLM_BEDROCK_CATALOG.keys())
BEDROCK_BATCH_MODELS = set(LLM_BEDROCK_BATCH_CATALOG.keys())
ALL_MODELS = (
    API_MODELS | LOCAL_MODELS | BATCH_MODELS | BEDROCK_MODELS | BEDROCK_BATCH_MODELS
)

OLLAMA_MODEL_TAGS = {
    k: str(v.get("model_id", "")).strip()
    for catalog in (LLM_LOCAL_CATALOG, LLM_BATCH_CATALOG)
    for k, v in catalog.items()
    if str(v.get("model_id", "")).strip()
}


def _build_model_execution_modes() -> dict[str, LlmExecutionMode]:
    """Single resolvable mode per canonical model, derived from catalog membership.

    Every catalog's keys carry that catalog's own mode as a suffix (e.g.
    ``_bedrock``, ``_api``, ``_local``, ``_batch``), so the catalogs are mutually
    disjoint and no override/priority ordering is needed.
    """
    modes: dict[str, LlmExecutionMode] = {}
    for model in BEDROCK_MODELS:
        modes[model] = LlmExecutionMode.BEDROCK
    for model in API_MODELS:
        modes[model] = LlmExecutionMode.API
    for model in LOCAL_MODELS:
        modes[model] = LlmExecutionMode.LOCAL
    for model in BATCH_MODELS:
        modes[model] = LlmExecutionMode.BATCH
    for model in BEDROCK_BATCH_MODELS:
        modes[model] = LlmExecutionMode.BEDROCK_BATCH
    return modes


MODEL_EXECUTION_MODE_BY_MODEL: dict[str, LlmExecutionMode] = (
    _build_model_execution_modes()
)

DEFAULT_ALLOWED_MODELS = ",".join(sorted(API_MODELS))
DEFAULT_BATCH_MAX_REQUEST_BYTES = 1048576


def parse_csv_set(raw_value: str) -> set[str]:
    return {item.strip() for item in raw_value.split(",") if item.strip()}


def normalize_model_key(raw_key: str) -> str:
    return raw_key.strip()


def normalize_model_key_set(keys: set[str]) -> set[str]:
    return {normalize_model_key(key) for key in keys}


def parse_execution_mode(raw_value: str) -> LlmExecutionMode:
    try:
        return LlmExecutionMode(raw_value.strip().lower())
    except ValueError as exc:
        allowed = ", ".join(mode.value for mode in LlmExecutionMode)
        raise ValueError(
            f"Unsupported LLM execution mode: {raw_value}. Allowed: {allowed}"
        ) from exc


def get_allowed_models() -> set[str]:
    return normalize_model_key_set(
        parse_csv_set(os.getenv("LLM_ALLOWED_MODELS", DEFAULT_ALLOWED_MODELS))
    )


def get_batch_max_request_bytes() -> int:
    raw_value = os.getenv(
        "LLM_BATCH_MAX_REQUEST_BYTES",
        str(DEFAULT_BATCH_MAX_REQUEST_BYTES),
    )
    try:
        max_bytes = int(raw_value)
    except ValueError as exc:
        raise ValueError(
            f"Invalid LLM_BATCH_MAX_REQUEST_BYTES value: {raw_value}"
        ) from exc
    if max_bytes <= 0:
        raise ValueError("LLM_BATCH_MAX_REQUEST_BYTES must be greater than zero")
    return max_bytes


def get_batch_wait_timeout() -> int:
    raw_value = os.getenv("BATCH_WAIT_TIMEOUT", "1440")
    try:
        timeout = int(raw_value)
    except ValueError as exc:
        raise ValueError(f"Invalid BATCH_WAIT_TIMEOUT value: {raw_value}") from exc
    if timeout <= 0:
        raise ValueError("BATCH_WAIT_TIMEOUT must be greater than zero")
    return timeout


def get_batch_stale_job_seconds() -> int:
    raw_value = os.getenv("LLM_BATCH_STALE_JOB_SECONDS")
    if raw_value is None:
        return get_batch_wait_timeout()
    try:
        timeout = int(raw_value)
    except ValueError as exc:
        raise ValueError(
            f"Invalid LLM_BATCH_STALE_JOB_SECONDS value: {raw_value}"
        ) from exc
    if timeout <= 0:
        raise ValueError("LLM_BATCH_STALE_JOB_SECONDS must be greater than zero")
    return timeout


def get_batch_mongo_collection() -> str:
    return os.getenv(
        "ASSESSMENT_JOBS_MONGO_COLLECTION",
        os.getenv("LLM_BATCH_MONGO_COLLECTION", "assessment_jobs"),
    )


def get_batch_job_queue() -> str:
    return os.getenv("LLM_BATCH_JOB_QUEUE", "")


def get_batch_job_definitions() -> dict[str, str]:
    return {model_key: "" for model_key in BATCH_MODELS}


def get_bedrock_batch_strategy() -> str:
    raw_value = os.getenv("LLM_BEDROCK_BATCH_STRATEGY", "bulk").strip().lower()
    if raw_value not in {"bulk", "per_request"}:
        raise ValueError(
            f"Invalid LLM_BEDROCK_BATCH_STRATEGY value: {raw_value}. "
            "Allowed: bulk, per_request"
        )
    return raw_value


def get_bedrock_batch_s3_bucket() -> str:
    return os.getenv("LLM_BEDROCK_BATCH_S3_BUCKET", "")


def get_bedrock_batch_role_arn() -> str:
    return os.getenv("LLM_BEDROCK_BATCH_ROLE_ARN", "")


def _get_positive_int_env(name: str, default: int) -> int:
    raw_value = os.getenv(name, str(default))
    try:
        value = int(raw_value)
    except ValueError as exc:
        raise ValueError(f"Invalid {name} value: {raw_value}") from exc
    if value <= 0:
        raise ValueError(f"{name} must be greater than zero")
    return value


def get_bedrock_batch_min_records() -> int:
    return _get_positive_int_env("LLM_BEDROCK_BATCH_MIN_RECORDS", 100)


def get_bedrock_batch_max_records() -> int:
    return _get_positive_int_env("LLM_BEDROCK_BATCH_MAX_RECORDS", 10000)


def get_bedrock_batch_max_wait_seconds() -> int:
    return _get_positive_int_env("LLM_BEDROCK_BATCH_MAX_WAIT_SECONDS", 900)


def get_bedrock_batch_job_timeout_seconds() -> int:
    return _get_positive_int_env("LLM_BEDROCK_BATCH_JOB_TIMEOUT_SECONDS", 86400)


def get_bedrock_batch_poll_seconds() -> int:
    return _get_positive_int_env("LLM_BEDROCK_BATCH_POLL_SECONDS", 10)


def get_bedrock_batch_lock_lease_seconds() -> int:
    return _get_positive_int_env("LLM_BEDROCK_BATCH_LOCK_LEASE_SECONDS", 120)


def get_model_execution_modes() -> dict[str, LlmExecutionMode]:
    """Resolved execution mode for every currently-allowed model.

    Each canonical model has exactly one mode, fixed by which catalog(s) it
    lives in (see ``MODEL_EXECUTION_MODE_BY_MODEL``) — this is no longer
    environment-configurable.
    """
    allowed_models = get_allowed_models()

    missing_models = sorted(allowed_models - set(MODEL_EXECUTION_MODE_BY_MODEL.keys()))
    if missing_models:
        raise ValueError(
            "Missing execution mode for allowed models: "
            f"{', '.join(missing_models)}. Add the model to a catalog in "
            "shared_libs.constants.llm so it has exactly one resolvable mode."
        )

    return {model: MODEL_EXECUTION_MODE_BY_MODEL[model] for model in allowed_models}
