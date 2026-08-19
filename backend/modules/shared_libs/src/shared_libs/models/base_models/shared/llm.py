from pydantic import BaseModel, Field

from .shared.question import QuestionModel

__all__ = [
    "ProjectLLMRefValues",
    "KbLLMQuestionTemplateModel",
    "KbLLMQuestionModel",
]


class ProjectLLMRefValues(BaseModel):
    label: str | None = Field(default="")
    imageUrl: str | None = Field(default="")
    image_id: str | None = Field(default="")
    is_generated: bool | None = Field(default=False)
    is_uploaded: bool | None = Field(default=False)


class KbLLMQuestionTemplateModel(BaseModel):
    key: str | None = Field(default="")
    line: str | None = Field(default="")
    userEditable: bool | None = Field(default=True)
    userInput: str | None = Field(default="")
    isHidden: bool | None = Field(default=False)


# TODO: Eliminate Unions
class KbLLMQuestionModel(QuestionModel):
    template: (
        str
        | list[ProjectLLMRefValues]
        | list[list["KbLLMQuestionTemplateModel"]]
        | None
    ) = Field(default=None)
