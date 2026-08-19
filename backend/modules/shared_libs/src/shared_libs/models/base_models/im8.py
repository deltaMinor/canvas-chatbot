from typing import Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.base_models.shared.shared.database import PatchBaseModel
from shared_libs.models.model_validators import KbIM8BaseValidator

__all__ = [
    "IM8PolicyModel",
    "KbIM8BaseModel",
]


class IM8PolicyModel(BaseModel):
    id: str
    annex_ref: str | None = Field(default="")
    category: str | None = Field(default="")
    domain: str | None = Field(default="")
    footnote_ref: str | None = Field(default="")
    guideline_ref: str | None = Field(default="")
    image_name: str | None = Field(default="")
    image_url: str | None = Field(default="")
    policy_ref: str | None = Field(default="")
    in_scope: bool | None = Field(default=False)
    is_auto_compliant: bool | None = Field(default=False)
    std_ref: str | None = Field(default="")
    subdomain: str | None = Field(default="")
    tags: str | None = Field(default="")
    text: str | None = Field(default="")


class KbIM8BaseModel(
    PatchBaseModel,
    KbIM8BaseValidator,
):
    im8: list["IM8PolicyModel"] | None = Field(default=[])

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
