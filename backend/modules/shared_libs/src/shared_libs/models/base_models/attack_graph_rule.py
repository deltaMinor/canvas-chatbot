from typing import Any, Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.base_models.shared.register import ThreatFrameworks
from shared_libs.models.base_models.shared.shared.database import PatchBaseModel
from shared_libs.models.model_validators import AttackGraphRuleValidator

__all__ = [
    "KbAttackGraphRuleBaseModel",
]


class MitigationBaseModel(BaseModel):
    mitigation_id: list[str]
    condition: list[Any] | None = Field(default=[])


class EquationStructure(BaseModel):
    attribute: str | None = Field(default="")
    expression: str | None = Field(default="")
    parameter_type: str | None = Field(default="")
    parameters: Any | None = Field(default=[])
    set_context: str | None = Field(default="")
    set_attribute: Any | None = Field(default=[])
    return_object_attribute: str | None = Field(default="")


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
    set_attribute: Any | None = Field(default=[])
    type: str | None = Field(default="")


class PackageCondition(BaseModel):
    condition_type: str | None = Field(default="")
    recommended_mitigation_measures: list[str] | None = Field(default=[])
    metapath: list[ConditionMetapath] | None = Field(default=[])
    equation: list[EquationStructure] | None = Field(default=[])
    required: bool | None = Field(default=False)
    merge_conditions: list[EquationStructure] | None = Field(default=[])


class PackageGenerationCondition(BaseModel):
    type: str | None = Field(default="")
    rule_id: str | None = Field(default="")
    rule_name: str | None = Field(default="")
    condition: list[PackageCondition] | None = Field(default=[])
    initial_access: str | None = Field(default="")
    object_ref: str | None = Field(default="")


class GeneralRuleBaseModel(BaseModel):
    rule_id: str
    rule_name: str
    likelihood: int | None = Field(default=-1)
    mitigation: list[MitigationBaseModel] | None = Field(default=[])
    frameworks: ThreatFrameworks | None = Field(default_factory=ThreatFrameworks)
    narrative: str | None = Field(default="")
    mitre: list[str] | None = Field(default="")


class KbAttackGraphRuleBaseModel(PatchBaseModel, AttackGraphRuleValidator):
    init_pred: str
    init_pred_dep: dict[str, str]
    interaction_rule: str
    attack_flow_rule: list[PackageGenerationCondition]
    general_rule: list[GeneralRuleBaseModel]
    mapper: dict[str, Any]

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
