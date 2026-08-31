import {
    BackendState,
    ProjectScopedState,
    getProjectStateFromBackendState,
    getRouteProjectIdFromWindow,
} from "#root/redux/backendSlice";
import app_store, { app_actions } from "#root/redux/store";

import { getRootStateFromStore } from "./root";

export const getBackendStateFromStore = () => getRootStateFromStore().backend;

const createBackendGetter = <K extends keyof BackendState>(
    key: K,
    fallback: NonNullable<BackendState[K]>
) => {
    return () => (getBackendStateFromStore()[key] ?? fallback) as NonNullable<BackendState[K]>;
};

const getCurrentProjectStateFromStore = () =>
    getProjectStateFromBackendState(getBackendStateFromStore(), getRouteProjectIdFromWindow());

const createProjectGetter = <K extends keyof ProjectScopedState>(
    key: K,
    fallback: NonNullable<ProjectScopedState[K]>
) => {
    return () =>
        (getCurrentProjectStateFromStore()[key] ?? fallback) as NonNullable<ProjectScopedState[K]>;
};

const createProjectSetter = <K extends keyof ProjectScopedState>(
    key: K,
    action: (value: ProjectScopedState[K], projectId?: string) => { type: string },
    fallback: NonNullable<ProjectScopedState[K]>
) => {
    return (value: React.SetStateAction<NonNullable<ProjectScopedState[K]>>) => {
        const currentValue = (getCurrentProjectStateFromStore()[key] ?? fallback) as NonNullable<
            ProjectScopedState[K]
        >;
        const nextValue =
            typeof value === "function"
                ? (
                      value as (
                          prev: NonNullable<ProjectScopedState[K]>
                      ) => NonNullable<ProjectScopedState[K]>
                  )(currentValue)
                : value;

        app_store.dispatch(action(nextValue as ProjectScopedState[K]));
    };
};

const createBackendSetter = <K extends keyof BackendState>(
    key: K,
    action: (value: BackendState[K]) => { type: string },
    fallback: NonNullable<BackendState[K]>
) => {
    return (value: React.SetStateAction<NonNullable<BackendState[K]>>) => {
        const currentValue = (getBackendStateFromStore()[key] ?? fallback) as NonNullable<
            BackendState[K]
        >;
        const nextValue =
            typeof value === "function"
                ? (value as (prev: NonNullable<BackendState[K]>) => NonNullable<BackendState[K]>)(
                      currentValue
                  )
                : value;

        app_store.dispatch(action(nextValue as BackendState[K]));
    };
};

export const getAuthorizationFromStore = createBackendGetter(
    "authorization",
    {} as NonNullable<BackendState["authorization"]>
);
export const setAuthorization = createBackendSetter(
    "authorization",
    app_actions.backend.setAuthorization,
    {} as NonNullable<BackendState["authorization"]>
);

export const getUsersFromStore = createBackendGetter(
    "users",
    [] as NonNullable<BackendState["users"]>
);
export const setUsers = createBackendSetter(
    "users",
    app_actions.backend.setUsers,
    [] as NonNullable<BackendState["users"]>
);

export const getAttackFlowsGroupingsFromStore = createBackendGetter(
    "attackFlowsGroupings",
    [] as NonNullable<BackendState["attackFlowsGroupings"]>
);
export const setAttackFlowsGroupings = createBackendSetter(
    "attackFlowsGroupings",
    app_actions.backend.setAttackFlowsGroupings,
    [] as NonNullable<BackendState["attackFlowsGroupings"]>
);

export const getKbToscaFromStore = createBackendGetter(
    "kbTosca",
    {} as NonNullable<BackendState["kbTosca"]>
);
export const setKbTosca = createBackendSetter(
    "kbTosca",
    app_actions.backend.setKbTosca,
    {} as NonNullable<BackendState["kbTosca"]>
);

export const getPreAuthFromStore = createBackendGetter(
    "preAuth",
    {} as NonNullable<BackendState["preAuth"]>
);
export const setPreAuth = createBackendSetter(
    "preAuth",
    app_actions.backend.setPreAuth,
    {} as NonNullable<BackendState["preAuth"]>
);

export const getKbOwaspRegisterFromStore = createBackendGetter(
    "kbOwaspRegister",
    {} as NonNullable<BackendState["kbOwaspRegister"]>
);
export const setKbOwaspRegister = createBackendSetter(
    "kbOwaspRegister",
    app_actions.backend.setKbOwaspRegister,
    {} as NonNullable<BackendState["kbOwaspRegister"]>
);

export const getMasterDiagramTemplatesFromStore = createBackendGetter(
    "masterDiagramTemplates",
    [] as NonNullable<BackendState["masterDiagramTemplates"]>
);
export const setMasterDiagramTemplates = createBackendSetter(
    "masterDiagramTemplates",
    app_actions.backend.setMasterDiagramTemplates,
    [] as NonNullable<BackendState["masterDiagramTemplates"]>
);

export const getMasterMitigationFromStore = createBackendGetter(
    "masterMitigation",
    {} as NonNullable<BackendState["masterMitigation"]>
);
export const setMasterMitigation = createBackendSetter(
    "masterMitigation",
    app_actions.backend.setMasterMitigation,
    {} as NonNullable<BackendState["masterMitigation"]>
);

export const getMasterMitigationLogsFromStore = createBackendGetter(
    "masterMitigationLogs",
    [] as NonNullable<BackendState["masterMitigationLogs"]>
);
export const setMasterMitigationLogs = createBackendSetter(
    "masterMitigationLogs",
    app_actions.backend.setMasterMitigationLogs,
    [] as NonNullable<BackendState["masterMitigationLogs"]>
);

export const getMasterMitigationMeasureLogsFromStore = createBackendGetter(
    "masterMitigationMeasureLogs",
    [] as NonNullable<BackendState["masterMitigationMeasureLogs"]>
);
export const setMasterMitigationMeasureLogs = createBackendSetter(
    "masterMitigationMeasureLogs",
    app_actions.backend.setMasterMitigationMeasureLogs,
    [] as NonNullable<BackendState["masterMitigationMeasureLogs"]>
);

export const getMasterRegisterFromStore = createBackendGetter(
    "masterRegister",
    {} as NonNullable<BackendState["masterRegister"]>
);
export const setMasterRegister = createBackendSetter(
    "masterRegister",
    app_actions.backend.setMasterRegister,
    {} as NonNullable<BackendState["masterRegister"]>
);

export const getMasterRegisterLogsFromStore = createBackendGetter(
    "masterRegisterLogs",
    [] as NonNullable<BackendState["masterRegisterLogs"]>
);
export const setMasterRegisterLogs = createBackendSetter(
    "masterRegisterLogs",
    app_actions.backend.setMasterRegisterLogs,
    [] as NonNullable<BackendState["masterRegisterLogs"]>
);

export const getModuleFilesFromStore = createProjectGetter(
    "projectDiagramFileModule",
    [] as NonNullable<ProjectScopedState["projectDiagramFileModule"]>
);
export const setProjectDiagramFileModule = createProjectSetter(
    "projectDiagramFileModule",
    app_actions.backend.setProjectDiagramFileModule,
    [] as NonNullable<ProjectScopedState["projectDiagramFileModule"]>
);

export const getProjectFromStore = createProjectGetter(
    "project",
    {} as NonNullable<ProjectScopedState["project"]>
);
export const getProjectIdFromStore = () =>
    `${getRouteProjectIdFromWindow() || getProjectFromStore()?.project_id || ""}`;
export const setProject = createProjectSetter(
    "project",
    app_actions.backend.setProject,
    {} as NonNullable<ProjectScopedState["project"]>
);

export const getProjectCactiFromStore = createProjectGetter(
    "projectDiagramFileCacti",
    {} as NonNullable<ProjectScopedState["projectDiagramFileCacti"]>
);
export const setProjectDiagramFileCacti = createProjectSetter(
    "projectDiagramFileCacti",
    app_actions.backend.setProjectDiagramFileCacti,
    {} as NonNullable<ProjectScopedState["projectDiagramFileCacti"]>
);

export const getProjectDiagramFromStore = createProjectGetter(
    "projectDiagram",
    {} as NonNullable<ProjectScopedState["projectDiagram"]>
);
export const setProjectDiagram = createProjectSetter(
    "projectDiagram",
    app_actions.backend.setProjectDiagram,
    {} as NonNullable<ProjectScopedState["projectDiagram"]>
);

export const getProjectDiagramLogsFromStore = createProjectGetter(
    "projectDiagramLogs",
    [] as NonNullable<ProjectScopedState["projectDiagramLogs"]>
);
export const setProjectDiagramLogs = createProjectSetter(
    "projectDiagramLogs",
    app_actions.backend.setProjectDiagramLogs,
    [] as NonNullable<ProjectScopedState["projectDiagramLogs"]>
);

export const getProjectDiagramFileJsonFromStore = createProjectGetter(
    "projectDiagramFileJson",
    {} as NonNullable<ProjectScopedState["projectDiagramFileJson"]>
);
export const setProjectDiagramFileJson = createProjectSetter(
    "projectDiagramFileJson",
    app_actions.backend.setProjectDiagramFileJson,
    {} as NonNullable<ProjectScopedState["projectDiagramFileJson"]>
);
export const getProjectDiagramImageFilesFromStore = createProjectGetter(
    "projectDiagramFileImage",
    {} as NonNullable<ProjectScopedState["projectDiagramFileImage"]>
);
export const setProjectDiagramFileImage = createProjectSetter(
    "projectDiagramFileImage",
    app_actions.backend.setProjectDiagramFileImage,
    {} as NonNullable<ProjectScopedState["projectDiagramFileImage"]>
);

export const getProjectXMLFromStore = createProjectGetter(
    "projectDiagramFileXml",
    {} as NonNullable<ProjectScopedState["projectDiagramFileXml"]>
);
export const setProjectDiagramFileXml = createProjectSetter(
    "projectDiagramFileXml",
    app_actions.backend.setProjectDiagramFileXml,
    {} as NonNullable<ProjectScopedState["projectDiagramFileXml"]>
);

export const getProjectDiagramFilePdfFromStore = createProjectGetter(
    "projectDiagramFilePdf",
    {} as NonNullable<ProjectScopedState["projectDiagramFilePdf"]>
);
export const setProjectDiagramFilePdf = createProjectSetter(
    "projectDiagramFilePdf",
    app_actions.backend.setProjectDiagramFilePdf,
    {} as NonNullable<ProjectScopedState["projectDiagramFilePdf"]>
);

export const getProjectRegisterFromStore = createProjectGetter(
    "projectRegister",
    {} as NonNullable<ProjectScopedState["projectRegister"]>
);
export const setProjectRegister = createProjectSetter(
    "projectRegister",
    app_actions.backend.setProjectRegister,
    {} as NonNullable<ProjectScopedState["projectRegister"]>
);

export const getProjectAssessmentFromStore = createProjectGetter(
    "projectAssessment",
    {} as NonNullable<ProjectScopedState["projectAssessment"]>
);
export const setProjectAssessment = createProjectSetter(
    "projectAssessment",
    app_actions.backend.setProjectAssessment,
    {} as NonNullable<ProjectScopedState["projectAssessment"]>
);

export const getProjectLogsFromStore = createProjectGetter(
    "projectLogs",
    [] as NonNullable<ProjectScopedState["projectLogs"]>
);
export const setProjectLogs = createProjectSetter(
    "projectLogs",
    app_actions.backend.setProjectLogs,
    [] as NonNullable<ProjectScopedState["projectLogs"]>
);

export const getProjectsFromStore = createBackendGetter(
    "projects",
    [] as NonNullable<BackendState["projects"]>
);
export const setProjects = createBackendSetter(
    "projects",
    app_actions.backend.setProjects,
    [] as NonNullable<BackendState["projects"]>
);

export const getResourceTagsFromStore = createBackendGetter(
    "resourceTags",
    [] as NonNullable<BackendState["resourceTags"]>
);
export const setResourceTags = createBackendSetter(
    "resourceTags",
    app_actions.backend.setResourceTags,
    [] as NonNullable<BackendState["resourceTags"]>
);

export const getTerraformFilesFromStore = createProjectGetter(
    "projectDiagramFileTerraform",
    [] as NonNullable<ProjectScopedState["projectDiagramFileTerraform"]>
);
export const setProjectDiagramFileTerraform = createProjectSetter(
    "projectDiagramFileTerraform",
    app_actions.backend.setProjectDiagramFileTerraform,
    [] as NonNullable<ProjectScopedState["projectDiagramFileTerraform"]>
);

export const getUserFromStore = createBackendGetter(
    "user",
    {} as NonNullable<BackendState["user"]>
);
export const setUser = createBackendSetter(
    "user",
    app_actions.backend.setUser,
    {} as NonNullable<BackendState["user"]>
);

export const getUserCreditsFromStore = createBackendGetter(
    "userCredits",
    {} as NonNullable<BackendState["userCredits"]>
);
export const setUserCredits = createBackendSetter(
    "userCredits",
    app_actions.backend.setUserCredits,
    {} as NonNullable<BackendState["userCredits"]>
);
export const getUserCreditsLoadedFromStore = createBackendGetter(
    "userCreditsLoaded",
    false //
);

export const getUserPolicyOptionsFromStore = createBackendGetter(
    "userPolicyOptions",
    [] as NonNullable<BackendState["userPolicyOptions"]>
);
export const setUserPolicyOptions = createBackendSetter(
    "userPolicyOptions",
    app_actions.backend.setUserPolicyOptions,
    [] as NonNullable<BackendState["userPolicyOptions"]>
);

export const getUserRoleOptionsFromStore = createBackendGetter(
    "userRoleOptions",
    [] as NonNullable<BackendState["userRoleOptions"]>
);
export const setUserRoleOptions = createBackendSetter(
    "userRoleOptions",
    app_actions.backend.setUserRoleOptions,
    [] as NonNullable<BackendState["userRoleOptions"]>
);

export const getUsersLoadedFromStore = createBackendGetter(
    "usersLoaded",
    false //
);
export const getAttackFlowsGroupingsLoadedFromStore = createBackendGetter(
    "attackFlowsGroupingsLoaded",
    false
);
export const getAuthorizationLoadedFromStore = createBackendGetter(
    "authorizationLoaded",
    false //
);
export const getKbOwaspRegisterLoadedFromStore = createBackendGetter(
    "kbOwaspRegisterLoaded",
    false
);
export const getKbToscaLoadedFromStore = createBackendGetter(
    "kbToscaLoaded",
    false //
);
export const getMasterDiagramTemplatesLoadedFromStore = createBackendGetter(
    "masterDiagramTemplatesLoaded",
    false
);
export const getMasterMitigationLoadedFromStore = createBackendGetter(
    "masterMitigationLoaded",
    false
);
export const getMasterMitigationLogsLoadedFromStore = createBackendGetter(
    "masterMitigationLogsLoaded",
    false
);
export const getMasterMitigationMeasureLogsLoadedFromStore = createBackendGetter(
    "masterMitigationMeasureLogsLoaded",
    false
);
export const getMasterRegisterLoadedFromStore = createBackendGetter(
    "masterRegisterLoaded",
    false //
);
export const getMasterRegisterLogsLoadedFromStore = createBackendGetter(
    "masterRegisterLogsLoaded",
    false
);
export const getModuleFilesLoadedFromStore = createProjectGetter(
    "projectDiagramFileModuleLoaded",
    false //
);
export const getPreAuthLoadedFromStore = createBackendGetter(
    "preAuthLoaded",
    false //
);
export const getProjectCactiLoadedFromStore = createProjectGetter(
    "projectDiagramFileCactiLoaded",
    false //
);
export const getProjectDiagramFileJsonLoadedFromStore = createProjectGetter(
    "projectDiagramFileJsonLoaded",
    false
);
export const getProjectDiagramFilePdfLoadedFromStore = createProjectGetter(
    "projectDiagramFilePdfLoaded",
    false
);
export const getProjectDiagramImageFilesLoadedFromStore = createProjectGetter(
    "projectDiagramFileImageLoaded",
    false
);
export const getProjectDiagramLoadedFromStore = createProjectGetter(
    "projectDiagramLoaded",
    false //
);
export const getProjectDiagramLogsLoadedFromStore = createProjectGetter(
    "projectDiagramLogsLoaded",
    false
);
export const getProjectLoadedFromStore = createProjectGetter(
    "projectLoaded",
    false //
);
export const getProjectLogsLoadedFromStore = createProjectGetter(
    "projectLogsLoaded",
    false //
);
export const getProjectAssessmentLoadedFromStore = createProjectGetter(
    "projectAssessmentLoaded",
    false
);
export const getProjectRegisterLoadedFromStore = createProjectGetter(
    "projectRegisterLoaded",
    false
);
export const getProjectsLoadedFromStore = createBackendGetter(
    "projectsLoaded",
    false //
);
export const getProjectXMLLoadedFromStore = createProjectGetter(
    "projectDiagramFileXmlLoaded",
    false //
);
export const getResourceTagsLoadedFromStore = createBackendGetter(
    "resourceTagsLoaded",
    false //
);
export const getTerraformFilesLoadedFromStore = createProjectGetter(
    "projectDiagramFileTerraformLoaded",
    false //
);
export const getUserLoadedFromStore = createBackendGetter(
    "userLoaded",
    false //
);
export const getUserPolicyOptionsLoadedFromStore = createBackendGetter(
    "userPolicyOptionsLoaded",
    false //
);
export const getUserRoleOptionsLoadedFromStore = createBackendGetter(
    "userRoleOptionsLoaded",
    false //
);
