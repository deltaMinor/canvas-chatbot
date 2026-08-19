import { ProjectDiagram, ProjectDiagramImageFiles } from "#root/interfaces/diagram";
import app_store, { app_actions } from "#root/redux/store";
import { ProjectDiagramFileImageAuthorization } from "#root/services/authorization/ProjectDiagramFileImageAuthorization";
import { getLLMImageFilesFromApi } from "#root/services/domain/diagram";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import {
    getProjectDiagramImageFilesFromStore,
    getProjectDiagramImageFilesLoadedFromStore,
    getProjectIdFromStore,
} from "#root/stores/backendStore";

export class ProjectDiagramImageFilesLoader extends BaseLoader {
    constructor(private readonly defaultProjectId?: string | null) {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectDiagramFileImageAuthorization().isAuthorized;
    }

    private withSelectedFile(
        projectDiagramFileImage: ProjectDiagramImageFiles | null,
        projectDiagram?: ProjectDiagram | null
    ) {
        if (!projectDiagramFileImage) {
            return null;
        }

        const selectedFileId = projectDiagram?.ref?.selected_image_file_id || "";

        return {
            ...projectDiagramFileImage,
            selected_file_id: selectedFileId || projectDiagramFileImage.selected_file_id || "",
        };
    }

    override async init(): Promise<ProjectDiagramImageFiles | void> {
        const projectDiagramFileImage = getProjectDiagramImageFilesFromStore();
        const currentProjectId = getProjectIdFromStore();
        const projectDiagramFileImageLoaded = getProjectDiagramImageFilesLoadedFromStore();
        const targetProjectId = this.defaultProjectId ?? "";

        if (projectDiagramFileImageLoaded && currentProjectId === targetProjectId) {
            return projectDiagramFileImage || undefined;
        }

        if (projectDiagramFileImageLoaded && !targetProjectId) {
            return getProjectDiagramImageFilesFromStore() || undefined;
        }

        return await this.refresh();
    }

    override async get(
        projectId?: string | null,
        projectDiagram?: ProjectDiagram | null
    ): Promise<ProjectDiagramImageFiles | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const isAuthorized = this.syncAuthorization();

        app_store.dispatch(app_actions.backend.setProjectDiagramFileImageLoaded(false));
        app_store.dispatch(app_actions.backend.setProjectDiagramFileImageLoadError(false));

        if (!targetProjectId || !isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setProjectDiagramFileImage(null));
            app_store.dispatch(app_actions.backend.setProjectDiagramFileImageLoaded(true));
            return;
        }

        return await getLLMImageFilesFromApi(targetProjectId)
            .then((projectDiagramFileImage) => {
                const nextProjectDiagramImageFiles = this.withSelectedFile(
                    projectDiagramFileImage ?? null,
                    projectDiagram
                );
                app_store.dispatch(
                    app_actions.backend.setProjectDiagramFileImage(nextProjectDiagramImageFiles)
                );
                app_store.dispatch(app_actions.backend.setProjectDiagramFileImageLoaded(true));
                return nextProjectDiagramImageFiles || undefined;
            })
            .catch(() => {
                app_store.dispatch(app_actions.backend.setProjectDiagramFileImageLoadError(true));
                app_store.dispatch(app_actions.backend.setProjectDiagramFileImageLoaded(true));
            });
    }

    override async refresh(
        projectDiagram?: ProjectDiagram | null
    ): Promise<ProjectDiagramImageFiles | void> {
        return await this.get(undefined, projectDiagram);
    }
}
