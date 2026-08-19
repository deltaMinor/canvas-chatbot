from typing import Any, Optional, Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.base_models.shared.attack import (
    AttackAction,
    AttackFlowRuleExplanation,
    AttackNarrativeStepModel,
    AttackPath,
    EquationStructure,
    KeyRiskTemplateRule,
    PackageCondition,
    PackageGenerationCondition,
)
from shared_libs.models.base_models.shared.mitigation import (
    ContextDictObject,
    MeasuresContext,
)
from shared_libs.models.base_models.shared.register import ThreatFrameworks
from shared_libs.models.base_models.shared.shared.database import PatchBaseModel
from shared_libs.models.model_validators import AttackFlowPackageValidator

__all__ = [
    "BundlingInfo",
    "AttackPathContext",
    "PossiblePathObject",
    "AttackFlowPackage",
    "ConditionData",
    "GeneralThreatContext",
]


class BundlingInfo(BaseModel):
    users: list[dict] | None = Field(default=[])
    data: list[dict] | None = Field(default=[])
    features: list[str] | None = Field(default=[])
    devices: list[str] | None = Field(default=[])
    interfaces: list[str] | None = Field(default=[])


class AttackPathContext(BaseModel):
    id: str | None = Field(default="")
    riskScenarioId: str | None = Field(default="")
    packageId: str | None = Field(default="")
    attackPath: Optional["AttackPath"] = Field(
        default_factory=AttackPath,
    )
    labelToNode: dict[str, str] | None = Field(default={})
    contextDict: dict[str, list[ContextDictObject]] | None = Field(default={})
    edgeLabelMapping: dict[str, str] | None = Field(default={})
    recommendedMitigationMeasures: list[str] | None = Field(default=[])
    measuresMitigated: list[str] | None = Field(default=[])
    bundling_info: BundlingInfo | None = Field(
        default_factory=BundlingInfo,
    )


class PossiblePathObject(BaseModel):
    nodes: list[str] | None = Field(default=[])
    nodes_to_add: list[str] | None = Field(default=[])
    condition_nodes: list[str] | None = Field(default=[])
    path: list[str] | None = Field(default=[])
    path_name: str | None = Field(default="")
    path_index: str | None = Field(default="")
    next_node: str | None = Field(default="")
    additional_path: list[str] | None = Field(default=[])
    label_to_node: dict[str, str] | None = Field(default={})
    context_dict: dict[str, list[ContextDictObject]] | None = Field(default={})
    edge_label_mapping: dict[str, str] | None = Field(default={})


class AttackFlowPackage(
    PatchBaseModel,
    AttackFlowPackageValidator,
):
    id: str | None = Field(default="")
    type: str | None = Field(default="")
    attack_flow_ref: str | None = Field(default="")
    attack_narrative: AttackNarrativeStepModel | None = Field(
        default_factory=AttackNarrativeStepModel
    )
    name: str | None = Field(default="")
    initial_access: str | None = Field(default="")
    key_risk_template: str | None = Field(default="")
    key_risk_template_rules: list[KeyRiskTemplateRule] | None = Field(default=[])
    risk_scenario_template: str | None = Field(default="")
    frameworks: ThreatFrameworks | None = Field(default_factory=ThreatFrameworks)
    #
    generation_condition: list[PackageGenerationCondition] | None = Field(default=[])
    start_ref: str | None = Field(default="")
    attack_actions: list[AttackAction] | None = Field(default=[])
    #
    recommended_mitigation_measures: Optional["MeasuresContext"] = Field(
        default_factory=MeasuresContext
    )
    rule_explanation: Optional["AttackFlowRuleExplanation"] = Field(
        default_factory=AttackFlowRuleExplanation
    )
    #
    default_impact: int | None = Field(default=0)
    default_likelihood: int | None = Field(default=0)

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


class GeneralThreatContext(BaseModel):
    conditionsMet: bool | None = Field(default=False)
    isPrerequisiteForPath: bool | None = Field(default=False)
    omitIfConditions: list[EquationStructure] | None = Field(default=[])
    isAccessControl: bool | None = Field(default="")
    contextDict: dict[str, list[ContextDictObject]] | None = Field(default_factory={})
    packageId: str | None = Field(default="")
    riskScenarioId: str | None = Field(default="")


class ConditionData(BaseModel):
    condition: PackageCondition | None = Field(default_factory=PackageCondition)
    condition_idx: int | None = Field(default=0)
    last_path_index: str | None = Field(default="")
    label_to_node: dict[str, str] | None = Field(default={})
    edge_label_mapping: dict[str, Any] | None = Field(default={})
    context_dict: dict[str, list[ContextDictObject]] | None = Field(default={})
