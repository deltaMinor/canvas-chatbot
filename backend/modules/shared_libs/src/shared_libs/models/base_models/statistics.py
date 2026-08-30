from pydantic import BaseModel, Field

__all__ = [
    "ProjectStatisticsModel",
]


class RiskLevelChanges(BaseModel):
    total: int | None = Field(default=0)
    down: int | None = Field(default=0)
    up: int | None = Field(default=0)
    flat: int | None = Field(default=0)


class ProjectStatisticsModel(BaseModel):
    project_id: str | None = Field(default="")
    riskLevelChanges: RiskLevelChanges = Field(default_factory=RiskLevelChanges)
