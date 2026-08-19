from typing import Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.model_validators import KbToscaBaseValidator

from .shared.shared.database import PatchBaseModel

__all__ = [
    "ToscaMappingEnumeratedModel",
    "ToscaMappingModel",
    "KbToscaBaseModel",
]


class ToscaMappingEnumeratedModel(BaseModel):
    cluster_icon_key: dict[str, str] | None = Field(default={})
    cluster_terraform: dict[str, str] | None = Field(default={})
    dataflow_icon_key: dict[str, str] | None = Field(default={})
    dataflow_label: dict[str, str] | None = Field(default={})
    icon_key: dict[str, str] | None = Field(default={})
    terraform: dict[str, str] | None = Field(default={})


class ToscaMappingModel(BaseModel):
    mapping_to_individual: ToscaMappingEnumeratedModel | None = Field(
        default_factory=ToscaMappingEnumeratedModel,
    )
    mapping_to_class: ToscaMappingEnumeratedModel | None = Field(
        default_factory=ToscaMappingEnumeratedModel,
    )


class KbToscaBaseModel(
    PatchBaseModel,
    KbToscaBaseValidator,
):
    tosca_mapping: ToscaMappingModel | None = Field(
        default_factory=ToscaMappingModel,
    )
    schema_: str | None = Field(default="")

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
