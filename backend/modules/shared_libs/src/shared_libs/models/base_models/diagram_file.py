from typing import Self

from pydantic import Field, model_validator

from shared_libs.models.alias import Datetime
from shared_libs.models.model_validators import (
    ProjectDiagramBaseValidator,
    ProjectDiagramFileBaseValidator,
)

from .shared.shared.database import PatchBaseModel

__all__ = [
    "ProjectADFileBaseModel",
    "ProjectDiagramFileBaseModel",
    "ProjectDiagramFilesBaseModel",
]


class ProjectDiagramFileBaseModel(
    PatchBaseModel,
    ProjectDiagramFileBaseValidator,
):
    data: str | None = Field(default="{}")
    file_id: str | None = Field(default="")
    filename: str | None = Field(default="")
    file_type: str | None = Field(default="")
    content_type: str | None = Field(default="")
    project_id: str | None = Field(default="")
    timestamp: Datetime | None = None
    imageUrl: str | None = Field(default="")
    fileUrl: str | None = Field(default="")

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


class ProjectADFileBaseModel(ProjectDiagramFileBaseModel):
    pass


class ProjectDiagramFilesBaseModel(
    PatchBaseModel,
    ProjectDiagramBaseValidator,
):
    files: list["ProjectDiagramFileBaseModel"] | None = Field(default=[])

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
