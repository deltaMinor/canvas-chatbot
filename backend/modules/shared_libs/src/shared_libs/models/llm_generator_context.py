from collections.abc import Callable
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from shared_libs.lib.prompt_role import prompt_role_label
from shared_libs.lib.prompt_type import canonical_prompt_type
from shared_libs.models.llm_execution_decision import LlmExecutionDecision
from shared_libs.models.llm_task_context import LlmTaskContext

PromptTemplate = list[list[dict[str, object]]]


def _llm_option_value(value: object) -> str:
    if isinstance(value, dict):
        canonical_name = str(value.get("canonicalName") or "").strip()
        if canonical_name:
            return canonical_name
        tags = value.get("tags")
        # Legacy data may only have stored the canonical model key as the first tag.
        if isinstance(tags, list):
            for tag in tags:
                tag_value = str(tag or "").strip()
                if tag_value:
                    return tag_value
        for key in ("model_id", "value"):
            option_value = str(value.get(key) or "").strip()
            if option_value and not option_value.startswith("option_"):
                return option_value
        raise ValueError(
            "LLM option dictionaries must include canonicalName, a legacy tag, "
            "or a non-option model_id/value."
        )
    if value is None:
        return ""
    option_value = str(value).strip()
    if option_value.startswith("option_"):
        raise ValueError("LLM configuration must use a canonical model name.")
    return option_value


def _prompt_type_value(value: object) -> str:
    return canonical_prompt_type(value)


class LLMGeneratorProgressContext(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    track_progress: bool = False
    min_progress: int | None = None
    max_progress: int | None = None
    project_register_updater: Any | None = None


class LLMGeneratorRuntimeContext(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    response_mode: str | None = None
    task_context: LlmTaskContext | None = None
    project_id: str = Field(..., min_length=1)
    assessment_id: str = ""
    decision: LlmExecutionDecision | None = None
    mongo_store: Any | None = None
    kb_llm_prompt_service: Any | None = None
    execution_mode: str | None = None
    trusted_backend_context: bool = False
    generation_heartbeat_getter: Callable[[], dict | None] | None = None
    progress_info_reporter: Callable[..., None] | None = None


class LlmModelMulti(BaseModel):
    riskScenarioLlm: str = ""
    qualityCheckLlm: str = ""
    groupingLlm: str = ""
    mitigationLlm: str = ""
    attributesLlm: str = ""
    generalThreatImpactLlm: str = ""
    specificThreatImpactLlm: str = ""

    @field_validator(
        "riskScenarioLlm",
        "qualityCheckLlm",
        "groupingLlm",
        "mitigationLlm",
        "attributesLlm",
        "generalThreatImpactLlm",
        "specificThreatImpactLlm",
        mode="before",
    )
    @classmethod
    def validate_llm_option(cls, value: object) -> str:
        return _llm_option_value(value)


class GeneratorConfiguration(BaseModel):
    model_config = ConfigDict(extra="allow")

    # Primary LLM provider/model identifier.
    # Expects canonical name (e.g. "nova_pro_bedrock").
    llm: str = ""

    # Model name used when a single model handles all stages.
    # Expects canonical name (e.g. "nova_pro_bedrock").
    llmModelSingle: str = ""

    # Per-stage model overrides for multi-model pipelines.
    # Each field expects a canonical name.
    llmModelMulti: LlmModelMulti = Field(default_factory=LlmModelMulti)

    # System-prompt role applied to the generator.
    # Expects a label (human-readable, e.g. "Security Expert").
    role_label: str = ""

    # Selects which prompt template variant to use.
    # Expects a canonical name (e.g. "single_prompt", "chain_prompt").
    prompt_type: str = ""

    # Main prompt template for risk/threat generation.
    prompt: PromptTemplate = Field(default_factory=list)

    # Prompt template for mitigation generation.
    mitigationPrompt: PromptTemplate = Field(default_factory=list)

    # Prompt template for threat-attribute extraction.
    attributesPrompt: PromptTemplate = Field(default_factory=list)

    # Base URL for a locally-hosted LLM endpoint.
    # Plain string, no validation.
    llm_local_url: str = ""

    # API key for Google Gemini.
    # Plain string, no validation.
    llm_apikey_gemini: str = ""

    # API key for OpenAI.
    # Plain string, no validation.
    llm_apikey_openai: str = ""

    @model_validator(mode="before")
    @classmethod
    def migrate_generation_option(cls, data: object) -> object:
        if isinstance(data, dict):
            data = dict(data)
            # Legacy configurations used "role"; runtime generators consume role_label.
            if "role" in data and "role_label" not in data:
                data["role_label"] = data.pop("role")
            else:
                data.pop("role", None)
        if isinstance(data, dict) and "prompt_type" not in data:
            generation_option = data.pop("generationOption", None)
            if generation_option is not None:
                data = {**data, "prompt_type": generation_option}
        return data

    @field_validator("llm", "llmModelSingle", mode="before")
    @classmethod
    def validate_llm_option(cls, value: object) -> str:
        return _llm_option_value(value)

    @field_validator("role_label", mode="before")
    @classmethod
    def validate_role_option(cls, value: object) -> str:
        return prompt_role_label(value)

    @field_validator("prompt_type", mode="before")
    @classmethod
    def validate_prompt_type_option(cls, value: object) -> str:
        return _prompt_type_value(value)

    def for_stage(self, stage_model_field: str) -> "GeneratorConfiguration":
        """Return a configuration using the selected model for one LLM stage."""
        stage_llm = (
            getattr(self.llmModelMulti, stage_model_field, None)
            or self.llmModelSingle
            or self.llm
        )
        return self.model_copy(update={"llm": stage_llm})


class LLMGeneratorContext(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    configuration: "GeneratorConfiguration" = Field(
        default_factory=GeneratorConfiguration
    )
    llm_key: str
    progress: LLMGeneratorProgressContext = Field(
        default_factory=LLMGeneratorProgressContext
    )
    runtime: LLMGeneratorRuntimeContext = Field(
        default_factory=LLMGeneratorRuntimeContext
    )
    generator: Any | None = None
