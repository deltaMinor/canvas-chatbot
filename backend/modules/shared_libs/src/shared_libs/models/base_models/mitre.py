from typing import Optional, Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.base_models.shared.shared.database import PatchBaseModel
from shared_libs.models.mitre import AttackPattern
from shared_libs.models.model_validators import KbMitreParsedBaseValidator

__all__ = [
    "ParsedMitreDomainModel",
    "MitreParsedDocs",
    "KbMitreParsedBaseModel",
]


class ParsedMitreDomainModel(BaseModel):
    ics: list["AttackPattern"] | None = Field(default=[])
    mobile: list["AttackPattern"] | None = Field(default=[])
    enterprise: list["AttackPattern"] | None = Field(default=[])
    atlas: list["AttackPattern"] | None = Field(default=[])
    embed: list["AttackPattern"] | None = Field(default=[])


class MitreParsedDocs(BaseModel):
    analytic: list["AttackPattern"] | None = Field(default=[])
    campaign: list["AttackPattern"] | None = Field(default=[])
    dataComponent: list["AttackPattern"] | None = Field(default=[])
    detectionStrategy: list["AttackPattern"] | None = Field(default=[])
    group: list["AttackPattern"] | None = Field(default=[])
    mitigation: list["AttackPattern"] | None = Field(default=[])
    mitigationUse: list["AttackPattern"] | None = Field(default=[])
    property: list["AttackPattern"] | None = Field(default=[])
    software: list["AttackPattern"] | None = Field(default=[])
    tactic: list["AttackPattern"] | None = Field(default=[])
    technique: list["AttackPattern"] | None = Field(default=[])


class KbMitreParsedBaseModel(
    PatchBaseModel,
    KbMitreParsedBaseValidator,
):
    schema_: str | None = Field(default="")
    mitre_parsed_docs: Optional["MitreParsedDocs"] = Field(
        default_factory=MitreParsedDocs,
    )

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
