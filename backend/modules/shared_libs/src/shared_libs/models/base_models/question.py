from typing import Optional, Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.alias import QuestionnaireValue
from shared_libs.models.model_validators import (
    CQCoreValidator,
    CQTemplateCoreValidator,
    CQTemplateFieldTemplateValidator,
    CQTemplateFormTemplateValidator,
)

from .shared.shared.database import PatchBaseModel
from .shared.shared.question import QuestionModel

__all__ = [
    "CQCoreModel",
    "CQFieldTemplateItemModel",
    "CQFieldTemplateModel",
    "CQFormTemplateItemModel",
    "CQTemplateCoreModel",
    "QuestionnaireCoreModel",
    "QuestionnaireSectionModel",
    "QuestionnaireSubsectionModel",
    "QuestionnaireSummaryModel",
]


class QuestionnaireSummaryModel(BaseModel):
    footer: str | None = Field(default="")


class QuestionnaireSubsectionModel(BaseModel):
    subsectionId: str | None = Field(default="")
    questions: list["QuestionModel"] | None = Field(default=[])
    subsectionName: str | None = Field(default="")
    summary: Optional["QuestionnaireSummaryModel"] = Field(
        default_factory=QuestionnaireSummaryModel,
    )


class QuestionnaireSectionModel(BaseModel):
    sectionId: str | None = Field(default="")
    questions: list["QuestionModel"] | None = Field(default=[])
    sectionName: str | None = Field(default="")
    subsections: list["QuestionnaireSubsectionModel"] | None = Field(default=[])
    summary: Optional["QuestionnaireSummaryModel"] = Field(
        default_factory=QuestionnaireSummaryModel,
    )


class CQFieldTemplateItemModel(
    PatchBaseModel,
    CQTemplateFieldTemplateValidator,
):
    template_id: str
    template_name: str | None = Field(default="")
    domains: list[str] | None = Field(default=[])
    values: list[dict] | None = Field(default=[])

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


class CQFieldTemplateModel(BaseModel):
    fieldId: str
    templates: list["CQFieldTemplateItemModel"] | None = Field(default=[])


class CQFormTemplateItemModel(
    PatchBaseModel,
    CQTemplateFormTemplateValidator,
):
    template_id: str | None = Field(default="")
    template_name: str | None = Field(default="")
    domains: list[str] | None = Field(default=[])
    values: Optional["QuestionnaireValue"] = Field(default={})
    #
    description: str | None = Field(default="")
    use_cases: list[str] | None = Field(default=[])
    tags: list[str] | None = Field(default=[])

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


class QuestionnaireCoreModel(
    PatchBaseModel,
    CQCoreValidator,
):
    schema_: str | None = Field(default="")
    dependentFields: dict | None = Field(default={})
    initialValues: Optional["QuestionnaireValue"] = Field(default={})
    sections: list["QuestionnaireSectionModel"] | None = Field(default=[])

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


class CQCoreModel(QuestionnaireCoreModel):
    pass


class CQTemplateCoreModel(
    PatchBaseModel,
    CQTemplateCoreValidator,
):
    schema_: str | None = Field(default="")
    tags: list[str] | None = Field(default=[])
    field_templates: list["CQFieldTemplateModel"] | None = Field(default=[])
    form_templates: list["CQFormTemplateItemModel"] | None = Field(default=[])

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
