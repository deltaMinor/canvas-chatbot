import { ProjectDiagramGeneratedJsonFiles } from "#root/interfaces/diagramFile";
import app_store, { app_actions } from "#root/redux/store";
import { ProjectDiagramFileGeneratedJsonAuthorization } from "#root/services/authorization/ProjectDiagramFileGeneratedJsonAuthorization";
import { getProjectDiagramFileGeneratedJsonFromApi } from "#root/services/domain/diagram_generated_json_file";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import {
    getProjectDiagramFileGeneratedJsonFromStore,
    getProjectDiagramFileGeneratedJsonLoadedFromStore,
    getProjectIdFromStore,
} from "#root/stores/backendStore";

export class ProjectDiagramFileGeneratedJsonLoader extends BaseLoader {
    constructor(private readonly defaultProjectId?: string | null) {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectDiagramFileGeneratedJsonAuthorization().isAuthorized;
    }

    override async init(): Promise<ProjectDiagramGeneratedJsonFiles | void> {
        const projectDiagramFileGeneratedJson = getProjectDiagramFileGeneratedJsonFromStore();
        const projectDiagramFileGeneratedJsonLoaded =
            getProjectDiagramFileGeneratedJsonLoadedFromStore();
        const currentProjectId = getProjectIdFromStore();
        const targetProjectId = this.defaultProjectId ?? "";

        if (projectDiagramFileGeneratedJsonLoaded && currentProjectId === targetProjectId) {
            return projectDiagramFileGeneratedJson || undefined;
        }

        if (projectDiagramFileGeneratedJsonLoaded && !targetProjectId) {
            return projectDiagramFileGeneratedJson || undefined;
        }

        return await this.refresh();
    }

    override async get(
        projectId?: string | null
    ): Promise<ProjectDiagramGeneratedJsonFiles | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const isAuthorized = this.syncAuthorization();

        app_store.dispatch(app_actions.backend.setProjectDiagramFileGeneratedJsonLoaded(false));
        app_store.dispatch(
            app_actions.backend.setProjectDiagramFileGeneratedJsonLoadError(false)
        );

        if (!targetProjectId || !isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setProjectDiagramFileGeneratedJson(null));
            app_store.dispatch(
                app_actions.backend.setProjectDiagramFileGeneratedJsonLoaded(true)
            );
            return;
        }

        return await getProjectDiagramFileGeneratedJsonFromApi(targetProjectId)
            .then((projectDiagramFileGeneratedJson) => {
                app_store.dispatch(
                    app_actions.backend.setProjectDiagramFileGeneratedJson(
                        projectDiagramFileGeneratedJson || null
                    )
                );
                app_store.dispatch(
                    app_actions.backend.setProjectDiagramFileGeneratedJsonLoaded(true)
                );
                return projectDiagramFileGeneratedJson || undefined;
            })
            .catch(() => {
                app_store.dispatch(
                    app_actions.backend.setProjectDiagramFileGeneratedJsonLoadError(true)
                );
                app_store.dispatch(
                    app_actions.backend.setProjectDiagramFileGeneratedJsonLoaded(true)
                );
            });
    }

    override async refresh(): Promise<ProjectDiagramGeneratedJsonFiles | void> {
        return await this.get(undefined);
    }
}
