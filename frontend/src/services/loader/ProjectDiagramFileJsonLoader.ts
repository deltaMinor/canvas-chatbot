import { ProjectDiagram } from "#root/interfaces/diagram";
import { ProjectDiagramFiles } from "#root/interfaces/diagramFile";
import app_store, { app_actions } from "#root/redux/store";
import { ProjectDiagramFileJsonAuthorization } from "#root/services/authorization/ProjectDiagramFileJsonAuthorization";
import { getProjectDiagramFileJsonFromApi } from "#root/services/domain/diagram_file";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import {
    getProjectDiagramFileJsonFromStore,
    getProjectDiagramFileJsonLoadedFromStore,
    getProjectIdFromStore,
} from "#root/stores/backendStore";

export class ProjectDiagramFileJsonLoader extends BaseLoader {
    constructor(private readonly defaultProjectId?: string | null) {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectDiagramFileJsonAuthorization().isAuthorized;
    }

    private withSelectedFile(
        projectDiagramFileJson: ProjectDiagramFiles | null,
        projectDiagram?: ProjectDiagram | null
    ) {
        if (!projectDiagramFileJson) {
            return null;
        }

        const selectedDiagramFileId = projectDiagram?.ref?.selected_diagram_file_id || "";
        return {
            ...projectDiagramFileJson,
            files:
                projectDiagramFileJson.files?.map((file) => ({
                    ...file,
                    selected: file.file_id === selectedDiagramFileId,
                })) || [],
        };
    }

    override async init(): Promise<ProjectDiagramFiles | void> {
        const projectDiagramFileJson = getProjectDiagramFileJsonFromStore();
        const projectDiagramFileJsonLoaded = getProjectDiagramFileJsonLoadedFromStore();
        const currentProjectId = getProjectIdFromStore();
        const targetProjectId = this.defaultProjectId ?? "";

        if (projectDiagramFileJsonLoaded && currentProjectId === targetProjectId) {
            return projectDiagramFileJson || undefined;
        }

        if (projectDiagramFileJsonLoaded && !targetProjectId) {
            return projectDiagramFileJson || undefined;
        }

        return await this.refresh();
    }

    override async get(
        projectId?: string | null,
        projectDiagram?: ProjectDiagram | null
    ): Promise<ProjectDiagramFiles | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const isAuthorized = this.syncAuthorization();

        app_store.dispatch(app_actions.backend.setProjectDiagramFileJsonLoaded(false));
        app_store.dispatch(app_actions.backend.setProjectDiagramFileJsonLoadError(false));

        if (!targetProjectId || !isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setProjectDiagramFileJson(null));
            app_store.dispatch(app_actions.backend.setProjectDiagramFileJsonLoaded(true));
            return;
        }

        return await getProjectDiagramFileJsonFromApi(targetProjectId)
            .then((projectDiagramFileJson) => {
                const nextProjectDiagramFile = this.withSelectedFile(
                    projectDiagramFileJson ?? null,
                    projectDiagram
                );
                app_store.dispatch(
                    app_actions.backend.setProjectDiagramFileJson(nextProjectDiagramFile)
                );
                app_store.dispatch(app_actions.backend.setProjectDiagramFileJsonLoaded(true));
                return nextProjectDiagramFile || undefined;
            })
            .catch(() => {
                app_store.dispatch(app_actions.backend.setProjectDiagramFileJsonLoadError(true));
                app_store.dispatch(app_actions.backend.setProjectDiagramFileJsonLoaded(true));
            });
    }

    override async refresh(
        projectDiagram?: ProjectDiagram | null
    ): Promise<ProjectDiagramFiles | void> {
        return await this.get(undefined, projectDiagram);
    }
}
