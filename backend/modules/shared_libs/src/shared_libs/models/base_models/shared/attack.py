from typing import Any

from pydantic import BaseModel, Field

from shared_libs.models.base_models.shared.register import ThreatFrameworks

__all__ = [
    "AttackFlowRuleExplanation",
    "AttackNarrativeStepModel",
    "AttackAction",
    "AttackPath",
    "AttackStep",
    "EquationStructure",
    "PackageCondition",
    "ConditionMetapath",
    "PackageGenerationCondition",
    "MetapathFilter",
]


class AttackStep(BaseModel):
    step: int | None = Field(default=0)
    icon: str | None = Field(default="")
    node: str | None = Field(default="")
    nodeId: str | None = Field(default="")
    objectRef: str | None = Field(default="")
    tactic: str | None = Field(default="")
    techniqueId: str | None = Field(default="")
    technique: str | None = Field(default="")
    techniqueGenerated: str | None = Field(default="")
    techniqueValidated: bool | None = Field(default=True)
    stepNarrative: str | None = Field(default="")
    cveId: str | None = Field(default="")
    cveDescription: str | None = Field(default="")


class AttackPath(BaseModel):
    id: str | None = Field(default="")
    keyRisk: str | None = Field(default="")
    riskScenario: str | None = Field(default="")
    steps: list["AttackStep"] | None = Field(default=[])
    pathNarrative: str | None = Field(default="")
    likelihood: int | None = Field(default=0)
    impact: int | None = Field(default=0)
    impactCategory: str | None = Field(default="")
    frameworks: ThreatFrameworks | None = Field(default_factory=ThreatFrameworks)
    mitigation: list[str] | None = Field(default=[])
    threatImpactGoal: dict[str, str] | None = Field(default={})
    initialAccess: str | None = Field(default="")


class AttackFlowRuleExplanation(BaseModel):
    applicability: str | None = ""


class EquationStructure(BaseModel):
    attribute: str | None = Field(default="")
    expression: str | None = Field(default="")
    parameter_type: str | None = Field(default="")
    parameters: Any | None = Field(default=[])
    set_context: str | None = Field(default="")
    set_attribute: Any | None = Field(default=[])
    return_object_attribute: str | None = Field(default="")


class KeyRiskTemplateRuleParameter(EquationStructure):
    userstory: str | None = Field(default="")


class KeyRiskTemplateRule(BaseModel):
    template: str | None = Field(default="")
    parameters: list[KeyRiskTemplateRuleParameter] | None = Field(default=[])
    outcome: str | None = Field(default="")


class MetapathFilter(BaseModel):
    equation: list[EquationStructure] | None = Field(default=[])
    name: str | None = Field(default="")


class ConditionMetapath(BaseModel):
    filter: list[MetapathFilter] | None = Field(default=[])
    label: str | None = Field(default="")
    labelGroup: str | None = Field(default="")
    match: str | None = Field(default="")
    object: str | None = Field(default="")
    parameters: list[EquationStructure] | None = Field(default=[])
    type: str | None = Field(default="")


class PackageCondition(BaseModel):
    condition_type: str | None = Field(default="")
    recommended_mitigation_measures: list[str] | None = Field(default=[])
    metapath: list[ConditionMetapath] | None = Field(default=[])
    equation: list[EquationStructure] | None = Field(default=[])
    is_prerequisite_for_path: bool | None = Field(default=False)
    omit_if: list[EquationStructure] | None = Field(default=[])


class PackageGenerationCondition(BaseModel):
    type: str | None = Field(default="")
    condition: list[PackageCondition] | None = Field(default=[])
    object_ref: str | None = Field(default="")


class AttackNarrativeStepModel(BaseModel):
    descriptions: list[str] | None = Field(default=[])
    techniques: list[str] | None = Field(default=[])
    remarks: list[str] | None = Field(default=[])


class AttackAction(BaseModel):
    object_ref: str
    id: str | None = Field(default="")
    #
    name: str | None = Field(default="")
    tactic_id: str | None = Field(default="")
    tactic_ref: str | None = Field(default="")
    technique_id: str | None = Field(default="")
    technique_ref: str | None = Field(default="")
    effect_refs: list[str] | None = Field(default=[])
