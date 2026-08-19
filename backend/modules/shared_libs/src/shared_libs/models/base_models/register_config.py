from typing import Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.base_models.question import QuestionnaireCoreModel
from shared_libs.models.base_models.shared.shared.question import (
    QuestionFieldOption,
    QuestionFieldOptionsGroup,
    QuestionModel,
)
from shared_libs.models.model_validators import (
    KbAssessmentConfigBaseValidator,
)

__all__ = [
    "KbAssessmentConfigBaseModel",
]


class KbAssessmentConfigObject(BaseModel):
    questions: list["QuestionModel"] | None = Field(default=[])
    defaultOptions: dict[str, list["QuestionFieldOption"]] | None = Field(default={})
    defaultOptionsGroup: dict[str, list["QuestionFieldOptionsGroup"]] | None = Field(
        default={}
    )


class KbAssessmentConfigBaseModel(
    QuestionnaireCoreModel,
    KbAssessmentConfigBaseValidator,
):
    defaultOptionsGroup: dict[str, list["QuestionFieldOptionsGroup"]] | None = Field(
        default={}
    )
    defaultOptions: dict[str, list["QuestionFieldOption"]] | None = Field(default={})

    def get_section_config(self, section_id: str) -> KbAssessmentConfigObject:
        for section in self.sections or []:
            if section.sectionId == section_id or section.sectionName == section_id:
                return KbAssessmentConfigObject(
                    questions=section.questions,
                    defaultOptions=self.defaultOptions,
                    defaultOptionsGroup=self.defaultOptionsGroup,
                )
        return KbAssessmentConfigObject(
            defaultOptions=self.defaultOptions,
            defaultOptionsGroup=self.defaultOptionsGroup,
        )

    @property
    def ai(self) -> KbAssessmentConfigObject:
        return self.get_section_config("ai")

    @property
    def pentest(self) -> KbAssessmentConfigObject:
        return self.get_section_config("pentest")

    @property
    def graph_reasoning(self) -> KbAssessmentConfigObject:
        return self.get_section_config("graph_reasoning")

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
