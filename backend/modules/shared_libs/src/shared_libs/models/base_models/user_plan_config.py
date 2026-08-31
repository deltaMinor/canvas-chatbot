from pydantic import BaseModel, ConfigDict, Field

__all__ = [
    "AiSpec",
    "ProjectsSpec",
    "DiagramSpec",
    "RegisterSpec",
    "QuestionnaireSpec",
    "StorageSpec",
    "TeamSpec",
    "ReportingSpec",
    "ApiSpec",
    "FeaturesSpec",
    "PlanSpec",
    "UserPlanConfigBaseModel",
]


class AiSpec(BaseModel):
    st_max: int = Field(default=0)
    mt_max: int = Field(default=0)
    mc_max: int = Field(default=0)
    lt_max: int = Field(default=0)
    allowed_models: list[str] = Field(default_factory=list)
    allowed_generation_kb: list[str] = Field(default_factory=list)
    allow_ai_topo_gen: bool = Field(default=False)
    allow_ai_dataflow_gen: bool = Field(default=False)
    max_concurrent_jobs_per_assessment: int = Field(default=1)
    max_concurrent_jobs_per_project: int = Field(default=2)
    max_concurrent_jobs_per_plan: int = Field(default=5)


class ProjectsSpec(BaseModel):
    max_projects: int = Field(default=1)
    max_members_per_root_tag: int = Field(default=5)
    max_concurrent_assessments: int = Field(default=1)


class DiagramSpec(BaseModel):
    max_info_nodes: int = Field(default=50)
    max_cluster_nodes: int = Field(default=10)
    max_edges: int = Field(default=200)
    max_undo_steps: int = Field(default=20)
    max_allowed_nested_nodes: int = Field(default=5)
    allow_change_node_style: bool = Field(default=True)
    allow_change_edge_style: bool = Field(default=True)
    allow_export_png: bool = Field(default=True)
    allow_export_json: bool = Field(default=True)
    allow_import_from_template: bool = Field(default=True)
    # AI-backed import types — overridden to False at read time when ai.allow_ai_topo_gen=False
    allow_import_terraform: bool = Field(default=False)
    allow_import_module: bool = Field(default=False)
    allow_import_cacti: bool = Field(default=False)
    allow_import_json: bool = Field(default=False)
    allow_import_image: bool = Field(default=False)
    allow_import_xml: bool = Field(default=False)
    max_allowed_import_file_size_json: int = Field(default=5242880)  # bytes (5 MB)
    max_allowed_import_file_count_json: int = Field(default=5)
    max_allowed_import_file_size_image: int = Field(default=10485760)  # bytes (10 MB)
    max_allowed_import_file_count_image: int = Field(default=10)


class RegisterSpec(BaseModel):
    max_risk_scenarios: int = Field(default=100)
    allowed_display_frameworks: list[str] = Field(default_factory=list)


class QuestionnaireSpec(BaseModel):
    max_user_story_cards: int = Field(default=50)
    max_compliance_policies: int = Field(default=3)
    max_ai_tech_extended_capabilities: int = Field(default=5)
    max_cloud_services: int = Field(default=5)
    max_key_functionalities: int = Field(default=10)
    max_system_interfaces: int = Field(default=5)


class StorageSpec(BaseModel):
    max_storage_mb: int = Field(default=500)
    max_file_size_mb: int = Field(default=10)


class TeamSpec(BaseModel):
    max_users: int = Field(default=5)
    max_admin_users: int = Field(default=1)
    max_concurrent_sessions: int = Field(default=5)


class ReportingSpec(BaseModel):
    max_exports_per_month: int = Field(default=10)
    reporting_credits_max: int = Field(default=0)


class ApiSpec(BaseModel):
    max_api_requests_per_minute: int = Field(default=60)
    allow_api_access: bool = Field(default=False)


class FeaturesSpec(BaseModel):
    allow_sso: bool = Field(default=False)
    allow_audit_logs: bool = Field(default=False)
    allow_custom_branding: bool = Field(default=False)
    allow_priority_support: bool = Field(default=False)


class PlanSpec(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    plan_type: str
    ai: AiSpec = Field(default_factory=AiSpec)
    projects: ProjectsSpec = Field(default_factory=ProjectsSpec)
    diagram: DiagramSpec = Field(default_factory=DiagramSpec)
    risk_register: RegisterSpec = Field(default_factory=RegisterSpec, alias="register")
    questionnaire: QuestionnaireSpec = Field(default_factory=QuestionnaireSpec)
    storage: StorageSpec = Field(default_factory=StorageSpec)
    team: TeamSpec = Field(default_factory=TeamSpec)
    reporting: ReportingSpec = Field(default_factory=ReportingSpec)
    api: ApiSpec = Field(default_factory=ApiSpec)
    features: FeaturesSpec = Field(default_factory=FeaturesSpec)


class UserPlanConfigBaseModel(BaseModel):
    schema_: str = Field(default="", alias="schema")
    plans: list[PlanSpec] = Field(default_factory=list)
