from typing import Self

from pydantic import Field, model_validator

from shared_libs.models.model_validators import FeedbackFormBaseValidator

from .shared.shared.database import PatchBaseModel

__all__ = [
    "FeedbackFormBaseModel",
]


class FeedbackFormBaseModel(
    PatchBaseModel,
    FeedbackFormBaseValidator,
):
    feedback_id: str
    feedback_content: str | None = Field(default="")
    feedback_type: str | None = Field(default="")
    user_id: str | None = Field(default="")
    username: str | None = Field(default="")
    email: str | None = Field(default="")

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
