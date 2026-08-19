from typing import Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.base_models.shared.llm import KbLLMQuestionModel
from shared_libs.models.base_models.shared.shared.database import PatchBaseModel
from shared_libs.models.base_models.shared.shared.question import (
    QuestionFieldOptionsGroup,
    QuestionToConfigurationModel,
)
from shared_libs.models.model_validators import KbLLMPromptBaseValidator

__all__ = [
    "PromptGenerationRuleCombineTemplateModel",
    "PromptGenerationRuleFormatModel",
    "PromptGenerationRuleModel",
    "KbLLMPromptBaseModel",
]


class PromptGenerationRuleCombineTemplateModel(BaseModel):
    template: str | None = Field(default="")
    operator: str | None = Field(default="")
    toCombine: list[str] | None = Field(default=[])


class PromptGenerationRuleFormatModel(BaseModel):
    phase: str | None = Field(default="")
    template: list[str] | None = Field(default=[])
    combineTemplate: list["PromptGenerationRuleCombineTemplateModel"] | None = Field(
        default=[]
    )
    userEditable: list[str] | None = Field(default=[])


class PromptGenerationRuleModel(BaseModel):
    fieldId: str
    generationOption: str | None = Field(default="")
    format: list["PromptGenerationRuleFormatModel"] | None = Field(default=[])


class KbLLMPromptBaseModel(
    PatchBaseModel,
    KbLLMPromptBaseValidator,
):
    defaultOptionsGroup: dict[str, list["QuestionFieldOptionsGroup"]] | None = Field(
        default={}
    )
    schema_: str | None = Field(default="")
    prompt_template_lines: dict | None = Field(default={})
    prompt_generation_rules: list["PromptGenerationRuleModel"] | None = Field(
        default=[]
    )
    questions: list["KbLLMQuestionModel"] | None = Field(default=[])
    question_to_configuration: list["QuestionToConfigurationModel"] | None = Field(
        default=[]
    )
    input_prompts: dict[str, list] | None = Field(default=[])

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
