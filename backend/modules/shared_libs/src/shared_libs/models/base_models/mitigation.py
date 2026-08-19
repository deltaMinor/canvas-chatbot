from typing import Self

from pydantic import Field, model_validator

from shared_libs.models.model_validators import MasterMitigationBaseValidator

from .shared.mitigation import MitigationMeasure
from .shared.shared.database import PatchBaseModel

__all__ = [
    "MasterMitigationMeasure",
    "MasterMitigationBaseModel",
]


class MasterMitigationMeasure(MitigationMeasure):
    pass


class MasterMitigationBaseModel(
    PatchBaseModel,
    MasterMitigationBaseValidator,
):
    schema_: str | None = Field(default="")
    mitigation_measures: list["MasterMitigationMeasure"] | None = Field(default=[])
    is_initialized: bool | None = Field(default=False)

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
