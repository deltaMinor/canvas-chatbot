import { createSelector } from "@reduxjs/toolkit";

import {
    getProjectStateFromBackendState,
    getRouteProjectIdFromWindow,
} from "#root/redux/backendSlice";
import { RootState } from "#root/redux/store";
import { ProjectDiagramAuthorization } from "#root/services/authorization/ProjectDiagramAuthorization";
import {
    KbToscaLoader,
    MasterDiagramTemplatesLoader,
    ProjectCactiLoader,
    ProjectDiagramFileJsonLoader,
    ProjectDiagramFilePdfLoader,
    ProjectDiagramImageFilesLoader,
    ProjectDiagramLoader,
    ProjectDiagramLogsLoader,
    ProjectLoader,
    ProjectLogsLoader,
    ProjectModuleFileLoader,
    ProjectTerraformFileLoader,
    ProjectXMLLoader,
    ProjectsLoader,
} from "#root/services/loader";

// ==============================
// Root Selectors
// ==============================

export const selectBackendState = (
    state: RootState //
) => state.backend;

export const selectBackendProjectState = (
    state: RootState //
) => getProjectStateFromBackendState(selectBackendState(state), getRouteProjectIdFromWindow());

export const selectBackendProjectId = (
    state: RootState //
) => {
    const routeProjectId = getRouteProjectIdFromWindow();
    if (routeProjectId) {
        return routeProjectId;
    }

    const project = selectBackendProjectState(state).project;
    return `${project?.["project_id"] ?? ""}`;
};
export const selectBackendProjectDiagram = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagram;
export const selectBackendProject = (
    state: RootState //
) => selectBackendProjectState(state).project;
export const selectBackendIntegration = (
    state: RootState //
) => selectBackendState(state).integration;
export const selectBackendIntegrationLoaded = (
    state: RootState //
) => selectBackendState(state).integrationLoaded;
export const selectBackendIntegrationLoadError = (
    state: RootState //
) => selectBackendState(state).integrationLoadError;
export const selectBackendJiraIssueOptions = (
    state: RootState //
) => selectBackendState(state).jiraIssueOptions;
export const selectBackendJiraIssueOptionsLoaded = (
    state: RootState //
) => selectBackendState(state).jiraIssueOptionsLoaded;
export const selectBackendJiraIssueOptionsLoadError = (
    state: RootState //
) => selectBackendState(state).jiraIssueOptionsLoadError;
export const selectBackendProjectDiagramIsAuthorized = (
    state: RootState //
) => {
    const authorization = selectBackendState(state).authorization;
    if (!authorization) return { create: null, read: null, update: null, delete: null };
    return new ProjectDiagramAuthorization().isAuthorized;
};
export const selectBackendProjectDiagramLoaded = (
    state: RootState //
) => !!selectBackendProjectState(state).projectDiagramLoaded;
export const selectBackendProjectDiagramLoadError = (
    state: RootState //
) => !!selectBackendProjectState(state).projectDiagramLoadError;
export const selectBackendProjectCactiLoaded = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileCactiLoaded;
export const selectBackendProjectCactiLoadError = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileCactiLoadError;
export const selectBackendProjectCacti = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileCacti;
export const selectBackendProjectStatisticsLoaded = (
    state: RootState //
) => !!selectBackendProjectState(state).projectStatisticsLoaded;
export const selectBackendProjectStatisticsLoadError = (
    state: RootState //
) => !!selectBackendProjectState(state).projectStatisticsLoadError;
export const selectBackendProjectStatistics = (
    state: RootState //
) => selectBackendProjectState(state).projectStatistics;
export const selectBackendTerraformFilesLoaded = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileTerraformLoaded;
export const selectBackendTerraformFilesLoadError = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileTerraformLoadError;
export const selectBackendTerraformFiles = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileTerraform;
export const selectBackendModuleFilesLoaded = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileModuleLoaded;
export const selectBackendModuleFilesLoadError = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileModuleLoadError;
export const selectBackendModuleFiles = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileModule;
export const selectBackendProjectDiagramFileJsonLoaded = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileJsonLoaded;
export const selectBackendProjectDiagramFileJsonLoadError = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileJsonLoadError;
export const selectBackendProjectDiagramFileJson = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileJson;
export const selectBackendProjectDiagramImageFilesLoaded = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileImageLoaded;
export const selectBackendProjectDiagramImageFilesLoadError = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileImageLoadError;
export const selectBackendProjectDiagramImageFiles = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileImage;
export const selectBackendProjectXMLLoaded = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileXmlLoaded;
export const selectBackendProjectXMLLoadError = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileXmlLoadError;
export const selectBackendProjectXML = (
    state: RootState //
) => selectBackendProjectState(state).projectDiagramFileXml;
export const selectBackendMasterDiagramTemplatesLoaded = (
    state: RootState //
) => selectBackendState(state).masterDiagramTemplatesLoaded;
export const selectBackendMasterDiagramTemplatesLoadError = (
    state: RootState //
) => selectBackendState(state).masterDiagramTemplatesLoadError;
export const selectBackendMasterDiagramTemplates = (
    state: RootState //
) => selectBackendState(state).masterDiagramTemplates;
export const selectBackendProjectRegister = (
    state: RootState //
) => selectBackendProjectState(state).projectRegister;
export const selectBackendProjectRegisterLoaded = (
    state: RootState //
) => selectBackendProjectState(state).projectRegisterLoaded;
export const selectBackendProjectRegisterLoadError = (
    state: RootState //
) => selectBackendProjectState(state).projectRegisterLoadError;
export const selectBackendProjectRegisterLastAssessedOn = (
    state: RootState //
) => selectBackendProjectState(state).projectRegister?.assessment?.benchmark["finished_at"];
export const selectBackendProjectAssessmentHistory = (
    state: RootState //
) => selectBackendProjectState(state).projectAssessmentHistory;
export const selectBackendProjectAssessment = (
    state: RootState //
) => selectBackendProjectState(state).projectAssessment;
export const selectBackendProjectAssessmentLoaded = (
    state: RootState //
) => selectBackendProjectState(state).projectAssessmentLoaded;
export const selectBackendProjectAssessmentLoadError = (
    state: RootState //
) => selectBackendProjectState(state).projectAssessmentLoadError;
export const selectBackendKbTosca = (
    state: RootState //
) => selectBackendState(state).kbTosca;
export const selectBackendKbToscaLoaded = (
    state: RootState //
) => selectBackendState(state).kbToscaLoaded;
export const selectBackendKbToscaLoadError = (
    state: RootState //
) => selectBackendState(state).kbToscaLoadError;
export const selectBackendUserPolicyOptions = (
    state: RootState //
) => selectBackendState(state).userPolicyOptions;
export const selectBackendUserPolicyOptionsLoaded = (
    state: RootState //
) => selectBackendState(state).userPolicyOptionsLoaded;
export const selectBackendUserPolicyOptionsLoadError = (
    state: RootState //
) => selectBackendState(state).userPolicyOptionsLoadError;
export const selectBackendUserRoleOptions = (
    state: RootState //
) => selectBackendState(state).userRoleOptions;
export const selectBackendUserRoleOptionsLoaded = (
    state: RootState //
) => selectBackendState(state).userRoleOptionsLoaded;
export const selectBackendUserRoleOptionsLoadError = (
    state: RootState //
) => selectBackendState(state).userRoleOptionsLoadError;
export const selectBackendAppVersions = (
    state: RootState //
) => selectBackendState(state).appVersions;
export const selectBackendAppVersionsLoaded = (
    state: RootState //
) => selectBackendState(state).appVersionsLoaded;
export const selectBackendAppVersionData = (
    state: RootState //
) => selectBackendState(state).appVersionData;
export const selectBackendPreAuth = (
    state: RootState //
) => selectBackendState(state).preAuth;
// const selectBackendAuthorization = (
//     state: RootState //
// ) => selectBackendState(state).authorization;

// ==============================
// Derived Selectors
// ==============================

export const selectMasterDiagramTemplatesLoader = createSelector(
    [],
    () => new MasterDiagramTemplatesLoader()
);

export const selectProjectsLoader = createSelector([], () => new ProjectsLoader());

export const selectKbToscaLoader = createSelector([], () => new KbToscaLoader());

export const selectProjectCactiLoader = createSelector(
    [selectBackendProjectId],
    (projectId) => new ProjectCactiLoader(projectId)
);

export const selectProjectDiagramFileJsonLoader = createSelector(
    [selectBackendProjectId],
    (projectId) => new ProjectDiagramFileJsonLoader(projectId)
);

export const selectProjectDiagramFilePdfLoader = createSelector(
    [selectBackendProjectId],
    (projectId) => new ProjectDiagramFilePdfLoader(projectId)
);

export const selectProjectDiagramImageFilesLoader = createSelector(
    [selectBackendProjectId],
    (projectId) => new ProjectDiagramImageFilesLoader(projectId)
);

export const selectProjectLoader = createSelector(
    [selectBackendProjectId],
    (projectId) => new ProjectLoader(projectId)
);

export const selectProjectDiagramLoader = createSelector(
    [selectBackendProjectId],
    (projectId) => new ProjectDiagramLoader(projectId)
);

export const selectProjectDiagramLogsLoader = createSelector(
    [selectBackendProjectId],
    (projectId) => new ProjectDiagramLogsLoader(projectId)
);

export const selectProjectXMLLoader = createSelector(
    [selectBackendProjectId],
    (projectId) => new ProjectXMLLoader(projectId)
);

export const selectProjectLogsLoader = createSelector(
    [selectBackendProjectId],
    (projectId) => new ProjectLogsLoader(projectId)
);

export const selectProjectModuleFileLoader = createSelector(
    [selectBackendProjectId],
    (projectId) => new ProjectModuleFileLoader(projectId)
);

export const selectProjectTerraformFileLoader = createSelector(
    [selectBackendProjectId],
    (projectId) => new ProjectTerraformFileLoader(projectId)
);
