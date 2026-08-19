from typing import Any, Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.model_validators import (
    KnowledgeBaseMappingValidator,
    MitigationMeasureValidator,
)

from .shared.database import PatchBaseModel

__all__ = [
    "KnowledgeBaseMapping",
    "MitigationMeasure",
    "Context",
    "ContextDictObject",
    "MeasureContextObject",
    "RuleBasedContext",
    "MeasuresContext",
]


class KnowledgeBaseMapping(
    PatchBaseModel,
    KnowledgeBaseMappingValidator,
):
    id: list[str] | None = Field(default=[])
    source: str | None = Field(default="")

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


class ContextDictObject(BaseModel):
    id: str | None = Field(default="")
    label: str | None = Field(default="")


class MitigationMeasure(
    PatchBaseModel,
    MitigationMeasureValidator,
):
    assignees: list[str] | None = Field(default=[])
    category: list[str] | None = Field(default=[])
    description: str | None = Field(default="")
    header: str | None = Field(default="")
    isArchived: bool | None = Field(default=False)
    kbAssociations: list["KnowledgeBaseMapping"] | None = Field(default=[])
    measure: str | None = Field(default="")
    measureFormat: str | None = Field(default="")
    location: list["ContextDictObject"] | None = Field(default=[])
    locationRef: list[str] | None = Field(default=[])
    mitigationId: str
    priority: int | None = Field(default=0)
    ranking: int | None = Field(default=0)
    ref: dict | None = Field(default={})
    source: str | None = Field(default="")

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


class Context(BaseModel):
    key: str | None = Field(default="")
    object_refs: list[str] | None = Field(default=[])


class MeasureContextObject(BaseModel):
    measure: str
    context: list[Context] | None = Field(default=[])


class RuleBasedContext(BaseModel):
    equation: list[dict[str, Any]] | None = Field(default=[])
    measures: list[MeasureContextObject] | None = Field(default=[])


class MeasuresContext(BaseModel):
    default: list[MeasureContextObject] | None = Field(default=[])
    rule_based: list[RuleBasedContext] | None = Field(default=[])
