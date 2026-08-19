from typing import Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.model_validators import (
    UserPolicyDocBaseValidator,
    UserRoleDocBaseValidator,
)

from .shared.shared.database import PatchBaseModel

__all__ = [
    "CRUDModel",
    "FieldsBaseModel",
    "IntegrationPermissionFieldsModel",
    "IntegrationPermissionModel",
    "MasterMitigationFieldsModel",
    "MasterMitigationFieldsModel",
    "MasterMitigationMeasureModel",
    "MasterMitigationPermissionModel",
    "MasterRegisterPermissionFieldsModel",
    "MasterRegisterPermissionModel",
    "MasterRegisterRiskScenarioFieldsModel",
    "MasterRegisterRiskScenarioPermissionModel",
    "MitigationFieldsModel",
    "PermissionModel",
    "ProjectPermissionFieldsModel",
    "ProjectPermissionModel",
    "ProjectRegisterPermissionFieldsModel",
    "ProjectRegisterPermissionModel",
    "ProjectRegisterRiskScenarioFieldsModel",
    "ProjectRegisterRiskScenarioPermissionModel",
    "ResourceTagFieldsModel",
    "ResourceTagPermissionModel",
    "UserCreditsPermissionFieldsModel",
    "UserCreditsPermissionModel",
    "UserPermissionFieldsModel",
    "UserPermissionModel",
    "UserPolicyDocBaseModel",
    "UserRoleDocBaseModel",
]


class UserRoleDocBaseModel(
    PatchBaseModel,
    UserRoleDocBaseValidator,
):
    role_key: str
    role_name: str | None = Field(default="")
    policy_association: list[str] | None = Field(default=[])
    is_admin: bool | None = Field(default=False)

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


class UserPolicyDocBaseModel(
    PatchBaseModel,
    UserPolicyDocBaseValidator,
):
    policy_key: str
    extends: list[str] | None = Field(default=[])
    permissions: list[str] | None = Field(default=[])
    policy_name: str | None = Field(default="")
    is_admin: bool | None = Field(default=False)

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


class CRUDModel(BaseModel):
    create: str | None = ""
    read: str | None = ""
    update: str | None = ""
    delete: str | None = ""


class FieldsBaseModel(BaseModel):
    def to_list(
        self,
        action_key: str,
    ) -> list[str]:
        permission_list = []
        field_keys = type(self).model_fields.keys()
        for k in field_keys:
            field_model: CRUDModel = getattr(self, k, None)
            if not field_model:
                continue
            permission: str = getattr(field_model, action_key, "")
            if not permission:
                continue
            permission_list.append(f"{permission}")
        return permission_list


class ResourceTagFieldsModel(FieldsBaseModel):
    parent_tag_id: CRUDModel
    tag_name: CRUDModel
    tier_level: CRUDModel


class ResourceTagPermissionModel(CRUDModel):
    fields: ResourceTagFieldsModel


class MasterRegisterRiskScenarioFieldsModel(FieldsBaseModel):
    category: CRUDModel
    defaultImpact: CRUDModel
    defaultLikelihood: CRUDModel
    defaultRiskLevel: CRUDModel
    keyRisk: CRUDModel
    mappingToATK: CRUDModel
    mappingToIM8: CRUDModel
    recommendedMitigationMeasures: CRUDModel
    recommendedMitigationMeasuresHidden: CRUDModel
    recommendedMitigationMeasuresParsed: CRUDModel
    riskScenario: CRUDModel
    riskScenarioId: CRUDModel
    subcategory: CRUDModel
    tags: CRUDModel


class MasterRegisterRiskScenarioPermissionModel(CRUDModel):
    fields: MasterRegisterRiskScenarioFieldsModel


class MasterRegisterPermissionFieldsModel(FieldsBaseModel):
    risk_scenarios: MasterRegisterRiskScenarioPermissionModel


class MasterRegisterPermissionModel(CRUDModel):
    fields: MasterRegisterPermissionFieldsModel


class ProjectRegisterRiskScenarioFieldsModel(
    MasterRegisterRiskScenarioFieldsModel,
):
    actualMitigationMeasures: CRUDModel
    applicability: CRUDModel
    attackPaths: CRUDModel
    knowledgebaseSource: CRUDModel
    location: CRUDModel
    frameworks: CRUDModel
    ranking: CRUDModel
    remarks: CRUDModel
    residualImpact: CRUDModel
    residualLikelihood: CRUDModel
    residualRiskLevel: CRUDModel
    responseAndRecoverPlan: CRUDModel
    sourceRiskScenarioId: CRUDModel
    status: CRUDModel
    tactics: CRUDModel

    # Comments
    treatmentComments: CRUDModel
    reviewComments: CRUDModel

    # Workflow metadata
    submittedForReviewBy: CRUDModel
    submittedForReviewOn: CRUDModel
    reviewedBy: CRUDModel
    reviewedOn: CRUDModel


class ProjectRegisterRiskScenarioPermissionModel(CRUDModel):
    fields: ProjectRegisterRiskScenarioFieldsModel


class ProjectRegisterPermissionFieldsModel(FieldsBaseModel):
    risk_scenarios: ProjectRegisterRiskScenarioPermissionModel
    integration: CRUDModel
    assessment: CRUDModel
    mitigation: CRUDModel
    review: CRUDModel


class ProjectRegisterPermissionModel(CRUDModel):
    fields: ProjectRegisterPermissionFieldsModel


class ProjectPermissionFieldsModel(FieldsBaseModel):
    #
    integrations: CRUDModel
    project_progress: CRUDModel
    project_settings: CRUDModel
    # admin
    project_name: CRUDModel
    project_status: CRUDModel
    resource_tags: CRUDModel


class ProjectPermissionModel(CRUDModel):
    fields: ProjectPermissionFieldsModel


class ProjectCQFieldsModel(FieldsBaseModel):
    values: CRUDModel


class ProjectCQPermissionModel(CRUDModel):
    fields: ProjectCQFieldsModel


class ProjectAssessmentLLMFieldsModel(FieldsBaseModel):
    llm_image: CRUDModel


class ProjectAssessmentLLMPermissionModel(CRUDModel):
    fields: ProjectAssessmentLLMFieldsModel


class UserPermissionFieldsModel(FieldsBaseModel):
    email: CRUDModel
    entitlements: CRUDModel
    is_temp_password: CRUDModel
    onboarding: CRUDModel
    password: CRUDModel
    tnc_acceptance_records: CRUDModel
    user_status: CRUDModel
    username: CRUDModel


class UserPermissionModel(CRUDModel):
    fields: UserPermissionFieldsModel


class IntegrationPermissionFieldsModel(FieldsBaseModel):
    jiraApiToken: CRUDModel
    jiraUsername: CRUDModel


class IntegrationPermissionModel(CRUDModel):
    fields: IntegrationPermissionFieldsModel


class MitigationFieldsModel(FieldsBaseModel):
    assignee: CRUDModel
    category: CRUDModel
    description: CRUDModel
    header: CRUDModel
    kbAssociations: CRUDModel
    measureFormat: CRUDModel
    measure: CRUDModel
    mitigationId: CRUDModel
    priority: CRUDModel
    ref: CRUDModel
    source: CRUDModel


class MasterMitigationFieldsModel(MitigationFieldsModel):
    isArchived: CRUDModel


class MasterMitigationMeasureModel(CRUDModel):
    fields: MasterMitigationFieldsModel


class MasterMitigationPermissionFieldsModel(FieldsBaseModel):
    mitigation_measures: MasterMitigationMeasureModel


class MasterMitigationPermissionModel(CRUDModel):
    fields: MasterMitigationPermissionFieldsModel


class UserCreditsPermissionFieldsModel(FieldsBaseModel):
    balance: CRUDModel


class UserCreditsPermissionModel(CRUDModel):
    fields: UserCreditsPermissionFieldsModel


class PermissionModel(BaseModel):
    app_tnc: CRUDModel
    app_version: CRUDModel
    feedback_form: CRUDModel
    kb_attack_graph_rule: CRUDModel
    kb_attack_flow: CRUDModel
    integration: IntegrationPermissionModel
    jira_issue: CRUDModel
    jira_options: CRUDModel
    kb_csa_ccop: CRUDModel
    kb_gt_llm_register: CRUDModel
    kb_im8: CRUDModel
    kb_mitre_parsed: CRUDModel
    kb_mitre: CRUDModel
    kb_nist_csf: CRUDModel
    kb_isoiec_27001: CRUDModel
    kb_owasp_register: CRUDModel
    kb_tosca: CRUDModel
    master_cq_template: CRUDModel
    master_cq: CRUDModel
    master_diagram_template: CRUDModel
    master_mitigation_log: CRUDModel
    master_mitigation: MasterMitigationPermissionModel
    master_register_log: CRUDModel
    master_register: MasterRegisterPermissionModel
    project_cq_log: CRUDModel
    project_cq_submit: CRUDModel
    project_cq_template: CRUDModel
    project_cq_start_from_template: CRUDModel
    project_cq_start_from_blank: CRUDModel
    project_cq_clear: CRUDModel
    project_cq_resume: CRUDModel
    project_cq: ProjectCQPermissionModel
    project_diagram_architecture_generate: CRUDModel
    project_diagram_data_flow_generate: CRUDModel
    project_diagram_file_cacti: CRUDModel
    project_diagram_file_json: CRUDModel
    project_diagram_file_image: CRUDModel
    project_diagram_file_module: CRUDModel
    project_diagram_file_pdf_document: CRUDModel
    project_diagram_file_terraform: CRUDModel
    project_diagram_file_xml: CRUDModel
    project_diagram_log: CRUDModel
    project_diagram_tosca_validate: CRUDModel
    project_diagram: CRUDModel
    project_log: CRUDModel
    project_statistics: CRUDModel
    project_duplicate: CRUDModel
    project_export: CRUDModel
    project_import: CRUDModel
    projects: CRUDModel
    project_assessment: CRUDModel
    project_assessment_heartbeat: CRUDModel
    project_assessment_heartbeat_running: CRUDModel
    project_assessment_abort: CRUDModel
    project_assessment_restore: CRUDModel
    project_assessment_reset: CRUDModel
    project_assessment_config: CRUDModel
    project_assessment_config_file: CRUDModel
    project_assessment_llm: ProjectAssessmentLLMPermissionModel
    project_assessment_cq: CRUDModel
    project_assessment_mitigation: CRUDModel
    project_assessment_diagram: CRUDModel
    project_register_history: CRUDModel
    project_register_log: CRUDModel
    project_register: ProjectRegisterPermissionModel
    project_register_llm_scenarios: CRUDModel
    project_register_reset: CRUDModel
    project: ProjectPermissionModel
    resource_tag_log: CRUDModel
    resource_tag: ResourceTagPermissionModel
    resource_tags: CRUDModel
    token: CRUDModel
    user_log: CRUDModel
    user_permission_doc: CRUDModel
    user_policy_doc: CRUDModel
    user_policy_option: CRUDModel
    user_role_doc: CRUDModel
    user_role_option: CRUDModel
    user: UserPermissionModel
    user_credits: UserCreditsPermissionModel
    user_credits_refresh: CRUDModel
    users: CRUDModel
