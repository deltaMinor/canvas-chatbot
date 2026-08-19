from typing import Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.model_validators import AppInfoBaseValidator

from .shared.shared.database import PatchBaseModel

__all__ = [
    "AppInfoReleaseUpdateModel",
    "AppInfoBaseModel",
]


class AppInfoReleaseUpdateModel(BaseModel):
    feature_name: str
    update_type: str | None = Field(default="")
    remarks: str | None = Field(default="")


class AppInfoBaseModel(
    PatchBaseModel,
    AppInfoBaseValidator,
):
    version_number: str
    release_updates: list["AppInfoReleaseUpdateModel"] | None = Field(default=[])
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
