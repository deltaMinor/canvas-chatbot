import { IsAuthorized, UserAuthorization } from "#root/interfaces/authorization";
import { Project } from "#root/interfaces/project";
import { AuthorizationManager } from "#root/lib/AuthorizationManager";

export interface ProjectsAuthorizationState {
    isAuthorizedToCreateAny: boolean;
    isAuthorizedToDeleteAny: boolean;
    isAuthorizedToReadAny: boolean;
    isAuthorizedToUpdateAny: boolean;
}

export const getAdminProjectUpdatePermissions = (authorization: UserAuthorization): string[] => {
    const projectPermissions = authorization.user_permission_doc["project"];

    return [
        projectPermissions?.fields?.["project_name"]?.update ?? "",
        projectPermissions?.fields?.["resource_tags"]?.update ?? "",
        projectPermissions?.fields?.["project_status"]?.update ?? "",
    ];
};

export const getAdminProjectAuthorizationMapping = ({
    authorization,
    projects,
}: {
    authorization: UserAuthorization;
    projects: Project[];
}): { [key: string]: IsAuthorized } => {
    const { user_permission_doc } = authorization;
    const projectUpdatePermissions = getAdminProjectUpdatePermissions(authorization);
    const authorizationManager = new AuthorizationManager(authorization);

    return projects.reduce(
        (mapping, project) => {
            const project_id = `${project.project_id ?? ""}`;
            mapping[project_id] = {
                create: authorizationManager.checkIfProjectResourceAuthorized(
                    user_permission_doc["project"]?.create ?? "",
                    project_id
                ),
                read: authorizationManager.checkIfProjectResourceAuthorized(
                    user_permission_doc["project"]?.read ?? "",
                    project_id
                ),
                update: projectUpdatePermissions.some((permission) =>
                    authorizationManager.checkIfProjectResourceAuthorized(permission, project_id)
                ),
                delete: authorizationManager.checkIfProjectResourceAuthorized(
                    user_permission_doc["project"]?.delete ?? "",
                    project_id
                ),
            };
            return mapping;
        },
        {} as { [key: string]: IsAuthorized }
    );
};

export const getProjectsAuthorizationState = (): ProjectsAuthorizationState => {
    return {
        isAuthorizedToCreateAny: true,
        isAuthorizedToDeleteAny: true,
        isAuthorizedToReadAny: true,
        isAuthorizedToUpdateAny: true,
    };
};
