from typing import Self

from pydantic import ConfigDict, Field, model_validator

from shared_libs.models.base_models.database import DatabaseModel
from shared_libs.models.base_models.register import (
    AssessmentData,
    ProjectRegisterBaseModel,
    ProjectRiskScenario,
)
from shared_libs.models.base_models.shared.register import ThreatFrameworks
from shared_libs.models.base_models.shared.shared.database import PatchBaseModel
from shared_libs.models.model_validators import (
    ProjectAssessmentBaseValidator,
    ProjectRegisterHistoryBaseValidator,
    ProjectRegisterStatsValidator,
)

__all__ = [
    "RiskRegisterProjectStats",
    "ProjectRegisterHistoryRiskScenario",
    "ProjectAssessmentBaseModel",
    "ProjectRegisterHistorySnapshotBaseModel",
    "ProjectRegisterHistoryBaseModel",
]


class RiskRegisterProjectStats(
    PatchBaseModel,
    ProjectRegisterStatsValidator,
):
    riskScenarioId: str
    applicability: int | None = Field(default=0)
    defaultRiskLevel: int | None = Field(default=0)
    knowledgebaseSource: str | None = Field(default="")
    frameworks: ThreatFrameworks | None = Field(default_factory=ThreatFrameworks)
    residualRiskLevel: int | None = Field(default=0)

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = ProjectRegisterStatsValidator.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class ProjectRegisterHistoryRiskScenario(RiskRegisterProjectStats):
    model_config = ConfigDict(extra="allow")

    riskScenarioId: str | None = Field(default="")


class ProjectAssessmentBaseModel(
    ProjectRegisterBaseModel,
    PatchBaseModel,
    ProjectAssessmentBaseValidator,
):
    """Base model for persisted project assessment documents.

    This is the active per-assessment document shape. It combines the full
    project register field set with the top-level assessment document metadata.
    """

    project_id: str | None = Field(default="")
    timestamp: str | None = Field(default="")
    risk_scenarios: list[ProjectRiskScenario] | None = Field(default=[])

    # Assessment documents keep the canonical id at top level, not in assessment.
    assessment: AssessmentData | None = Field(default_factory=AssessmentData)
    assessment_id: str | None = Field(default="")

    migration_source: str | None = Field(default="")
    migrated_at: str | None = Field(default="")

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = ProjectAssessmentBaseValidator.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


# ---------------------------------------------------------------------------
# Migration-only models - not used by normal runtime flows
# ---------------------------------------------------------------------------


class ProjectRegisterHistorySnapshotBaseModel(
    DatabaseModel,
    ProjectRegisterBaseModel,
):
    """Legacy point-in-time project register snapshot captured at assessment time."""

    project_id: str | None = Field(default="")
    timestamp: str | None = Field(default="")
    risk_scenarios: list[ProjectRiskScenario] | None = Field(default=[])


class ProjectRegisterHistoryBaseModel(
    PatchBaseModel,
    ProjectRegisterHistoryBaseValidator,
):
    """Schema for the legacy project_register_history MongoDB collection.

    Legacy documents stored all snapshots for one project as an array inside a
    single document keyed by project_id. Runtime reads now use the
    project_assessment collection instead.
    """

    last_timestamp: str | None = Field(default="")
    history: list["ProjectRegisterHistorySnapshotBaseModel"] | None = Field(default=[])

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
