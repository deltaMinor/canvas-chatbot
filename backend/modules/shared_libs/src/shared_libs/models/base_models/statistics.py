from pydantic import BaseModel, Field

__all__ = [
    "ProjectStatisticsModel",
    "ProjectCompliancePolicyStatsModel",
]


class ComplianceCount(BaseModel):
    totalCount: int | None = Field(default=0)
    inScopeTotalCount: int | None = Field(default=0)
    inScopeCompliantCount: int | None = Field(default=0)
    outScopeTotalCount: int | None = Field(default=0)
    outScopeCompliantCount: int | None = Field(default=0)


class ProjectCompliancePolicyStatsModel(BaseModel):
    im8: ComplianceCount | None = Field(default_factory=ComplianceCount)
    ccop: ComplianceCount | None = Field(default_factory=ComplianceCount)
    csf: ComplianceCount | None = Field(default_factory=ComplianceCount)
    iso: ComplianceCount | None = Field(default_factory=ComplianceCount)


class RiskLevelChanges(BaseModel):
    total: int | None = Field(default=0)
    down: int | None = Field(default=0)
    up: int | None = Field(default=0)
    flat: int | None = Field(default=0)


class ProjectStatisticsModel(BaseModel):
    project_id: str | None = Field(default="")
    compliance: ProjectCompliancePolicyStatsModel = Field(
        default_factory=ProjectCompliancePolicyStatsModel
    )
    riskLevelChanges: RiskLevelChanges = Field(default_factory=RiskLevelChanges)
