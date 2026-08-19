import { ProjectCacti } from "#root/interfaces/cacti";
import { ProjectDiagram } from "#root/interfaces/diagram";
import app_store, { app_actions } from "#root/redux/store";
import { ProjectDiagramFileCactiAuthorization } from "#root/services/authorization/ProjectDiagramFileCactiAuthorization";
import { getProjectCactiFromApi } from "#root/services/domain/cacti";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import {
    getProjectCactiFromStore,
    getProjectCactiLoadedFromStore,
    getProjectIdFromStore,
} from "#root/stores/backendStore";

export class ProjectCactiLoader extends BaseLoader {
    constructor(private readonly defaultProjectId?: string | null) {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectDiagramFileCactiAuthorization().isAuthorized;
    }

    private withSelectedFile(
        projectDiagramFileCacti: ProjectCacti | null,
        projectDiagram?: ProjectDiagram | null
    ) {
        if (!projectDiagramFileCacti) {
            return null;
        }

        const selectedCactiFileId = projectDiagram?.ref?.selected_cacti_file_id || "";
        return {
            ...projectDiagramFileCacti,
            files:
                projectDiagramFileCacti.files?.map((file) => ({
                    ...file,
                    selected: file.file_id === selectedCactiFileId,
                })) || [],
        };
    }

    override async init(): Promise<ProjectCacti | void> {
        const projectDiagramFileCacti = getProjectCactiFromStore();
        const currentProjectId = getProjectIdFromStore();
        const projectDiagramFileCactiLoaded = getProjectCactiLoadedFromStore();
        const targetProjectId = this.defaultProjectId ?? "";

        if (projectDiagramFileCactiLoaded && currentProjectId === targetProjectId) {
            return projectDiagramFileCacti || undefined;
        }

        if (projectDiagramFileCactiLoaded && !targetProjectId) {
            return projectDiagramFileCacti || undefined;
        }

        return await this.refresh();
    }

    override async get(
        projectId?: string | null,
        projectDiagram?: ProjectDiagram | null
    ): Promise<ProjectCacti | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const isAuthorized = this.syncAuthorization();

        app_store.dispatch(app_actions.backend.setProjectDiagramFileCactiLoaded(false));
        app_store.dispatch(app_actions.backend.setProjectDiagramFileCactiLoadError(false));

        if (!targetProjectId || !isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setProjectDiagramFileCacti(null));
            app_store.dispatch(app_actions.backend.setProjectDiagramFileCactiLoaded(true));
            return;
        }

        return await getProjectCactiFromApi(targetProjectId)
            .then((projectDiagramFileCacti) => {
                const nextProjectCacti = this.withSelectedFile(
                    projectDiagramFileCacti ?? null,
                    projectDiagram
                );
                app_store.dispatch(
                    app_actions.backend.setProjectDiagramFileCacti(nextProjectCacti)
                );
                app_store.dispatch(app_actions.backend.setProjectDiagramFileCactiLoaded(true));
                return nextProjectCacti || undefined;
            })
            .catch(() => {
                app_store.dispatch(app_actions.backend.setProjectDiagramFileCactiLoadError(true));
                app_store.dispatch(app_actions.backend.setProjectDiagramFileCactiLoaded(true));
            });
    }

    override async refresh(projectDiagram?: ProjectDiagram | null): Promise<ProjectCacti | void> {
        return await this.get(undefined, projectDiagram);
    }
}
