import { ProjectDiagram } from "#root/interfaces/diagram";
import app_store, { app_actions } from "#root/redux/store";
import { ProjectDiagramAuthorization } from "#root/services/authorization/ProjectDiagramAuthorization";
import { getProjectDiagramFromApi } from "#root/services/domain/diagram";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import {
    getProjectDiagramFromStore,
    getProjectDiagramLoadedFromStore,
    getProjectIdFromStore,
} from "#root/stores/backendStore";
import { processProjectDiagram } from "#root/utils/diagram";

export class ProjectDiagramLoader extends BaseLoader {
    constructor(private readonly defaultProjectId?: string | null) {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectDiagramAuthorization().isAuthorized;
    }

    override async init(projectId?: string | null): Promise<ProjectDiagram | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const projectDiagram = getProjectDiagramFromStore();
        const currentProjectId = getProjectIdFromStore();
        const projectDiagramLoaded = getProjectDiagramLoadedFromStore();

        if (projectDiagramLoaded && currentProjectId === targetProjectId) {
            return projectDiagram || undefined;
        }

        if (projectDiagramLoaded && !targetProjectId) {
            return projectDiagram || undefined;
        }

        return await this.refresh(targetProjectId);
    }

    override async get(projectId?: string | null): Promise<ProjectDiagram | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const isAuthorized = this.syncAuthorization();

        app_store.dispatch(app_actions.backend.setProjectDiagramLoaded(false));
        app_store.dispatch(app_actions.backend.setProjectDiagramLoadError(false));

        if (!targetProjectId || !isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setProjectDiagram(null));
            app_store.dispatch(app_actions.backend.setProjectDiagramLoaded(true));
            return;
        }

        return await getProjectDiagramFromApi(targetProjectId)
            .then((projectDiagram) => {
                if (!projectDiagram) {
                    app_store.dispatch(app_actions.backend.setProjectDiagram(null));
                    app_store.dispatch(app_actions.backend.setProjectDiagramLoaded(true));
                    return;
                }

                const processedProjectDiagram = processProjectDiagram({
                    projectDiagram,
                });
                app_store.dispatch(app_actions.backend.setProjectDiagram(processedProjectDiagram));
                this.syncAuthorization();
                app_store.dispatch(app_actions.backend.setProjectDiagramLoaded(true));
                return processedProjectDiagram;
            })
            .catch(() => {
                app_store.dispatch(app_actions.backend.setProjectDiagramLoadError(true));
                app_store.dispatch(app_actions.backend.setProjectDiagramLoaded(true));
            });
    }

    override async refresh(projectId?: string | null): Promise<ProjectDiagram | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        return await this.get(targetProjectId);
    }
}
