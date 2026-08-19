from typing import Optional, Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.base_models.shared.shared.database import PatchBaseModel
from shared_libs.models.model_validators import ProjectBaseValidator

__all__ = [
    "ProjectBaseModel",
    "ProjectIntegrationBaseModel",
    "ProjectJiraBaseModel",
    "ProjectProgressBaseModel",
]


class DisplayFrameworksSettings(BaseModel):
    owasp: bool | None = Field(default=False)
    owaspAi: bool | None = Field(default=False)
    rapids: bool | None = Field(default=False)
    scanHp: bool | None = Field(default=False)
    stride: bool | None = Field(default=True)
    tm: bool | None = Field(default=False)


class GenerationSettings(BaseModel):
    allowMasterRegisterGeneration: bool | None = Field(default=False)
    allowKbMitreGeneration: bool | None = Field(default=True)


class ProjectSettings(BaseModel):
    generation: GenerationSettings | None = Field(default_factory=GenerationSettings)
    displayFrameworks: DisplayFrameworksSettings | None = Field(
        default_factory=DisplayFrameworksSettings
    )


class ProjectProgressBaseModel(BaseModel):
    conception_questionnaire: int | None = Field(default=0)
    review_questionnaire: int | None = Field(default=0)
    architecture_diagram: int | None = Field(default=0)
    run_assessment: int | None = Field(default=0)
    resolve_issues: int | None = Field(default=0)
    view_threat_scenarios: int | None = Field(default=0)


class ProjectJiraBaseModel(BaseModel):
    jira_project_key: str | None = Field(default="")
    jira_site_name: str | None = Field(default="")


class ProjectIntegrationBaseModel(BaseModel):
    jira: Optional["ProjectJiraBaseModel"] = Field(
        default_factory=ProjectJiraBaseModel,
    )


class ProjectBaseModel(
    PatchBaseModel,
    ProjectBaseValidator,
):
    """Project persistence model.

    ``tier_level`` is derived from ``resource_tags`` rather than assigned
    directly. Each resource tag inherits its tier from its root tag. When a
    project is assigned tags from multiple roots, the project tier is the
    maximum effective root tier across those tags. This resolves conflicting
    tiers conservatively by keeping the project in the highest applicable tier.
    """

    project_id: str
    project_name: str = Field(min_length=1)
    project_progress: Optional["ProjectProgressBaseModel"] = Field(
        default_factory=ProjectProgressBaseModel,
    )
    project_settings: Optional["ProjectSettings"] = Field(
        default_factory=ProjectSettings
    )
    project_status: str | None = Field(default="active")
    resource_tags: list[str] | None = Field(default=[])
    tier_level: int | None = Field(default=0, ge=0)
    integrations: Optional["ProjectIntegrationBaseModel"] = Field(
        default_factory=ProjectIntegrationBaseModel,
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
