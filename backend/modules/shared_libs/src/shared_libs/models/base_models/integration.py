from typing import Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.alias import Datetime
from shared_libs.models.model_validators import IntegrationBaseValidator

from .shared.shared.database import PatchBaseModel

__all__ = [
    "IntegrationBaseModel",
    "JiraConfiguration",
]


class JiraConfiguration(BaseModel):
    jiraApiToken: str | None = Field(default="")
    jiraUsername: str | None = Field(default="")
    project_id: str
    status: str | None = Field(default="")
    timestamp: Datetime | None = None


class IntegrationBaseModel(
    PatchBaseModel,
    IntegrationBaseValidator,
):
    jira_configurations: list["JiraConfiguration"] | None = Field(default=[])
    user_id: str

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
