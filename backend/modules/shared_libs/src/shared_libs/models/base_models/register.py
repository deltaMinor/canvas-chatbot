from typing import Any, Optional, Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

from shared_libs.models.base_models.shared.attack import (
    AttackNarrativeStepModel,
    AttackPath,
)
from shared_libs.models.base_models.shared.llm import (
    KbLLMQuestionModel,
    ProjectLLMRefValues,
)
from shared_libs.models.base_models.shared.mitigation import (
    ContextDictObject,
    MitigationMeasure,
)
from shared_libs.models.base_models.shared.register import ThreatFrameworks
from shared_libs.models.base_models.shared.shared.database import PatchBaseModel
from shared_libs.models.model_validators import (
    AssessmentBenchmarkValidator,
    AssessmentCheckpointValidator,
    AssessmentDataValidator,
    LLMConfigurationValidator,
    MasterRegisterBaseValidator,
    MasterRiskScenarioValidator,
    ProjectRegisterBaseValidator,
    ProjectRiskScenarioValidator,
    RuleExplanationAttributeValidator,
    RuleExplanationValidator,
)

__all__ = [
    "LabelValueOption",
    "LlmTokenCount",
    "LlmExecutionStats",
    "LlmModelUsage",
    "LlmTokenUsage",
    "RequestedByModel",
    "AssessmentCheckpoint",
    "AssessmentBenchmark",
    "AssessmentConfiguration",
    "AssessmentData",
    "SolutionDetail",
    "RuleExplanationAttribute",
    "RuleExplanation",
    "ActualMitigationMeasure",
    "ScenarioLocationParentNodeBaseModel",
    "ScenarioLocationBaseModel",
    "RiskScenarioCore",
    "MasterRiskScenario",
    "ProjectRiskScenario",
    "LLMConfiguration",
    "CachedFields",
    "ProjectScenarioConflict",
    "RegisterRefModel",
    "MasterRegisterBaseModel",
    "ProjectRegisterBaseModel",
    "ProjectRegisterAssessment",
]


class SolutionDetail(BaseModel):
    type: str | None = Field(default="")
    label: str | None = Field(default="")
    solution: str | None = Field(default="")


class RuleExplanationAttribute(
    PatchBaseModel,
    RuleExplanationAttributeValidator,
):
    evidence: list[str] | None = Field(default=[])
    explanation: list[str] | None = Field(default=[])
    result: str | None = Field(default="")

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class RuleExplanation(
    PatchBaseModel,
    RuleExplanationValidator,
):
    applicability: Optional["RuleExplanationAttribute"] = Field(
        default_factory=RuleExplanationAttribute,
    )

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class ActualMitigationMeasure(MitigationMeasure):
    isCompleted: bool | None = False


class ScenarioLocationParentNodeBaseModel(BaseModel):
    id: str | None = Field(default="")
    source: str | None = Field(default="")


class ScenarioLocationBaseModel(BaseModel):
    boundary: str | None = Field(default="")
    id: str
    name: str | None = Field(default="")
    parentNode: Optional["ScenarioLocationParentNodeBaseModel"] = Field(
        default_factory=ScenarioLocationParentNodeBaseModel,
    )
    tosca_type: str | None = Field(default="")
    type: list[Any]


class RiskScenarioCore(BaseModel):
    riskScenarioId: str
    category: str | None = Field(default="")
    defaultImpact: int | None = Field(default=0)
    defaultLikelihood: int | None = Field(default=0)
    defaultRiskLevel: int | None = Field(default=0)
    ruleExplanation: Optional["RuleExplanation"] = Field(
        default_factory=RuleExplanation,
    )
    keyRisk: str | None = Field(default="")
    knowledgebaseSource: str | None = Field(default="")
    mappingToATK: list[str] | None = Field(default=[])
    recommendedMitigationMeasures: list[str] | None = Field(default=[])
    recommendedMitigationMeasuresHidden: list[str] | None = Field(default=[])
    recommendedMitigationMeasuresParsed: list["MitigationMeasure"] | None = Field(
        default=[]
    )
    riskScenario: str | None = Field(default="")
    subcategory: str | None = Field(default="")
    solutionDetails: list[SolutionDetail] | None = Field(default=[])
    status: str | None = Field(default="unresolved")
    tags: list[str] | None = Field(default=[])
    threatImpact: str | None = Field(default="")


class MasterRiskScenario(
    RiskScenarioCore,
    PatchBaseModel,
    MasterRiskScenarioValidator,
):
    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model

    def __init__(self, **data):
        data["recommendedMitigationMeasuresParsed"] = []
        super().__init__(**data)


class JiraMapping(BaseModel):
    mitigationId: str | None = Field(default="")
    issueId: str | None = Field(default="")


class RegisterIntegrationModel(BaseModel):
    jira: list[JiraMapping] | None = Field(default=[])


class CVEDictObject(BaseModel):
    cveId: str | None = Field(default="")
    cveDescription: str | None = Field(default="")
    techniques: list[str] | None = Field(default=[])


class ProjectRiskScenario(
    RiskScenarioCore,
    PatchBaseModel,
    ProjectRiskScenarioValidator,
):
    actualMitigationMeasures: list["ActualMitigationMeasure"] | None = Field(default=[])
    applicability: int | None = Field(default=0)
    attackNarrative: AttackNarrativeStepModel | None = Field(
        default_factory=AttackNarrativeStepModel
    )
    attackPaths: list["AttackPath"] | None = Field(default=[])
    dataAction: str | None = Field(default="")
    knowledgebaseSource: str | None = Field(default="")
    location: list["ScenarioLocationBaseModel"] | None = Field(default=[])
    frameworks: ThreatFrameworks | None = Field(default_factory=ThreatFrameworks)
    ranking: int | None = Field(default=0)
    rankingCriteria: tuple[int, int, int] | None = Field(default=(0, 0, 0))
    residualImpact: int | None = Field(default=0)
    residualLikelihood: int | None = Field(default=0)
    residualRiskLevel: int | None = Field(default=0)
    responseAndRecoverPlan: str | None = Field(default="")
    contextDict: dict[str, list["ContextDictObject"]] | None = Field(default={})
    sourceRiskScenarioId: str | None = Field(default="")
    tactics: list[str] | None = Field(default=[])
    threatImpactGoal: dict[str, str] | None = Field(default={})
    keyInsight: str | None = Field(default="")
    cveList: list[CVEDictObject] | None = Field(default=[])

    # Ref
    ref: dict[str, Any] | None = Field(default={})
    # LLM
    prompts: list[str] | None = Field(default=[])

    # Comments
    treatmentComments: str | None = Field(default="")
    reviewComments: str | None = Field(default="")

    # Workflow metadata
    submittedForReviewBy: str | None = Field(default="")
    submittedForReviewOn: str | None = Field(default="")
    reviewedBy: str | None = Field(default="")
    reviewedOn: str | None = Field(default="")

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model

    def __init__(self, **data):
        # Preserve incoming parsed entries (LLM review bucket persists them
        # directly); the register parser still overwrites accepted scenarios.
        if not data.get("recommendedMitigationMeasuresParsed"):
            data["recommendedMitigationMeasuresParsed"] = []
        super().__init__(**data)


class LabelValueOption(BaseModel):
    """A standard label/value pair used in questionnaire-style option fields."""

    model_config = ConfigDict(extra="allow")

    label: str | None = Field(default="")
    value: str | None = Field(default="")


class LLMConfiguration(PatchBaseModel, LLMConfigurationValidator):
    model_config = ConfigDict(extra="allow")

    applyLlmModelToAllStages: str | None = Field(default="")
    attributesPrompt: list[Any] | None = Field(default=[])
    enabledFrameworks: list[str] | None = Field(default=[])
    llm: LabelValueOption | None = Field(default=None)
    llmModelSingle: str | None = Field(default="")
    mitigationPrompt: list[Any] | None = Field(default=[])
    prompt_type: str | None = Field(default="")
    prompt: list[Any] | None = Field(default=[])
    role_label: str | None = Field(default="")
    systemDescription: str | None = Field(default="")

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(cls, data: dict, handler) -> Self:
        model = cls.get_validated_model(data=data, handler=handler)
        return model


class AssessmentConfigObject(BaseModel):
    refValues: list["ProjectLLMRefValues"] | None = Field(default=[])
    questions: list["KbLLMQuestionModel"] | None = Field(default=[])
    dependentFields: dict | None = Field(default={})
    values: dict | None = Field(default={})


class AssessmentConfig(BaseModel):
    main: AssessmentConfigObject | None = Field(default_factory=AssessmentConfigObject)
    ai: AssessmentConfigObject | None = Field(default_factory=AssessmentConfigObject)
    pentest: AssessmentConfigObject | None = Field(
        default_factory=AssessmentConfigObject
    )
    graph_reasoning: AssessmentConfigObject | None = Field(
        default_factory=AssessmentConfigObject
    )


class CachedFields(BaseModel):
    field: str | int | None = ""
    currentValue: str | int | None = ""
    newValue: str | int | None = ""


class ProjectScenarioConflict(BaseModel):
    riskScenarioId: str | None = Field(default="")
    sourceRiskScenarioId: str | None = Field(default="")
    knowledgebaseSource: str | None = Field(default="")
    cachedFields: list["CachedFields"] | None = Field(default=[])


class RegisterRefModel(BaseModel):
    pass


class ProjectRegisterRefModel(RegisterRefModel):
    pass


class ProjectRegisterLegacyModel(BaseModel):
    """Legacy reference data migrated out of the flat project register structure.

    ``category_options``, ``risk_info``, and ``subcategory_options`` were
    previously stored at the top level or under ``ref``; they now live here.
    """

    category_options: list[str] | None = Field(default=[])
    risk_info: list[dict] | None = Field(default=[])
    subcategory_options: dict | None = Field(default={})


class MasterRegisterBaseModel(
    RegisterRefModel,
    PatchBaseModel,
    MasterRegisterBaseValidator,
):
    ref: RegisterRefModel | None = Field(default_factory=RegisterRefModel)
    risk_scenarios: list["MasterRiskScenario"] | None = Field(default=[])
    is_initialized: bool | None = Field(default=False)

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class AssessmentCheckpoint(
    PatchBaseModel,
    AssessmentCheckpointValidator,
):
    """A single progress checkpoint recorded during an assessment pipeline run."""

    model_config = ConfigDict(extra="allow")

    message: str | None = Field(default="")
    name: str | None = Field(default="")
    step_index: int | None = Field(default=0)
    metadata: dict | None = Field(default={})
    timestamp: Any | None = Field(default=None)
    timestamp_epoch: float | None = Field(default=None)

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class LlmTokenCount(BaseModel):
    """Token usage totals shared across benchmark, model, and execution levels."""

    call_count: int | None = Field(default=0)
    input_tokens: int | None = Field(default=0)
    output_tokens: int | None = Field(default=0)
    total_tokens: int | None = Field(default=0)


class LlmExecutionStats(LlmTokenCount):
    """Token usage for a single LLM execution type (e.g. hosted, local)."""

    model_config = ConfigDict(extra="allow")

    execution: str | None = Field(default="")
    last_call_at: Any | None = Field(default=None)
    last_call_at_epoch: float | None = Field(default=None)


class LlmModelUsage(LlmTokenCount):
    """Aggregated token usage for a single LLM model across all executions."""

    model_config = ConfigDict(extra="allow")

    executions: dict[str, LlmExecutionStats] | None = Field(default={})
    last_call_at: Any | None = Field(default=None)
    last_call_at_epoch: float | None = Field(default=None)
    last_checkpoint_name: str | None = Field(default="")
    last_checkpoint_step_index: int | None = Field(default=None)
    last_execution: str | None = Field(default="")
    last_job_id: str | None = Field(default="")
    last_request_id: str | None = Field(default="")
    model: str | None = Field(default="")
    model_tag: str | None = Field(default="")


class LlmTokenUsage(BaseModel):
    """Full token usage report for an assessment run."""

    model_config = ConfigDict(extra="allow")

    by_model: dict[str, LlmModelUsage] | None = Field(default={})
    total: LlmTokenCount | None = Field(default=None)


class RequestedByModel(BaseModel):
    """User identity for who triggered the assessment."""

    model_config = ConfigDict(extra="allow")

    email: str | None = Field(default="")
    user_id: str | None = Field(default="")
    username: str | None = Field(default="")


class AssessmentBenchmark(
    PatchBaseModel,
    AssessmentBenchmarkValidator,
):
    """Benchmark data produced by an assessment pipeline run."""

    model_config = ConfigDict(extra="allow")

    checkpoints: list[AssessmentCheckpoint] | None = Field(default=[])
    finished_at: str | None = Field(default=None)
    finished_at_epoch: float | None = Field(default=None)
    llm_token_usage: LlmTokenUsage | None = Field(default=None)
    metadata: dict | None = Field(default={})
    started_at: str | None = Field(default="")
    started_at_epoch: float | None = Field(default=None)
    status: str | None = Field(default="")

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class AssessmentConfiguration(BaseModel):
    """Pipeline configuration used when the assessment was triggered."""

    model_config = ConfigDict(extra="allow")

    engine_job_types: list | None = Field(default=[])
    config_values: dict | None = Field(default={})
    llm_configuration: LLMConfiguration | None = Field(default=None)
    requested_at: Any | None = Field(default=None)
    requested_by: RequestedByModel | None = Field(default=None)
    run_llm_engine: bool | None = Field(default=False)
    values: dict | None = Field(default={})


class AssessmentData(
    PatchBaseModel,
    AssessmentDataValidator,
):
    """Assessment sub-object shared by ``ProjectAssessmentModel`` and ``ProjectRegisterBaseModel``.

    ``assessment_id`` lives at the top-level on both model types, not here.
    ``cq_version_id`` / ``ad_version_id`` record the CQ and diagram versions
    that were used for this assessment run.
    ``configuration`` is a snapshot of the assessment config that was active
    when the assessment was triggered, stored for auditability.
    """

    benchmark: AssessmentBenchmark | None = Field(default=None)
    configuration: AssessmentConfiguration | None = Field(default=None)
    cq_version_id: str | None = Field(default="")
    ad_version_id: str | None = Field(default="")

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class ProjectRegisterAssessment(AssessmentData):
    """Assessment sub-object for ``ProjectRegisterModel`` and history snapshots.

    ``assessment_id`` lives at the top-level of ``ProjectRegisterBaseModel``,
    not here — same convention as ``ProjectAssessmentBaseModel``.
    """


class ProjectRegisterReview(BaseModel):
    llmScenarios: list["ProjectRiskScenario"] | None = Field(default=[])
    conflicts: list["ProjectScenarioConflict"] | None = Field(default=[])


class ProjectRegisterMitigation(BaseModel):
    ranking: dict[str, int] | None = Field(default={})


class ProjectRegisterBaseModel(
    PatchBaseModel,
    ProjectRegisterBaseValidator,
):
    model_config = ConfigDict(extra="allow")

    ref: ProjectRegisterRefModel | None = Field(default_factory=ProjectRegisterRefModel)
    migrationVer_: str | None = Field(default="")
    legacy: ProjectRegisterLegacyModel | None = Field(
        default_factory=ProjectRegisterLegacyModel
    )

    # assessment
    assessment_id: str | None = Field(default="")
    assessment: ProjectRegisterAssessment | None = Field(
        default_factory=ProjectRegisterAssessment
    )

    review: ProjectRegisterReview | None = Field(default_factory=ProjectRegisterReview)
    mitigation: ProjectRegisterMitigation | None = Field(
        default_factory=ProjectRegisterMitigation
    )

    # integration
    integration: RegisterIntegrationModel | None = Field(
        default_factory=RegisterIntegrationModel
    )

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model
