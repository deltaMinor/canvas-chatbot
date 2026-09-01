import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { UserAuthorization } from "#root/interfaces/authorization";
import type {
    BackendState,
    LegacyBackendState,
    ProjectScopedState,
    ProjectStateKey,
} from "#root/interfaces/redux";
import type { BackendReducerMap, NonProjectStateKey } from "#root/interfaces/reduxPayload";

export type {
    BackendState,
    LegacyBackendState,
    ProjectScopedState,
    ProjectStateKey,
} from "#root/interfaces/redux";

const PROJECT_STATE_KEYS = [
    "project",
    "projectLoaded",
    "projectLoadError",
    "projectAssessment",
    "projectAssessmentLoaded",
    "projectAssessmentLoadError",
    "projectDiagram",
    "projectDiagramLoaded",
    "projectDiagramLoadError",
    "projectDiagramFileCacti",
    "projectDiagramFileCactiLoaded",
    "projectDiagramFileCactiLoadError",
    "projectDiagramFileImage",
    "projectDiagramFileImageLoaded",
    "projectDiagramFileImageLoadError",
    "projectDiagramFileJson",
    "projectDiagramFileJsonLoaded",
    "projectDiagramFileJsonLoadError",
    "projectDiagramFileModule",
    "projectDiagramFileModuleLoaded",
    "projectDiagramFileModuleLoadError",
    "projectDiagramFilePdf",
    "projectDiagramFilePdfLoaded",
    "projectDiagramFilePdfLoadError",
    "projectDiagramFileGeneratedJson",
    "projectDiagramFileGeneratedJsonLoaded",
    "projectDiagramFileGeneratedJsonLoadError",
    "projectDiagramFileTerraform",
    "projectDiagramFileTerraformLoaded",
    "projectDiagramFileTerraformLoadError",
    "projectDiagramFileXml",
    "projectDiagramFileXmlLoaded",
    "projectDiagramFileXmlLoadError",
    "projectDiagramLogs",
    "projectDiagramLogsLoaded",
    "projectDiagramLogsLoadError",
    "projectRegister",
    "projectRegisterLoaded",
    "projectRegisterLoadError",
    "projectAssessmentHistory",
    "projectAssessmentHistoryLoaded",
    "projectAssessmentHistoryLoadError",
    "projectLogs",
    "projectLogsLoaded",
    "projectLogsLoadError",
    "projectStatistics",
    "projectStatisticsLoaded",
    "projectStatisticsLoadError",
] as const;

const legacyInitialState: LegacyBackendState = {
    appTNC: null,
    appTNCLoaded: false,
    appTNCLoadError: false,
    appVersionData: null,
    appVersionDataLoaded: false,
    appVersionDataLoadError: false,
    appVersions: [],
    appVersionsLoaded: false,
    appVersionsLoadError: false,
    authorization: {} as UserAuthorization,
    authorizationLoaded: false,
    authorizationLoadError: false,
    feedbackForms: [],
    feedbackFormsLoaded: false,
    feedbackFormsLoadError: false,
    integration: null,
    integrationLoaded: false,
    integrationLoadError: false,
    jiraIssue: null,
    jiraIssueLoaded: false,
    jiraIssueLoadError: false,
    jiraIssueOptions: null,
    jiraIssueOptionsLoaded: false,
    jiraIssueOptionsLoadError: false,
    kbOwaspRegister: null,
    kbOwaspRegisterLoaded: false,
    kbOwaspRegisterLoadError: false,
    kbTosca: null,
    kbToscaLoaded: false,
    kbToscaLoadError: false,
    masterDiagramTemplates: [],
    masterDiagramTemplatesLoaded: false,
    masterDiagramTemplatesLoadError: false,
    masterMitigation: null,
    masterMitigationLoaded: false,
    masterMitigationLoadError: false,
    masterMitigationLogs: [],
    masterMitigationLogsLoaded: false,
    masterMitigationLogsLoadError: false,
    masterMitigationMeasureLogs: [],
    masterMitigationMeasureLogsLoaded: false,
    masterMitigationMeasureLogsLoadError: false,
    masterRegister: null,
    masterRegisterLoaded: false,
    masterRegisterLoadError: false,
    masterRegisterLogs: [],
    masterRegisterLogsLoaded: false,
    masterRegisterLogsLoadError: false,
    preAuth: null,
    preAuthLoaded: false,
    preAuthLoadError: false,
    project: null,
    projectLoaded: false,
    projectLoadError: false,
    projectAssessment: null,
    projectAssessmentLoaded: false,
    projectAssessmentLoadError: false,
    projectAssessmentHistory: null,
    projectAssessmentHistoryLoaded: false,
    projectAssessmentHistoryLoadError: false,
    projectDiagram: null,
    projectDiagramLoaded: false,
    projectDiagramLoadError: false,
    projectDiagramFileCacti: null,
    projectDiagramFileCactiLoaded: false,
    projectDiagramFileCactiLoadError: false,
    projectDiagramFileImage: null,
    projectDiagramFileImageLoaded: false,
    projectDiagramFileImageLoadError: false,
    projectDiagramFileJson: null,
    projectDiagramFileJsonLoaded: false,
    projectDiagramFileJsonLoadError: false,
    projectDiagramFileModule: [],
    projectDiagramFileModuleLoaded: false,
    projectDiagramFileModuleLoadError: false,
    projectDiagramFilePdf: null,
    projectDiagramFilePdfLoaded: false,
    projectDiagramFilePdfLoadError: false,
    projectDiagramFileGeneratedJson: null,
    projectDiagramFileGeneratedJsonLoaded: false,
    projectDiagramFileGeneratedJsonLoadError: false,
    projectDiagramFileTerraform: [],
    projectDiagramFileTerraformLoaded: false,
    projectDiagramFileTerraformLoadError: false,
    projectDiagramFileXml: null,
    projectDiagramFileXmlLoaded: false,
    projectDiagramFileXmlLoadError: false,
    projectDiagramLogs: [],
    projectDiagramLogsLoaded: false,
    projectDiagramLogsLoadError: false,
    projectLogs: [],
    projectLogsLoaded: false,
    projectLogsLoadError: false,
    projectRegister: null,
    projectRegisterLoaded: false,
    projectRegisterLoadError: false,
    projects: [],
    projectsLoaded: false,
    projectsLoadError: false,
    projectStatistics: null,
    projectStatisticsLoaded: false,
    projectStatisticsLoadError: false,
    resourceTags: [],
    resourceTagsLoaded: false,
    resourceTagsLoadError: false,
    user: null,
    userLoaded: false,
    userLoadError: false,
    userCredits: null,
    userCreditsLoaded: false,
    userCreditsLoadError: false,
    userPolicyOptions: [],
    userPolicyOptionsLoaded: false,
    userPolicyOptionsLoadError: false,
    userRoleOptions: [],
    userRoleOptionsLoaded: false,
    userRoleOptionsLoadError: false,
    users: [],
    usersLoaded: false,
    usersLoadError: false,
};

const NON_PROJECT_STATE_KEYS = (
    Object.keys(legacyInitialState) as (keyof LegacyBackendState)[]
).filter((key): key is NonProjectStateKey => !PROJECT_STATE_KEYS.includes(key as ProjectStateKey));

const createInitialProjectState = (): ProjectScopedState => {
    const projectState = {} as ProjectScopedState;

    PROJECT_STATE_KEYS.forEach((key) => {
        (projectState as any)[key] = legacyInitialState[key];
    });

    return projectState;
};

export const defaultProjectState = createInitialProjectState();

export const getRouteProjectIdFromWindow = () => {
    if (typeof window === "undefined") {
        return "";
    }

    return new URLSearchParams(window.location.search).get("project_id") ?? "";
};

const initialState: BackendState = NON_PROJECT_STATE_KEYS.reduce(
    (acc, key) => {
        (acc as any)[key] = legacyInitialState[key];
        return acc;
    },
    {
        projectStates: {},
    } as BackendState
);

const updateBackendStateIfChanged = <K extends keyof BackendState>(
    state: BackendState,
    key: K,
    payload: BackendState[K]
) => {
    if (JSON.stringify(state[key]) === JSON.stringify(payload)) {
        return;
    }

    state[key] = payload;
};

const ensureProjectState = (state: BackendState, projectId: string) => {
    const normalizedProjectId = projectId || "";

    if (!state.projectStates[normalizedProjectId]) {
        state.projectStates[normalizedProjectId] = createInitialProjectState();
    }

    return state.projectStates[normalizedProjectId];
};

const updateProjectStateIfChanged = <K extends ProjectStateKey>(
    state: BackendState,
    projectId: string,
    key: K,
    payload: ProjectScopedState[K]
) => {
    const projectState = ensureProjectState(state, projectId);

    if (JSON.stringify(projectState[key]) === JSON.stringify(payload)) {
        return;
    }

    projectState[key] = payload;
};

export const getProjectStateFromBackendState = (
    backendState: BackendState,
    projectId?: string | null
) => {
    const normalizedProjectId = projectId ?? "";
    return backendState.projectStates[normalizedProjectId] ?? defaultProjectState;
};

const capitalizeKey = (key: string) => `${key.charAt(0).toUpperCase()}${key.slice(1)}`;

const reducers = {} as BackendReducerMap;

NON_PROJECT_STATE_KEYS.forEach((key) => {
    (reducers as any)[`set${capitalizeKey(key)}`] = (
        state: BackendState,
        action: PayloadAction<BackendState[typeof key]>
    ) => {
        updateBackendStateIfChanged(state, key, action.payload);
    };
});

PROJECT_STATE_KEYS.forEach((key) => {
    (reducers as any)[`set${capitalizeKey(key)}`] = {
        reducer: (
            state: BackendState,
            action: PayloadAction<{ projectId: string; value: ProjectScopedState[typeof key] }>
        ) => {
            updateProjectStateIfChanged(state, action.payload.projectId, key, action.payload.value);
        },
        prepare: (
            value: ProjectScopedState[typeof key],
            projectId = getRouteProjectIdFromWindow()
        ) => {
            return {
                payload: {
                    projectId,
                    value,
                },
            };
        },
    };
});

const backendSlice = createSlice({
    name: "backend",
    initialState,
    reducers,
});

export default backendSlice;
