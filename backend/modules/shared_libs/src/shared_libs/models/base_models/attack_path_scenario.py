from pydantic import BaseModel, Field

from shared_libs.models.base_models.shared.register import ThreatFrameworks

__all__ = [
    "AttackPathScenarioBaseModel",
]


class PathBaseModel(BaseModel):
    path_id: str
    path: list[str] | None = Field(default=[])
    mitre_path: list[str | list] | None = Field(default=[])
    path_narrative: str | None = Field(default="")
    likelihood: float | None = None
    impact: int | None = None
    impact_category: str | None = Field(default="")
    frameworks: ThreatFrameworks | None = Field(default_factory=ThreatFrameworks)
    mitigation: list[str] | None = Field(default=[])
    threat_impact: dict[str, str] | None = Field(default={})


class ThreatScenarioBaseModel(BaseModel):
    threat_scenario_id: str
    likelihood: float | None = None
    impact: int | None = None
    frameworks: ThreatFrameworks | None = Field(default_factory=ThreatFrameworks)
    mitigation: list[str] | None = Field(default=[])
    path_narratives: list[str] | None = Field(default=[])
    path_ids: list[str] | None = Field(default=[])
    risk_scenario: str | None = Field(default="")
    key_risk: str | None = Field(default="")
    key_insight: str | None = Field(default="")
    scenario_narrative: str | None = Field(default="")
    threat_impact: dict[str, str] | None = Field(default={})


class AttackPathScenarioBaseModel(BaseModel):
    paths: list[PathBaseModel] | None = Field(default=[])
    threat_scenario: list[ThreatScenarioBaseModel] | None = Field(default=[])
