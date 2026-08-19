import { Project } from "#root/interfaces/project";
import app_store, { app_actions } from "#root/redux/store";
import { ProjectAuthorization } from "#root/services/authorization/ProjectAuthorization";
import { getProjectFromApi } from "#root/services/domain/projects";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import { getProjectFromStore, getProjectLoadedFromStore } from "#root/stores/backendStore";

/**
 * Loads the active project document into Redux and keeps layout metadata in sync.
 */
export class ProjectLoader extends BaseLoader {
    constructor(private readonly defaultProjectId?: string | null) {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectAuthorization().isAuthorized;
    }

    private isEntitledToAccessProject() {
        // The route may expose a project id that the current user is not entitled to open.
        return true;
    }

    override async init(): Promise<Project | void> {
        const project = getProjectFromStore();
        const loadedProjectId = `${project?.project_id || ""}`;
        const projectLoaded = getProjectLoadedFromStore();
        const targetProjectId = this.defaultProjectId ?? "";

        if (projectLoaded && loadedProjectId === targetProjectId) {
            return project || undefined;
        }

        if (projectLoaded && !targetProjectId) {
            return project || undefined;
        }

        return await this.refresh();
    }

    override async get(projectId?: string | null): Promise<Project | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const isAuthorized = this.syncAuthorization();
        const entitled = this.isEntitledToAccessProject();
        app_store.dispatch(app_actions.backend.setProjectLoaded(false));
        app_store.dispatch(app_actions.backend.setProjectLoadError(false));

        if (!targetProjectId || !isAuthorized.read || !entitled) {
            app_store.dispatch(app_actions.backend.setProject(null));
            app_store.dispatch(app_actions.backend.setProjectLoaded(true));
            return;
        }

        return await getProjectFromApi(targetProjectId)
            .then((project) => {
                if (!project) {
                    app_store.dispatch(app_actions.backend.setProject(null));
                    app_store.dispatch(app_actions.backend.setProjectLoaded(true));
                    return;
                }

                app_store.dispatch(app_actions.backend.setProject(project));
                // Recompute field-level permissions now that the concrete project is available.
                this.syncAuthorization();
                app_store.dispatch(app_actions.backend.setProjectLoaded(true));
                return project;
            })
            .catch(() => {
                app_store.dispatch(app_actions.backend.setProjectLoadError(true));
                app_store.dispatch(app_actions.backend.setProjectLoaded(true));
            });
    }

    override async refresh(): Promise<Project | void> {
        return await this.get();
    }
}
