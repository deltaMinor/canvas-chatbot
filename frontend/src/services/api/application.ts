import axios from "axios";

import { AuditLog, AxiosApiResponse } from "#root/interfaces";
import { ProjectProps } from "#root/interfaces/common";
import {
    ImportProject,
    Project,
    ProjectProgress,
    ProjectSettingsData,
} from "#root/interfaces/project";
import { ResourceTagFields } from "#root/interfaces/resource_tag";
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

    async getAllProjects(): Promise<AxiosApiResponse<{ projects: Project[] }>> {
        return await axios_api.get("projects");
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
}
