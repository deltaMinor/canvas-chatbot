from typing import Self

from pydantic import Field, model_validator

from shared_libs.models.model_validators import ProjectCactiBaseValidator

from .diagram_file import ProjectADFileBaseModel
from .shared.shared.database import PatchBaseModel

__all__ = [
    "ProjectCactiBaseModel",
]


class ProjectCactiBaseModel(
    PatchBaseModel,
    ProjectCactiBaseValidator,
):
    files: list["ProjectADFileBaseModel"] | None = Field(default=[])

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
