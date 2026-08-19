import pytest
from engine_libs.llm_runtime.config import (
    DEFAULT_EXECUTION_MODE,
    LlmExecutionMode,
    get_batch_mongo_collection,
    get_model_execution_modes,
)
from engine_libs.llm_runtime.resolver import LlmExecutionResolver

from shared_libs.constants.llm import LLM_OPTION_ID_TO_CANONICAL_NAME
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.types.enum import LLM

ALL_SUPPORTED_MODELS = {
    "gemini_3_flash",
    "openai_gpt_5_2",
    "openai_gpt_4_1",
    "openai_gpt_5",
    "openai_gpt_5_4",
    "openai_gpt_5_5",
    "qwen_3_8b",
    "qwen_3_32b",
    "ministral_3_8b",
}


def clear_llm_env(monkeypatch):
    for name in (
        "LLM_ALLOWED_MODELS",
        "LLM_MODEL_EXECUTION_MODES",
        "LLM_MODEL_EXECUTION_MODE_DEFAULT",
        "LLM_MODEL_EXECUTION_MODE_GEMINI",
        "LLM_MODEL_EXECUTION_MODE_OPENAI",
        "LLM_MODEL_EXECUTION_MODE_MINISTRAL",
        "LLM_MODEL_EXECUTION_MODE_QWEN",
        "ASSESSMENT_JOBS_MONGO_COLLECTION",
        "LLM_BATCH_MONGO_COLLECTION",
    ):
        monkeypatch.delenv(name, raising=False)


def test_every_supported_model_has_default_execution_mode():
    assert set(DEFAULT_EXECUTION_MODE) == ALL_SUPPORTED_MODELS
    assert DEFAULT_EXECUTION_MODE["gemini_3_flash"] == LlmExecutionMode.API
    assert DEFAULT_EXECUTION_MODE["openai_gpt_5_2"] == LlmExecutionMode.API
    assert DEFAULT_EXECUTION_MODE["openai_gpt_4_1"] == LlmExecutionMode.API
    assert DEFAULT_EXECUTION_MODE["openai_gpt_5"] == LlmExecutionMode.API
    assert DEFAULT_EXECUTION_MODE["openai_gpt_5_4"] == LlmExecutionMode.API
    assert DEFAULT_EXECUTION_MODE["openai_gpt_5_5"] == LlmExecutionMode.API
    assert DEFAULT_EXECUTION_MODE["qwen_3_8b"] == LlmExecutionMode.LOCAL
    assert DEFAULT_EXECUTION_MODE["qwen_3_32b"] == LlmExecutionMode.BEDROCK
    assert DEFAULT_EXECUTION_MODE["ministral_3_8b"] == LlmExecutionMode.LOCAL


def test_default_batch_mongo_collection_is_assessment_jobs(monkeypatch):
    clear_llm_env(monkeypatch)

    assert get_batch_mongo_collection() == "assessment_jobs"


def test_assessment_jobs_mongo_collection_overrides_legacy_env(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("LLM_BATCH_MONGO_COLLECTION", "legacy_jobs")
    monkeypatch.setenv("ASSESSMENT_JOBS_MONGO_COLLECTION", "custom_assessment_jobs")

    assert get_batch_mongo_collection() == "custom_assessment_jobs"


def test_normalize_llm_accepts_canonical_model_keys():
    assert (
        LlmExecutionResolver.normalize_llm(LLM.gemini_3_flash.value) == "gemini_3_flash"
    )
    assert (
        LlmExecutionResolver.normalize_llm(LLM.openai_gpt_5_2.value) == "openai_gpt_5_2"
    )
    assert (
        LlmExecutionResolver.normalize_llm(LLM.openai_gpt_4_1.value) == "openai_gpt_4_1"
    )
    assert LlmExecutionResolver.normalize_llm(LLM.openai_gpt_5.value) == "openai_gpt_5"
    assert (
        LlmExecutionResolver.normalize_llm(LLM.openai_gpt_5_4.value) == "openai_gpt_5_4"
    )
    assert (
        LlmExecutionResolver.normalize_llm(LLM.openai_gpt_5_5.value) == "openai_gpt_5_5"
    )
    assert LlmExecutionResolver.normalize_llm(LLM.qwen_3_8b.value) == "qwen_3_8b"
    assert LlmExecutionResolver.normalize_llm(LLM.qwen_3_32b.value) == "qwen_3_32b"
    assert (
        LlmExecutionResolver.normalize_llm(LLM.ministral_3_8b.value) == "ministral_3_8b"
    )


def test_normalize_llm_accepts_questionnaire_option_ids():
    sampled = list(LLM_OPTION_ID_TO_CANONICAL_NAME.items())[:5]
    assert sampled, "No option mappings found in LLM_OPTION_ID_TO_CANONICAL_NAME"
    for option_id, canonical in sampled:
        assert LlmExecutionResolver.normalize_llm(option_id) == canonical


def test_normalize_llm_rejects_unknown_value():
    with pytest.raises(BadRequest):
        LlmExecutionResolver.normalize_llm("unknown-model")


def test_default_modes_keep_ollama_models_local(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("LLM_ALLOWED_MODELS", "qwen_3_8b,ministral_3_8b")
    monkeypatch.setenv("LLM_MODEL_EXECUTION_MODE_DEFAULT", "local")

    qwen = LlmExecutionResolver.resolve_execution(
        requested_llm=LLM.qwen_3_8b.value,
    )
    ministral = LlmExecutionResolver.resolve_execution(
        requested_llm=LLM.ministral_3_8b.value,
    )

    assert qwen.mode == LlmExecutionMode.LOCAL
    assert qwen.model_id == "qwen3:8b"
    assert ministral.mode == LlmExecutionMode.LOCAL
    assert ministral.model_id == "ministral-3:8b"


def test_api_models_route_by_default_execution_mode(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv(
        "LLM_ALLOWED_MODELS",
        "gemini_3_flash,openai_gpt_5_2,openai_gpt_4_1,openai_gpt_5,openai_gpt_5_4,openai_gpt_5_5",
    )
    monkeypatch.setenv("LLM_MODEL_EXECUTION_MODE_DEFAULT", "api")

    for llm in (
        LLM.gemini_3_flash.value,
        LLM.openai_gpt_5_2.value,
        LLM.openai_gpt_4_1.value,
        LLM.openai_gpt_5.value,
        LLM.openai_gpt_5_4.value,
        LLM.openai_gpt_5_5.value,
    ):
        decision = LlmExecutionResolver.resolve_execution(
            requested_llm=llm,
        )

        assert decision.mode == LlmExecutionMode.API
        assert decision.model_id is not None


def test_batch_configuration_does_not_affect_api_model_routing(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv(
        "LLM_ALLOWED_MODELS",
        "gemini_3_flash,openai_gpt_5_2,openai_gpt_4_1,openai_gpt_5,openai_gpt_5_4,openai_gpt_5_5",
    )
    monkeypatch.setenv("LLM_MODEL_EXECUTION_MODE_DEFAULT", "api")
    monkeypatch.setenv(
        "LLM_MODEL_EXECUTION_MODES", "qwen_3_8b=batch,ministral_3_8b=batch"
    )

    for llm in (
        LLM.gemini_3_flash.value,
        LLM.openai_gpt_5_2.value,
        LLM.openai_gpt_4_1.value,
        LLM.openai_gpt_5.value,
        LLM.openai_gpt_5_4.value,
        LLM.openai_gpt_5_5.value,
    ):
        decision = LlmExecutionResolver.resolve_execution(
            requested_llm=llm,
        )

        assert decision.mode == LlmExecutionMode.API
        assert decision.model_id is not None


def test_model_execution_modes_can_select_batch(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("LLM_ALLOWED_MODELS", "qwen_3_8b,ministral_3_8b")
    monkeypatch.setenv(
        "LLM_MODEL_EXECUTION_MODES", "qwen_3_8b=batch,ministral_3_8b=batch"
    )

    modes = get_model_execution_modes()

    assert modes["qwen_3_8b"] == LlmExecutionMode.BATCH
    assert modes["ministral_3_8b"] == LlmExecutionMode.BATCH


def test_model_execution_mode_specificity_explicit_over_family_and_default(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv(
        "LLM_ALLOWED_MODELS",
        "openai_gpt_5_2,qwen_3_8b",
    )
    monkeypatch.setenv("LLM_MODEL_EXECUTION_MODE_DEFAULT", "api")
    monkeypatch.setenv("LLM_MODEL_EXECUTION_MODE_OPENAI", "local")
    monkeypatch.setenv("LLM_MODEL_EXECUTION_MODE_QWEN", "bedrock")
    monkeypatch.setenv("LLM_MODEL_EXECUTION_MODES", "qwen_3_8b=batch")

    modes = get_model_execution_modes()

    assert modes["openai_gpt_5_2"] == LlmExecutionMode.LOCAL
    assert modes["qwen_3_8b"] == LlmExecutionMode.BATCH


def test_model_execution_modes_can_use_global_bedrock_shorthand(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("LLM_ALLOWED_MODELS", "qwen_3_8b,qwen_3_32b,ministral_3_8b")
    monkeypatch.setenv("LLM_MODEL_EXECUTION_MODES", "bedrock")

    modes = get_model_execution_modes()

    assert modes["qwen_3_8b"] == LlmExecutionMode.BEDROCK
    assert modes["qwen_3_32b"] == LlmExecutionMode.BEDROCK
    assert modes["ministral_3_8b"] == LlmExecutionMode.BEDROCK


def test_batch_mode_checks_batch_queue_allowlist(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("LLM_MODEL_EXECUTION_MODES", "qwen_3_8b=batch")
    decision = LlmExecutionResolver.resolve_execution(
        requested_llm=LLM.qwen_3_8b.value,
    )
    assert decision.mode == LlmExecutionMode.BATCH


def test_general_allowlist_checked_before_execution_mode(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("LLM_ALLOWED_MODELS", "gemini_3_flash")
    monkeypatch.setenv("LLM_MODEL_EXECUTION_MODES", "qwen_3_8b=batch")

    with pytest.raises(BadRequest):
        LlmExecutionResolver.resolve_execution(
            requested_llm=LLM.qwen_3_8b.value,
        )


def test_bedrock_mode_does_not_require_separate_allowlist(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("LLM_ALLOWED_MODELS", "qwen_3_8b")
    monkeypatch.setenv("LLM_MODEL_EXECUTION_MODES", "qwen_3_8b=bedrock")
    decision = LlmExecutionResolver.resolve_execution(
        requested_llm=LLM.qwen_3_8b.value,
    )
    assert decision.mode == LlmExecutionMode.BEDROCK


def test_untrusted_execution_mode_override_rejected(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("LLM_ALLOWED_MODELS", "qwen_3_8b")

    with pytest.raises(PermissionError):
        LlmExecutionResolver.resolve_execution(
            requested_llm=LLM.qwen_3_8b.value,
            execution_mode="batch",
            trusted_backend_context=False,
        )


def test_trusted_execution_mode_override_routes_by_mode(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("LLM_ALLOWED_MODELS", "qwen_3_8b")
    decision = LlmExecutionResolver.resolve_execution(
        requested_llm=LLM.qwen_3_8b.value,
        execution_mode="batch",
        trusted_backend_context=True,
    )

    assert decision.mode == LlmExecutionMode.BATCH
    assert decision.source == "override"
