import { AuditLog } from "#root/interfaces";
import app_store, { app_actions } from "#root/redux/store";
import { ProjectDiagramLogsAuthorization } from "#root/services/authorization/ProjectDiagramLogsAuthorization";
import { getProjectDiagramLogsFromApi } from "#root/services/domain/diagram";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import {
    getProjectDiagramLogsFromStore,
    getProjectDiagramLogsLoadedFromStore,
    getProjectIdFromStore,
} from "#root/stores/backendStore";

export class ProjectDiagramLogsLoader extends BaseLoader {
    constructor(private readonly defaultProjectId?: string | null) {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectDiagramLogsAuthorization().isAuthorized;
    }

    override async init(): Promise<AuditLog[]> {
        const projectDiagramLogsLoaded = getProjectDiagramLogsLoadedFromStore();
        const projectDiagramLogs = getProjectDiagramLogsFromStore();
        const currentProjectId = getProjectIdFromStore();
        const targetProjectId = this.defaultProjectId ?? "";

        if (projectDiagramLogsLoaded && currentProjectId === targetProjectId) {
            return projectDiagramLogs;
        }

        if (projectDiagramLogsLoaded && !targetProjectId) {
            return projectDiagramLogs;
        }

        return await this.refresh();
    }

    override async get(projectId?: string | null): Promise<AuditLog[]> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const isAuthorized = this.syncAuthorization();

        app_store.dispatch(app_actions.backend.setProjectDiagramLogsLoaded(false));
        app_store.dispatch(app_actions.backend.setProjectDiagramLogsLoadError(false));

        if (!targetProjectId || !isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setProjectDiagramLogs([]));
            app_store.dispatch(app_actions.backend.setProjectDiagramLogsLoaded(true));
            return [];
        }

        return await getProjectDiagramLogsFromApi({ project_id: targetProjectId })
            .then((logs) => {
                app_store.dispatch(app_actions.backend.setProjectDiagramLogs(logs || []));
                app_store.dispatch(app_actions.backend.setProjectDiagramLogsLoaded(true));
                return logs || [];
            })
            .catch(() => {
                app_store.dispatch(app_actions.backend.setProjectDiagramLogsLoadError(true));
                app_store.dispatch(app_actions.backend.setProjectDiagramLogsLoaded(true));
                return [];
            });
    }

    override async refresh(projectId?: string | null): Promise<AuditLog[]> {
        return await this.get(projectId);
    }
}
