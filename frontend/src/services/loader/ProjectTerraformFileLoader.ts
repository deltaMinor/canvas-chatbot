import { ProjectDiagramFile } from "#root/interfaces/common";
import { ProjectDiagram } from "#root/interfaces/diagram";
import app_store, { app_actions } from "#root/redux/store";
import { ProjectDiagramFileTerraformAuthorization } from "#root/services/authorization/ProjectDiagramFileTerraformAuthorization";
import { getTerraformFilesFromApi } from "#root/services/domain/terraform";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import {
    getProjectIdFromStore,
    getTerraformFilesFromStore,
    getTerraformFilesLoadedFromStore,
} from "#root/stores/backendStore";

export class ProjectTerraformFileLoader extends BaseLoader {
    constructor(private readonly defaultProjectId?: string | null) {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectDiagramFileTerraformAuthorization().isAuthorized;
    }

    private withSelectedFiles(
        projectDiagramFileTerraform: ProjectDiagramFile[],
        projectDiagram?: ProjectDiagram | null
    ) {
        const selectedTerraformFileIdList =
            projectDiagram?.ref?.selected_terraform_file_id_list || [];

        return projectDiagramFileTerraform.map((file) => ({
            ...file,
            selected: selectedTerraformFileIdList.length
                ? selectedTerraformFileIdList.includes(file.file_id || "")
                : true,
        }));
    }

    override async init(): Promise<ProjectDiagramFile[] | void> {
        const projectDiagramFileTerraformLoaded = getTerraformFilesLoadedFromStore();
        const projectDiagramFileTerraform = getTerraformFilesFromStore();
        const currentProjectId = getProjectIdFromStore();
        const targetProjectId = this.defaultProjectId ?? "";

        if (projectDiagramFileTerraformLoaded && currentProjectId === targetProjectId) {
            return projectDiagramFileTerraform;
        }

        if (projectDiagramFileTerraformLoaded && !targetProjectId) {
            return projectDiagramFileTerraform;
        }

        return await this.refresh();
    }

    override async get(
        projectId?: string | null,
        projectDiagram?: ProjectDiagram | null
    ): Promise<ProjectDiagramFile[] | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const isAuthorized = this.syncAuthorization();

        app_store.dispatch(app_actions.backend.setProjectDiagramFileTerraformLoaded(false));
        app_store.dispatch(app_actions.backend.setProjectDiagramFileTerraformLoadError(false));

        if (!targetProjectId || !isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setProjectDiagramFileTerraform([]));
            app_store.dispatch(app_actions.backend.setProjectDiagramFileTerraformLoaded(true));
            return;
        }

        return await getTerraformFilesFromApi(targetProjectId)
            .then((projectDiagramFileTerraform) => {
                const nextTerraformFiles = this.withSelectedFiles(
                    projectDiagramFileTerraform || [],
                    projectDiagram
                );
                app_store.dispatch(
                    app_actions.backend.setProjectDiagramFileTerraform(nextTerraformFiles)
                );
                app_store.dispatch(app_actions.backend.setProjectDiagramFileTerraformLoaded(true));
                return nextTerraformFiles;
            })
            .catch(() => {
                app_store.dispatch(
                    app_actions.backend.setProjectDiagramFileTerraformLoadError(true)
                );
                app_store.dispatch(app_actions.backend.setProjectDiagramFileTerraformLoaded(true));
            });
    }

    override async refresh(
        projectDiagram?: ProjectDiagram | null
    ): Promise<ProjectDiagramFile[] | void> {
        return await this.get(undefined, projectDiagram);
    }
}
