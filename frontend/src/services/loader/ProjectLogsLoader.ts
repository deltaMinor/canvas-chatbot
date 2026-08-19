import { AuditLog } from "#root/interfaces";
import app_store, { app_actions } from "#root/redux/store";
import { ProjectLogsAuthorization } from "#root/services/authorization/ProjectLogsAuthorization";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import {
    getProjectIdFromStore,
    getProjectLogsFromStore,
    getProjectLogsLoadedFromStore,
} from "#root/stores/backendStore";

export class ProjectLogsLoader extends BaseLoader {
    constructor(private readonly defaultProjectId?: string | null) {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectLogsAuthorization().isAuthorized;
    }

    override async init(): Promise<AuditLog[] | void> {
        const projectLogsLoaded = getProjectLogsLoadedFromStore();
        const projectLogs = getProjectLogsFromStore();
        const currentProjectId = getProjectIdFromStore();
        const targetProjectId = this.defaultProjectId ?? "";

        if (projectLogsLoaded && currentProjectId === targetProjectId) {
            return projectLogs;
        }

        if (projectLogsLoaded && !targetProjectId) {
            return projectLogs;
        }

        return await this.refresh();
    }

    override async get(projectId?: string | null): Promise<AuditLog[] | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const isAuthorized = this.syncAuthorization();

        app_store.dispatch(app_actions.backend.setProjectLogsLoaded(false));
        app_store.dispatch(app_actions.backend.setProjectLogsLoadError(false));

        if (!targetProjectId || !isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setProjectLogs([]));
            app_store.dispatch(app_actions.backend.setProjectLogsLoaded(true));
            return [];
        }

        app_store.dispatch(app_actions.backend.setProjectLogs([]));
        app_store.dispatch(app_actions.backend.setProjectLogsLoaded(true));
        return [];
    }

    override async refresh(projectId?: string | null): Promise<AuditLog[] | void> {
        return await this.get(projectId);
    }
}
