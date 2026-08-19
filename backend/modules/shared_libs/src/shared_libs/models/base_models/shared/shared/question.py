from typing import Optional

from pydantic import BaseModel, Field

from shared_libs.models.alias import InitialValue

__all__ = [
    "QuestionExampleItem",
    "QuestionExplanationItem",
    "UsefulnessPropertiesItem",
    "QuestionProperties",
    "QuestionFieldOption",
    "QuestionField",
    "QuestionPreConditionProperties",
    "QuestionPreCondition",
    "QuestionBaseModel",
    "QuestionModel",
]


class QuestionExampleItem(BaseModel):
    type: str | None = Field(default="")
    value: str | None = Field(default="")
    domains: list[str] | None = Field(default=[])


class QuestionExplanationItem(BaseModel):
    type: str | None = Field(default="")
    value: str | None = Field(default="")
    domains: list[str] | None = Field(default=[])


class UsefulnessPropertiesItem(BaseModel):
    riskIds: list[str] | None = Field(default=[])
    domains: list[str] | None = Field(default=[])
    value: str | None = Field(default="")


class QuestionProperties(BaseModel):
    examples: list["QuestionExampleItem"] | None = Field(default=[])
    explanations: list["QuestionExplanationItem"] | None = Field(default=[])
    helperText: str | None = Field(default="")
    displayGroup: str | None = Field(default="")
    valuePolicy: str | None = Field(default="")
    defaultOptionsGroupKey: str | None = Field(default="")
    defaultOptionsKey: str | None = Field(default="")
    configuration: str | None = Field(default="")
    configurationPreCondition: (
        list["QuestionToConfigurationPreconditionModel"] | None
    ) = Field(default=[])
    usefulness_abstract: str | None = Field(default="")
    usefulness: list["UsefulnessPropertiesItem"] | None = Field(default=[])


class QuestionFieldOption(BaseModel):
    optionId: str | None = Field(default="")
    canonicalName: str | None = Field(default="")
    domains: list[str] | None = Field(default=[])
    label: str | None = Field(default="")
    helperText: str | None = Field(default="")
    tags: list[str] | None = Field(default=[])
    #
    ref: dict | None = Field(default={})
    disabled: bool | None = Field(default=False)


class QuestionFieldOptionsGroup(BaseModel):
    label: str | None = Field(default="")
    options: list["QuestionFieldOption"] | None = Field(default=[])


class QuestionField(BaseModel):
    accept: str | list[str] | None = Field(default=None)
    disabled: bool | None = Field(default=False)
    placeholder: str | None = Field(default="")
    required: bool | None = Field(default=False)
    type: str | None = Field(default="")
    initialValue: InitialValue | None = Field(default={})
    maxFileSizeBytes: int | None = Field(default=None)
    maxFiles: int | None = Field(default=None)
    options: list["QuestionFieldOption"] | None = Field(default=[])
    optionsGroup: list["QuestionFieldOptionsGroup"] | None = Field(default=[])


class QuestionPreConditionProperties(BaseModel):
    fieldIdRef: str | None = Field(default="")
    extendedField: Optional["QuestionModel"] = Field(
        default=None,
    )
    extendedFieldIdRef: str | None = Field(default="")
    fieldIdRefList: list[str] | None = Field(default=[])
    optionIds: list[str] | None = Field(default=[])


class QuestionPreCondition(BaseModel):
    description: str | None = Field(default="")
    type: str | None = Field(default="")
    properties: Optional["QuestionPreConditionProperties"] = Field(
        default_factory=QuestionPreConditionProperties,
    )


class QuestionBaseModel(BaseModel):
    fieldId: str | None = Field(default="")
    domains: list[str] | None = Field(default=[])
    header: str | None = Field(default="")
    label: str | None = Field(default="")
    field: Optional["QuestionField"] = Field(
        default_factory=QuestionField,
    )
    preConditions: list["QuestionPreCondition"] | None = Field(default=[])
    properties: Optional["QuestionProperties"] = Field(
        default_factory=QuestionProperties,
    )


class QuestionModel(QuestionBaseModel):
    extendedFields: list["QuestionModel"] | None = Field(default=[])


class QuestionToConfigurationPreconditionModel(BaseModel):
    questionIdRef: str
    optionId: str


class QuestionToConfigurationModel(BaseModel):
    questionId: str
    configuration: str | None = Field(default="")
    preCondition: list["QuestionToConfigurationPreconditionModel"] | None = Field(
        default=[]
    )


# Rebuild models to resolve forward references
QuestionModel.model_rebuild()
QuestionProperties.model_rebuild()
QuestionPreConditionProperties.model_rebuild()
QuestionPreCondition.model_rebuild()
QuestionBaseModel.model_rebuild()
QuestionToConfigurationModel.model_rebuild()
QuestionToConfigurationPreconditionModel.model_rebuild()
