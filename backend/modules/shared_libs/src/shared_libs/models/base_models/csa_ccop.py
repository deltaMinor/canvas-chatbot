from typing import Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.base_models.shared.shared.database import PatchBaseModel
from shared_libs.models.model_validators import KbCsaCCoPBaseValidator

__all__ = [
    "CsaCCoPPolicyModel",
    "KbCsaCCoPBaseModel",
]


class CsaCCoPPolicyModel(BaseModel):
    id: str
    annex_ref: str | None = Field(default="")
    category: str | None = Field(default="")
    domain: str | None = Field(default="")
    footnote_ref: str | None = Field(default="")
    guideline_ref: str | None = Field(default="")
    image_name: str | None = Field(default="")
    image_url: str | None = Field(default="")
    in_scope: bool | None = Field(default=False)
    is_auto_compliant: bool | None = Field(default=False)
    policy_ref: str | None = Field(default="")
    std_ref: str | None = Field(default="")
    subdomain: str | None = Field(default="")
    tags: str | None = Field(default="")
    text: str | None = Field(default="")


class KbCsaCCoPBaseModel(
    PatchBaseModel,
    KbCsaCCoPBaseValidator,
):
    csa_ccop: list["CsaCCoPPolicyModel"] | None = Field(default=[])

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
