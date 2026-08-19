import { ProjectDiagramFile } from "#root/interfaces/common";
import { ProjectDiagram } from "#root/interfaces/diagram";
import app_store, { app_actions } from "#root/redux/store";
import { ProjectDiagramFileModuleAuthorization } from "#root/services/authorization/ProjectDiagramFileModuleAuthorization";
import { getModuleFilesFromApi } from "#root/services/domain/module";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import {
    getModuleFilesFromStore,
    getModuleFilesLoadedFromStore,
    getProjectIdFromStore,
} from "#root/stores/backendStore";

export class ProjectModuleFileLoader extends BaseLoader {
    constructor(private readonly defaultProjectId?: string | null) {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectDiagramFileModuleAuthorization().isAuthorized;
    }

    private withSelectedFiles(
        projectDiagramFileModule: ProjectDiagramFile[],
        projectDiagram?: ProjectDiagram | null
    ) {
        const selectedModuleFileIdList = projectDiagram?.ref?.selected_module_file_id_list || [];

        return projectDiagramFileModule.map((file) => ({
            ...file,
            selected: selectedModuleFileIdList.length
                ? selectedModuleFileIdList.includes(file.file_id || "")
                : true,
        }));
    }

    override async init(): Promise<ProjectDiagramFile[] | void> {
        const projectDiagramFileModuleLoaded = getModuleFilesLoadedFromStore();
        const projectDiagramFileModule = getModuleFilesFromStore();
        const currentProjectId = getProjectIdFromStore();
        const targetProjectId = this.defaultProjectId ?? "";

        if (projectDiagramFileModuleLoaded && currentProjectId === targetProjectId) {
            return projectDiagramFileModule;
        }

        if (projectDiagramFileModuleLoaded && !targetProjectId) {
            return projectDiagramFileModule;
        }

        return await this.refresh();
    }

    override async get(
        projectId?: string | null,
        projectDiagram?: ProjectDiagram | null
    ): Promise<ProjectDiagramFile[] | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const isAuthorized = this.syncAuthorization();

        app_store.dispatch(app_actions.backend.setProjectDiagramFileModuleLoaded(false));
        app_store.dispatch(app_actions.backend.setProjectDiagramFileModuleLoadError(false));

        if (!targetProjectId || !isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setProjectDiagramFileModule([]));
            app_store.dispatch(app_actions.backend.setProjectDiagramFileModuleLoaded(true));
            return;
        }

        return await getModuleFilesFromApi(targetProjectId)
            .then((projectDiagramFileModule) => {
                const nextModuleFiles = this.withSelectedFiles(
                    projectDiagramFileModule || [],
                    projectDiagram
                );
                app_store.dispatch(
                    app_actions.backend.setProjectDiagramFileModule(nextModuleFiles)
                );
                app_store.dispatch(app_actions.backend.setProjectDiagramFileModuleLoaded(true));
                return nextModuleFiles;
            })
            .catch(() => {
                app_store.dispatch(app_actions.backend.setProjectDiagramFileModuleLoadError(true));
                app_store.dispatch(app_actions.backend.setProjectDiagramFileModuleLoaded(true));
            });
    }

    override async refresh(
        projectDiagram?: ProjectDiagram | null
    ): Promise<ProjectDiagramFile[] | void> {
        return await this.get(undefined, projectDiagram);
    }
}
