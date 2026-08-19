import axios from "axios";

import { AuditLog, AxiosApiResponse } from "#root/interfaces";
import { AppTNCFields } from "#root/interfaces/app_tnc";
import { AppVersionFields } from "#root/interfaces/app_version";
import { ProjectProps } from "#root/interfaces/common";
import { FeedbackFormFields } from "#root/interfaces/feedback_form";
import { Integration, JiraIssue, JiraIssueOptions } from "#root/interfaces/integration";
import {
    ImportProject,
    Project,
    ProjectProgress,
    ProjectSettingsData,
} from "#root/interfaces/project";
import {
    ProjectCQ,
    ProjectCQTemplate,
    QuestionOption,
    QuestionOptionGroup,
} from "#root/interfaces/questionnaire";
import { ResourceTagFields } from "#root/interfaces/resource_tag";
import {
    GetIntegrationBody,
    GetJiraIssueBody,
    GetJiraIssueOptionsBody,
    PatchIntegrationJiraBody,
    PatchJiraIssueBody,
    PostJiraIssueBody,
} from "#root/interfaces/service";
import { ProjectStatistics } from "#root/interfaces/statistics";
import { UserAdminFields, UserCoreFields } from "#root/interfaces/user";
import {
    APPLICATION_API_URL_PREFIX,
    SINGLE_ORIGIN_SERVER_BASE_URL,
    baseHeaders,
} from "#root/lib/http-common";

import { setupApiInterceptors } from "./tokenRefresh";

const baseURL = `${SINGLE_ORIGIN_SERVER_BASE_URL}/${APPLICATION_API_URL_PREFIX}`;

// eslint-disable-next-line import/no-named-as-default-member
const axios_api = axios.create({
    baseURL,
    headers: { ...baseHeaders },
});

// Setup standardized interceptors
setupApiInterceptors(axios_api);

export class ApplicationService {
    constructor() {}

    // projects
    async getProject(
        { project_id }: ProjectProps //
    ): Promise<AxiosApiResponse<{ project: Project }>> {
        return await axios_api.get("project", { params: { project_id } });
    }
    async patchProjectProgress(
        body: ProjectProps & { project_progress: Partial<ProjectProgress> } //
    ): Promise<AxiosApiResponse> {
        return await axios_api.patch("project/project_progress", body);
    }

    async patchProjectSettings(
        body: ProjectProps & { project_settings: Partial<ProjectSettingsData> } //
    ): Promise<AxiosApiResponse> {
        return await axios_api.patch("project/project_settings", body);
    }

    async patchProjectIntegrations(
        body: Partial<Project> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.patch("project/integrations", body);
    }
    async getAllProjects(): Promise<AxiosApiResponse<{ projects: Project[] }>> {
        return await axios_api.get("projects");
    }
    async getProjectStatistics(
        { project_id }: ProjectProps //
    ): Promise<AxiosApiResponse<{ statistics: ProjectStatistics }>> {
        return await axios_api.get("project/statistics", { params: { project_id } });
    }
    async postProjectAdmin(
        obj: Partial<Project> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project", obj);
    }
    async duplicateProjectAdmin(
        obj: Partial<Project> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project/duplicate", obj);
    }
    async importProjectAdmin(
        obj: Partial<ImportProject> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project/import", obj);
    }
    async updateProjectAdmin(
        obj: Partial<Project> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.patch("project/admin", obj);
    }
    async deleteProjects(
        obj: { project_id_list?: string[] } //
    ): Promise<AxiosApiResponse> {
        return await axios_api.delete("projects", { data: obj });
    }

    // project_cq
    async getProjectCQ({
        project_id, //
    }: ProjectProps): Promise<
        AxiosApiResponse<{ project_cq: ProjectCQ<QuestionOption, QuestionOptionGroup> }>
    > {
        return await axios_api.get("project_cq", { params: { project_id } });
    }

    async saveProjectCQ(
        body: Partial<ProjectCQ> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.patch("project_cq", body);
    }

    async saveProjectCQWithTemplate(
        body: ProjectProps & { template_id: string } //
    ) {
        return await axios_api.post("project_cq/start/from_template", body);
    }

    async startProjectCQFromBlank(
        body: ProjectProps //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project_cq/start/from_blank", body);
    }

    async clearProjectCQ(
        body: ProjectProps //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project_cq/clear", body);
    }

    async resumeProjectCQ(
        body: ProjectProps //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project_cq/resume", body);
    }

    // project_cq logs
    async getProjectCQLogs({
        project_id, //
    }: ProjectProps): Promise<AxiosApiResponse<{ logs: AuditLog[] }>> {
        return await axios_api.get("project_cq/logs", {
            params: { project_id },
        });
    }

    async submitProjectCQ(
        body: Partial<ProjectCQ> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.patch("project_cq/submit", body);
    }

    // project_cq_template
    async getProjectCQTemplate(
        { project_id }: ProjectProps //
    ): Promise<AxiosApiResponse<{ project_cq_template: ProjectCQTemplate }>> {
        return await axios_api.get("project_cq/template", {
            params: { project_id },
        });
    }

    // resource_tags
    async getResourceTags(): Promise<AxiosApiResponse<{ resource_tags: ResourceTagFields[] }>> {
        return await axios_api.get("resource_tags");
    }
    async createNewResourceTagAdmin(obj: Partial<ResourceTagFields>): Promise<AxiosApiResponse> {
        return await axios_api.post("resource_tag", obj);
    }
    async updateResourceTagAdmin(obj: Partial<ResourceTagFields>): Promise<AxiosApiResponse> {
        return await axios_api.patch("resource_tag", obj);
    }
    async updateResourceTagTierLevelAdmin(
        obj: Partial<ResourceTagFields>
    ): Promise<AxiosApiResponse> {
        return await axios_api.patch("resource_tag/tier_level", obj);
    }
    async deleteResourceTags(
        obj: Partial<ResourceTagFields> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.delete("resource_tags", { data: obj });
    }

    // feedback_form
    async getFeedbackForms(): Promise<AxiosApiResponse<{ feedback_forms: FeedbackFormFields[] }>> {
        return await axios_api.get("feedback_form");
    }
    async postFeedbackForm(
        body: Partial<FeedbackFormFields> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("feedback_form", body);
    }
    async deleteFeedbackForms(obj: { feedback_id_list?: string[] }): Promise<AxiosApiResponse> {
        return await axios_api.delete("feedback_form", { data: obj });
    }

    // app_version
    async getAppVersionData({
        version_number,
    }: Partial<AppVersionFields>): Promise<AxiosApiResponse<{ app_version: AppVersionFields }>> {
        return await axios_api.get("app_version", {
            params: { version_number },
        });
    }
    async getAppVersionDataList(): Promise<AxiosApiResponse> {
        return await axios_api.get("app_versions");
    }
    async getAppVersionNumbers(): Promise<AxiosApiResponse<{ app_versions: AppVersionFields[] }>> {
        return await axios_api.get("app_versions", {
            params: { numbers_only: "true" },
        });
    }

    // app_tnc
    async getAppTNCData(): Promise<AxiosApiResponse<{ app_tnc: AppTNCFields }>> {
        return await axios_api.get("app_tnc");
    }

    async initDatabases(): Promise<AxiosApiResponse> {
        return await axios_api.post("tools/actions/init-databases/run");
    }

    async triggerToolAction(
        toolKey: string //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post(`tools/actions/${toolKey}/run`);
    }

    async scanToolAction(
        toolKey: string //
    ): Promise<AxiosApiResponse> {
        return await axios_api.get(`tools/actions/${toolKey}/scan`);
    }

    async getToolActionProgress(
        toolKey: string,
        taskId: string //
    ): Promise<AxiosApiResponse> {
        return await axios_api.get(`tools/actions/${toolKey}/progress`, {
            params: { task_id: taskId },
        });
    }

    async triggerMigrationTool(
        migrationKey: string //
    ): Promise<AxiosApiResponse<{ migration_key: string; task_id: string }>> {
        return await axios_api.post(`tools/actions/${migrationKey}/run`);
    }

    async getToolHistory(): Promise<AxiosApiResponse<{ tool_history: unknown[] }>> {
        return await axios_api.get("tools/history");
    }

    // user
    async postAuthSignUp(
        obj: Partial<UserCoreFields> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("user", obj);
    }
    async getUser(
        obj: Partial<UserCoreFields> //
    ): Promise<AxiosApiResponse<{ user: UserCoreFields }>> {
        return await axios_api.get("user/profile", { params: obj });
    }
    async postUserOnboardingComplete(
        obj: { user_id: string; step: string; version?: string } //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("user/onboarding/complete", obj);
    }
    async postUserOnboardingIncomplete(
        obj: { user_id: string; step: string } //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("user/onboarding/incomplete", obj);
    }
    async postUserTncAcceptance(
        obj: { user_id: string; tnc_type: string; version: string } //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("user/tnc/acceptance", obj);
    }
    async getAllUsersAdmin(): Promise<AxiosApiResponse<{ users: UserAdminFields[] }>> {
        return await axios_api.get("users");
    }
    async createNewUserAdmin(
        obj: Partial<UserCoreFields> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("user", obj);
    }
    async patchUserAdmin(
        obj: Partial<UserCoreFields> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.patch("user", obj);
    }
    async patchUserPasswordAdmin(
        obj: Partial<UserCoreFields> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.patch("user/password/admin", obj);
    }
    async patchSuperuserAdmin(
        obj: Partial<UserCoreFields> //
    ): Promise<AxiosApiResponse> {
        return await axios_api.patch("user/superuser", obj);
    }
    async deleteUsers(
        data: { user_id_list?: string[] } //
    ): Promise<AxiosApiResponse> {
        return await axios_api.delete("users", { data });
    }

    // Jira Issue
    async getJiraIssue(
        obj: GetJiraIssueBody //
    ): Promise<AxiosApiResponse<{ jira_issue: JiraIssue }>> {
        return await axios_api.get("integration/jira/issue", { params: obj });
    }
    async updateJiraIssue(
        obj: PatchJiraIssueBody //
    ): Promise<AxiosApiResponse<AxiosApiResponse>> {
        return await axios_api.patch("integration/jira/issue", obj);
    }
    async createJiraIssue(
        obj: PostJiraIssueBody //
    ): Promise<AxiosApiResponse<{ jira_issue_id: string }>> {
        return await axios_api.post("integration/jira/issue", obj);
    }

    // Jira Issue Options
    async getJiraIssueOptions(
        obj: GetJiraIssueOptionsBody //
    ): Promise<AxiosApiResponse<{ jira_issue_options: JiraIssueOptions }>> {
        return await axios_api.get("integration/jira/options", { params: obj });
    }

    // Integration
    async testAndPatchIntegrationJira(
        obj: PatchIntegrationJiraBody //
    ): Promise<AxiosApiResponse> {
        return await axios_api.patch("integration/jira", obj);
    }
    async getIntegration(
        obj: GetIntegrationBody //
    ): Promise<AxiosApiResponse<{ integration: Integration }>> {
        return await axios_api.get("integration", { params: obj });
    }
}
