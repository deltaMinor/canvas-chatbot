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
import {
    createAuthorizationLoaderHook,
    createAuthorizationProjectLoaderHook,
} from "#root/utils/loaderHookUtil";

// Memo hooks
// Static loaders

// Authorization loaders

export const useMasterDiagramTemplatesLoader = createAuthorizationLoaderHook(
    MasterDiagramTemplatesLoader //
);
export const useProjectsLoader = createAuthorizationLoaderHook(
    ProjectsLoader //
);
export const useKbToscaLoader = createAuthorizationLoaderHook(
    KbToscaLoader //
);

// Authorization + user loaders

// Authorization + project + user loaders

// Authorization + project schema loaders

// Authorization + project loaders
export const useProjectCactiLoader = createAuthorizationProjectLoaderHook(
    ProjectCactiLoader //
);
export const useProjectDiagramFileJsonLoader = createAuthorizationProjectLoaderHook(
    ProjectDiagramFileJsonLoader //
);
export const useProjectDiagramFilePdfLoader = createAuthorizationProjectLoaderHook(
    ProjectDiagramFilePdfLoader //
);
export const useProjectDiagramImageFilesLoader = createAuthorizationProjectLoaderHook(
    ProjectDiagramImageFilesLoader //
);
export const useProjectDiagramLoader = createAuthorizationProjectLoaderHook(
    ProjectDiagramLoader //
);
export const useProjectDiagramLogsLoader = createAuthorizationProjectLoaderHook(
    ProjectDiagramLogsLoader //
);
export const useProjectLoader = createAuthorizationProjectLoaderHook(
    ProjectLoader //
);
export const useProjectLogsLoader = createAuthorizationProjectLoaderHook(
    ProjectLogsLoader //
);
export const useProjectModuleFileLoader = createAuthorizationProjectLoaderHook(
    ProjectModuleFileLoader //
);
export const useProjectTerraformFileLoader = createAuthorizationProjectLoaderHook(
    ProjectTerraformFileLoader //
);
export const useProjectXMLLoader = createAuthorizationProjectLoaderHook(
    ProjectXMLLoader //
);
