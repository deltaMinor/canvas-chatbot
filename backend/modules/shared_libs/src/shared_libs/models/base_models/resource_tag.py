from typing import Self

from pydantic import Field, model_validator

from shared_libs.models.model_validators import ResourceTagBaseValidator

from .shared.shared.database import PatchBaseModel

__all__ = [
    "ResourceTagBaseModel",
]


class ResourceTagBaseModel(
    PatchBaseModel,
    ResourceTagBaseValidator,
):
    tag_id: str
    tag_name: str | None = Field(default="")
    parent_tag_id: str | None = Field(default="")
    tier_level: int | None = Field(default=0, ge=0)

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
