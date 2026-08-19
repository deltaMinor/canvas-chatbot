import { Metadata } from ".";

import { ProjectSettings, ProjectSettingsSection } from "#root/enums/project";

import { ProjectProps } from "./common";
import { ProjectDiagram } from "./diagram";
import { ProjectCQ, ProjectCQTemplate, QuestionOption, QuestionOptionGroup } from "./questionnaire";
import {
    FrameworkCategoryEnum,
    MitigationMeasure,
    ProjectRegister,
    ProjectRegisterAssessment,
    ProjectRegisterFields,
    RiskRegister,
} from "./register";

export enum ProjectResourceTag {
    team = "team",
    agency = "agency",
    division = "division",
    ministry = "ministry",
}

export enum ProjectTableFieldsEnum {
    project_id = "project_id",
    project_name = "project_name",
    project_progress = "project_progress",
    project_status = "project_status",
    resource_tags = "resource_tags",
    tier_level = "tier_level",
    //
    modified_on = "modified_on",
    created_on = "created_on",
    actions = "actions",
    actionMenu = "actionMenu",
}

export enum ProjectEnum {
    integrations = "integrations",
    jira_project_key = "jira_project_key",
    jira_site_name = "jira_site_name",
    //
    project_file = "project_file",
    project_id = "project_id",
    project_name = "project_name",
    project_progress = "project_progress",
    project_status = "project_status",
    resource_tags = "resource_tags",
    //
    progress = "progress",
    project_group = "project_group",
    project_group_id = "project_group_id",
    project_group_name = "project_group_name",
    project_id_list = "project_id_list",
    resource_tag_names = "resource_tag_names",
    user_count = "user_count",
}

export interface Progress {
    design: number;
    dfd: number;
    iteration: number;
    questionnaire: number;
    upload: number;
}

export interface MasterCTSchemaProps {
    schema_: string;
}

export interface ProjectAssessmentHistory extends ProjectProps {
    history: (Partial<ProjectRegister> & {
        assessment_id?: string;
        assessment: ProjectRegisterAssessment | null;
        timestamp: string;
        risk_scenarios: Partial<ProjectRegisterFields>[];
    })[];
    offset?: number;
    limit?: number;
    total_count?: number;
    has_more?: boolean;
}

// Backward-compat alias
export type ProjectAssessment = ProjectAssessmentHistory;

export interface ProjectAssessmentMitigation extends ProjectProps {
    assessment_id: string;
    mitigations: MitigationMeasure[];
}

export interface OverallStat {
    count_rr: number;
    count_im8: number;
    count_attack: number;
}

export interface StatRiskLevel {
    undefined: number;
    low: number;
    medium: number;
    medium_high: number;
    high: number;
    very_high: number;
}

export enum GenerationSettingsEnum {
    allowMasterRegisterGeneration = "allowMasterRegisterGeneration",
    allowKbMitreGeneration = "allowKbMitreGeneration",
}
export interface GenerationSettings {
    [GenerationSettingsEnum.allowMasterRegisterGeneration]: boolean;
    [GenerationSettingsEnum.allowKbMitreGeneration]: boolean;
}
export interface DisplayFrameworksSettings {
    [FrameworkCategoryEnum.owasp]: boolean;
    [FrameworkCategoryEnum.owaspAi]: boolean;
    [FrameworkCategoryEnum.rapids]: boolean;
    [FrameworkCategoryEnum.scanHp]: boolean;
    [FrameworkCategoryEnum.stride]: boolean;
    [FrameworkCategoryEnum.tm]: boolean;
}

export { ProjectSettings, ProjectSettingsSection };

export const ProjectSettingsLabel = {
    [ProjectSettingsSection.generation]: "Risk Assessment",
    [ProjectSettingsSection.displayFrameworks]: "Display Frameworks",
    [ProjectSettingsSection.integration]: "Integration",
    [ProjectSettingsSection.reset]: "Danger Zone",
};

export interface ProjectSettingsData {
    [ProjectSettings.generation]: GenerationSettings;
    [ProjectSettings.displayFrameworks]: DisplayFrameworksSettings;
}

export interface ProjectProgress {
    architecture_diagram: number;
    conception_questionnaire: number;
    review_questionnaire: number;
    run_assessment: number;
}

export interface ProjectCore extends ProjectProps {
    project_name: string;
    project_progress: ProjectProgress;
    project_status: string;
    project_settings: ProjectSettingsData;
    resource_tags: string[];
    tier_level: number;
}

interface ProjectJira {
    jira_project_key: string;
    jira_site_name: string;
}

export interface ProjectIntegration {
    jira?: ProjectJira;
}

export interface Project extends ProjectCore {
    metadata?: Metadata;
    // setup_progress?: Progress;
    user_count?: number;
    project_file?: FileList;
    integrations: ProjectIntegration;
}

export interface ImportProject {
    integrations?: ProjectIntegration;
    project_data?: ProjectExportData;
    resource_tags?: string[];
}

export type ProjectFieldTypes = ProjectCQ | RiskRegister | Progress;

export enum ProjectStatusEnum {
    ACTIVE = "active",
    DISABLED = "disabled",
}

export interface ProjectExportData {
    project_cq_template: ProjectCQTemplate;
    project_cq: ProjectCQ<QuestionOption, QuestionOptionGroup>;
    project_diagram: ProjectDiagram;
    project_assessment_history: ProjectAssessmentHistory;
    project_register: ProjectRegister;
    project: Project;
    assessment_mitigation: ProjectAssessmentMitigation;
}
