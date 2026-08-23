import { Edge, Node } from "@xyflow/react";
import { FormikValues } from "formik";

import { ProjectProps } from "#root/interfaces/common";
import { CanvasProps, DiagramCanvas, DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import {
    BaseRegisterFields,
    MasterRegister,
    MasterRegisterFields,
    MitigationMeasure,
    ProjectRegisterFields,
} from "#root/interfaces/register";
import { UserCoreFields } from "#root/interfaces/user";

export interface AddProjectBody {
    project_name: string;
    project_group_id: string;
}

export interface PatchNodeToscaBody {
    node: Node;
}
export interface DateProps {
    created?: Date;
    modified?: Date;
}

export interface DeleteFileBody extends ProjectProps {
    filenames: string[];
}

export interface FormAnswerBody extends ProjectProps {
    values?: FormikValues;
}

export interface PatchDiagramBody extends ProjectProps {
    edges: Edge[];
    nodes: Node[];
}

export interface PostAnswers extends ProjectProps {
    schema_: number;
    values: FormikValues;
}

export interface PostAnswersBody extends DateProps, PostAnswers {}

export interface CanvasBody extends ProjectProps, CanvasProps {}

export interface DeleteCanvasBody extends ProjectProps {
    canvas_id: string;
}

export interface PostCreateNewProjectFormData {
    project_name: string;
    resource_tags: string[];
}

export interface PostCreateNewProjectBody {
    project_name: string;
    resource_tags: string[];
}

export interface PostGenerateDiagramFromTemplateBody extends ProjectProps {
    templateId: string;
}

export interface PostUpdateProjectGroupBody extends ProjectProps {
    project_group_id: string;
}

export interface ResetPasswordWithTokenBody extends Pick<UserCoreFields, "password"> {
    encoded_token: string;
}

export interface CustomSignInParams {
    userState: {
        username: string;
        user_id: string;
        is_temp_password: boolean;
    };
    auth: {
        token: string;
        type: string;
    };
    refresh?: string;
}

export interface UpdateProjectRegisterScenarioBody extends ProjectProps {
    risk_scenario: Partial<ProjectRegisterFields>;
}

export interface AddLLMScenarioToProjectRegisterBody extends ProjectProps {
    llm_risk_scenario_id_list: string[];
}

export interface DiscardLLMScenariosBody extends ProjectProps {
    llm_risk_scenario_id_list?: string[];
}

export interface DeleteProjectRegisterScenarioBody extends ProjectProps {
    risk_scenario_id_list: string[];
}

export interface UpdateMasterRegisterScenarioBody {
    risk_scenario: Partial<MasterRegisterFields>;
}

export interface DeleteMasterRegisterScenarioBody {
    risk_scenario_id_list: string[];
}

export interface PostActualMitigationMeasureBody
    extends
        ProjectProps, //
        Pick<BaseRegisterFields, "riskScenarioId"> {
    actualMitigationMeasure: Partial<MitigationMeasure>;
}

export interface PatchActualMitigationMeasureBody
    extends
        ProjectProps, //
        Pick<BaseRegisterFields, "riskScenarioId"> {
    actualMitigationMeasure: Partial<MitigationMeasure>;
    mitigationId: string;
}

export interface DeleteActualMitigationMeasureBody
    extends
        ProjectProps, //
        Pick<BaseRegisterFields, "riskScenarioId"> {
    mitigation_id_list: string[];
}

export interface PostMasterMitigationBody {
    mitigation_measure: Partial<MitigationMeasure>;
}

export interface PatchMasterMitigationBody {
    mitigation_measure: Partial<MitigationMeasure>;
}

export interface DeleteMasterMitigationBody {
    mitigation_id_list: string[];
}

export interface PatchMasterRegister {
    master_register: Partial<MasterRegister>;
}

export interface GetMasterMitigationMeasureLogsParams {
    mitigationId?: string;
}

export interface PatchProjectDiagramNodeBody extends ProjectProps {
    canvas_id: string;
    node_id: string;
    node: Partial<DiagramNode>;
}

export interface PatchProjectDiagramEdgeBody extends ProjectProps {
    canvas_id: string;
    edge_id: string;
    edge: Partial<DiagramEdge>;
}

export interface PatchProjectDiagramCanvasBody extends ProjectProps {
    canvas_id: string;
    canvas: Partial<DiagramCanvas>;
}

export interface GetIntegrationBody {
    user_id: string;
}

export interface PatchIntegrationJiraBody extends ProjectProps {
    jira_project_key?: string;
    jira_site_name?: string;
    jiraApiToken?: string;
    jiraUsername?: string;
    testOnly?: boolean;
    user_id: string;
}

export interface GetJiraIssueBody extends ProjectProps {
    user_id: string;
    jiraIssueId: string;
}

export interface GetJiraIssueOptionsBody extends ProjectProps {
    user_id: string;
}

export interface PatchJiraIssueBody extends ProjectProps {
    user_id: string;
    jiraIssueId: string;
    jiraField: { [key: string]: unknown };
}

export interface PostJiraIssueBody extends ProjectProps {
    user_id: string;
    jiraField: { [key: string]: unknown };
}
