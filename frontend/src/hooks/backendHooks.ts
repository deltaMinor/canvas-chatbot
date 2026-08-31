import React from "react";
import { useLocation } from "react-router-dom";

import { useRootSelector } from "#root/hooks/useRootSelector";
import {
    BackendState,
    ProjectScopedState,
    getProjectStateFromBackendState,
} from "#root/redux/backendSlice";
import { type RootState } from "#root/redux/store";
import { createStateHook } from "#root/utils/stateHookUtil";

type BackendStateKey = keyof BackendState;
type ProjectStateKey = keyof ProjectScopedState;
const selectBackendState = (state: RootState) => state.backend;
export const useBackendState = () => useRootSelector(selectBackendState);
const createBackendStateHook = <K extends BackendStateKey>(
    key: K
): (() => NonNullable<BackendState[K]>) => {
    const useBackendStateValue = createStateHook<RootState, BackendState, K>(
        selectBackendState,
        key
    );

    return () => {
        const value = useBackendStateValue();

        return React.useMemo(
            () => (value ?? ({} as NonNullable<BackendState[K]>)) as NonNullable<BackendState[K]>,
            [value]
        );
    };
};

const createProjectStateHook = <K extends ProjectStateKey>(
    key: K
): (() => NonNullable<ProjectScopedState[K]>) => {
    return () => {
        const location = useLocation();
        const projectId = React.useMemo(
            () => new URLSearchParams(location.search).get("project_id") ?? "",
            [location.search]
        );
        const value = useRootSelector((state: RootState) => {
            return getProjectStateFromBackendState(state.backend, projectId)[key];
        });

        return React.useMemo(
            () =>
                (value ?? ({} as NonNullable<ProjectScopedState[K]>)) as NonNullable<
                    ProjectScopedState[K]
                >,
            [value]
        );
    };
};

// Selector hooks
export const useAuthorization = createBackendStateHook(
    "authorization" //
);
export const useAuthorizationLoaded = createBackendStateHook(
    "authorizationLoaded" //
);
export const useAuthorizationLoadError = createBackendStateHook(
    "authorizationLoadError" //
);
export const useProjects = createBackendStateHook(
    "projects" //
);
export const useProjectsLoaded = createBackendStateHook(
    "projectsLoaded" //
);
export const useProjectsLoadError = createBackendStateHook(
    "projectsLoadError" //
);
export const useResourceTags = createBackendStateHook(
    "resourceTags" //
);
export const useResourceTagsLoaded = createBackendStateHook(
    "resourceTagsLoaded" //
);
export const useResourceTagsLoadError = createBackendStateHook(
    "resourceTagsLoadError" //
);
export const useUsers = createBackendStateHook(
    "users" //
);
export const useUsersLoaded = createBackendStateHook(
    "usersLoaded" //
);
export const useUsersLoadError = createBackendStateHook(
    "usersLoadError" //
);
export const useKbTosca = createBackendStateHook(
    "kbTosca" //
);
export const useKbToscaLoaded = createBackendStateHook(
    "kbToscaLoaded" //
);
export const useKbToscaLoadError = createBackendStateHook(
    "kbToscaLoadError" //
);
export const usePreAuth = createBackendStateHook(
    "preAuth" //
);
export const usePreAuthLoaded = createBackendStateHook(
    "preAuthLoaded" //
);
export const usePreAuthLoadError = createBackendStateHook(
    "preAuthLoadError" //
);
export const useKbOwaspRegister = createBackendStateHook(
    "kbOwaspRegister" //
);
export const useKbOwaspRegisterLoaded = createBackendStateHook(
    "kbOwaspRegisterLoaded" //
);
export const useKbOwaspRegisterLoadError = createBackendStateHook(
    "kbOwaspRegisterLoadError" //
);
export const useMasterCQ = createBackendStateHook(
    "masterCQ" //
);
export const useMasterCQLoaded = createBackendStateHook(
    "masterCQLoaded" //
);
export const useMasterCQLoadError = createBackendStateHook(
    "masterCQLoadError" //
);
export const useMasterCQTemplate = createBackendStateHook(
    "masterCQTemplate" //
);
export const useMasterCQTemplateLoaded = createBackendStateHook(
    "masterCQTemplateLoaded" //
);
export const useMasterCQTemplateLoadError = createBackendStateHook(
    "masterCQTemplateLoadError" //
);
export const useMasterDiagramTemplates = createBackendStateHook(
    "masterDiagramTemplates" //
);
export const useMasterDiagramTemplatesLoaded = createBackendStateHook(
    "masterDiagramTemplatesLoaded" //
);
export const useMasterDiagramTemplatesLoadError = createBackendStateHook(
    "masterDiagramTemplatesLoadError" //
);
export const useMasterMitigation = createBackendStateHook(
    "masterMitigation" //
);
export const useMasterMitigationLoaded = createBackendStateHook(
    "masterMitigationLoaded" //
);
export const useMasterMitigationLoadError = createBackendStateHook(
    "masterMitigationLoadError" //
);
export const useMasterMitigationLogs = createBackendStateHook(
    "masterMitigationLogs" //
);
export const useMasterMitigationLogsLoaded = createBackendStateHook(
    "masterMitigationLogsLoaded" //
);
export const useMasterMitigationLogsLoadError = createBackendStateHook(
    "masterMitigationLogsLoadError" //
);
export const useMasterMitigationMeasureLogs = createBackendStateHook(
    "masterMitigationMeasureLogs" //
);
export const useMasterMitigationMeasureLogsLoaded = createBackendStateHook(
    "masterMitigationMeasureLogsLoaded" //
);
export const useMasterMitigationMeasureLogsLoadError = createBackendStateHook(
    "masterMitigationMeasureLogsLoadError" //
);
export const useMasterRegister = createBackendStateHook(
    "masterRegister" //
);
export const useMasterRegisterLoaded = createBackendStateHook(
    "masterRegisterLoaded" //
);
export const useMasterRegisterLoadError = createBackendStateHook(
    "masterRegisterLoadError" //
);
export const useMasterRegisterLogs = createBackendStateHook(
    "masterRegisterLogs" //
);
export const useMasterRegisterLogsLoaded = createBackendStateHook(
    "masterRegisterLogsLoaded" //
);
export const useMasterRegisterLogsLoadError = createBackendStateHook(
    "masterRegisterLogsLoadError" //
);
export const useModuleFiles = createProjectStateHook(
    "projectDiagramFileModule" //
);
export const useModuleFilesLoaded = createProjectStateHook(
    "projectDiagramFileModuleLoaded" //
);
export const useModuleFilesLoadError = createProjectStateHook(
    "projectDiagramFileModuleLoadError" //
);
export const useProject = createProjectStateHook(
    "project" //
);
export const useProjectId = () => {
    const location = useLocation();
    return React.useMemo(
        () => new URLSearchParams(location.search).get("project_id") ?? "",
        [location.search]
    );
};
export const useProjectDiagramProgress = () => {
    const project = useProject();

    return React.useMemo(
        () => project?.project_progress?.architecture_diagram ?? null,
        [project?.project_progress?.architecture_diagram]
    );
};
export const useProjectAssessmentProgress = () => {
    const project = useProject();

    return React.useMemo(
        () => project?.project_progress?.run_assessment ?? null,
        [project?.project_progress?.run_assessment]
    );
};
export const useProjectLoaded = createProjectStateHook(
    "projectLoaded" //
);
export const useProjectLoadError = createProjectStateHook(
    "projectLoadError" //
);
export const useProjectCacti = createProjectStateHook(
    "projectDiagramFileCacti" //
);
export const useProjectCactiLoaded = createProjectStateHook(
    "projectDiagramFileCactiLoaded" //
);
export const useProjectCactiLoadError = createProjectStateHook(
    "projectDiagramFileCactiLoadError" //
);
export const useProjectCQ = createProjectStateHook(
    "projectCQ" //
);
export const useProjectCQLoaded = createProjectStateHook(
    "projectCQLoaded" //
);
export const useProjectCQLoadError = createProjectStateHook(
    "projectCQLoadError" //
);
export const useProjectCQLogs = createProjectStateHook(
    "projectCQLogs" //
);
export const useProjectCQLogsLoaded = createProjectStateHook(
    "projectCQLogsLoaded" //
);
export const useProjectCQLogsLoadError = createProjectStateHook(
    "projectCQLogsLoadError" //
);
export const useProjectCQTemplate = createProjectStateHook(
    "projectCQTemplate" //
);
export const useProjectCQTemplateLoaded = createProjectStateHook(
    "projectCQTemplateLoaded" //
);
export const useProjectCQTemplateLoadError = createProjectStateHook(
    "projectCQTemplateLoadError" //
);
export const useProjectDiagram = createProjectStateHook(
    "projectDiagram" //
);
export const useProjectDiagramLoaded = createProjectStateHook(
    "projectDiagramLoaded" //
);
export const useProjectDiagramLoadError = createProjectStateHook(
    "projectDiagramLoadError" //
);
export const useProjectDiagramLogs = createProjectStateHook(
    "projectDiagramLogs" //
);
export const useProjectDiagramLogsLoaded = createProjectStateHook(
    "projectDiagramLogsLoaded" //
);
export const useProjectDiagramLogsLoadError = createProjectStateHook(
    "projectDiagramLogsLoadError" //
);
export const useProjectDiagramFile = createProjectStateHook(
    "projectDiagramFileJson" //
);
export const useProjectDiagramImageFiles = createProjectStateHook(
    "projectDiagramFileImage" //
);
export const useProjectDiagramImageFilesLoaded = createProjectStateHook(
    "projectDiagramFileImageLoaded" //
);
export const useProjectDiagramImageFilesLoadError = createProjectStateHook(
    "projectDiagramFileImageLoadError" //
);
export const useProjectDiagramFileLoaded = createProjectStateHook(
    "projectDiagramFileJsonLoaded" //
);
export const useProjectDiagramFileLoadError = createProjectStateHook(
    "projectDiagramFileJsonLoadError" //
);
export const useProjectXML = createProjectStateHook(
    "projectDiagramFileXml" //
);
export const useProjectXMLLoaded = createProjectStateHook(
    "projectDiagramFileXmlLoaded" //
);
export const useProjectXMLLoadError = createProjectStateHook(
    "projectDiagramFileXmlLoadError" //
);
export const useProjectDiagramFilePdf = createProjectStateHook(
    "projectDiagramFilePdf" //
);
export const useProjectDiagramFilePdfLoaded = createProjectStateHook(
    "projectDiagramFilePdfLoaded" //
);
export const useProjectDiagramFilePdfLoadError = createProjectStateHook(
    "projectDiagramFilePdfLoadError" //
);
export const useProjectRegister = createProjectStateHook(
    "projectRegister" //
);
export const useProjectLLMScenarios = () => {
    const projectRegister = useProjectRegister();

    return React.useMemo(() => projectRegister?.review?.llmScenarios || [], [projectRegister]);
};
export const useProjectRegisterLoaded = createProjectStateHook(
    "projectRegisterLoaded" //
);
export const useProjectRegisterLoadError = createProjectStateHook(
    "projectRegisterLoadError" //
);
export const useProjectAssessment = createProjectStateHook(
    "projectAssessment" //
);
export const useProjectAssessmentLoaded = createProjectStateHook(
    "projectAssessmentLoaded" //
);
export const useProjectAssessmentLoadError = createProjectStateHook(
    "projectAssessmentLoadError" //
);
export const useProjectLogs = createProjectStateHook(
    "projectLogs" //
);
export const useProjectLogsLoaded = createProjectStateHook(
    "projectLogsLoaded" //
);
export const useProjectLogsLoadError = createProjectStateHook(
    "projectLogsLoadError" //
);
export const useTerraformFiles = createProjectStateHook(
    "projectDiagramFileTerraform" //
);
export const useTerraformFilesLoaded = createProjectStateHook(
    "projectDiagramFileTerraformLoaded" //
);
export const useTerraformFilesLoadError = createProjectStateHook(
    "projectDiagramFileTerraformLoadError" //
);
export const useUser = createBackendStateHook(
    "user" //
);
export const useUserLoaded = createBackendStateHook(
    "userLoaded" //
);
export const useUserLoadError = createBackendStateHook(
    "userLoadError" //
);
export const useUserCredits = () =>
    useRootSelector((state: RootState) => state.backend.userCredits);
export const useUserCreditsLoaded = createBackendStateHook(
    "userCreditsLoaded" //
);
export const useUserCreditsLoadError = createBackendStateHook(
    "userCreditsLoadError" //
);
export const useUserPolicyOptions = createBackendStateHook(
    "userPolicyOptions" //
);
export const useUserPolicyOptionsLoaded = createBackendStateHook(
    "userPolicyOptionsLoaded" //
);
export const useUserPolicyOptionsLoadError = createBackendStateHook(
    "userPolicyOptionsLoadError" //
);
export const useUserRoleOptions = createBackendStateHook(
    "userRoleOptions" //
);

// ---------------------------------------------------------------------------
// Additional authorization hooks (new permission resources)
// ---------------------------------------------------------------------------

export const useUserRoleOptionsLoaded = createBackendStateHook(
    "userRoleOptionsLoaded" //
);
export const useUserRoleOptionsLoadError = createBackendStateHook(
    "userRoleOptionsLoadError" //
);
