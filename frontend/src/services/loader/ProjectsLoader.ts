import { Project } from "#root/interfaces/project";
import app_store, { app_actions } from "#root/redux/store";
import { ProjectsAuthorization } from "#root/services/authorization/ProjectsAuthorization";
import { getAllProjectsFromApi } from "#root/services/domain/projects";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import { getProjectsFromStore, getProjectsLoadedFromStore } from "#root/stores/backendStore";

/**
 * Loads projects into Redux.
 */
export class ProjectsLoader extends BaseLoader {
    constructor() {
        super();
    }

    override onDisabled(): void {
        app_store.dispatch(app_actions.backend.setProjects([]));
        app_store.dispatch(app_actions.backend.setProjectsLoaded(true));
        app_store.dispatch(app_actions.backend.setProjectsLoadError(false));
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectsAuthorization().isAuthorized;
    }

    override async init(): Promise<Project[] | void> {
        const projects = getProjectsFromStore();
        const projectsLoaded = getProjectsLoadedFromStore();

        if (projectsLoaded) {
            return projects;
        }

        return await this.refresh();
    }

    override async get(): Promise<Project[] | void> {
        const isAuthorized = this.syncAuthorization();
        app_store.dispatch(app_actions.backend.setProjectsLoaded(false));
        app_store.dispatch(app_actions.backend.setProjectsLoadError(false));

        if (!isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setProjects([]));
            app_store.dispatch(app_actions.backend.setProjectsLoaded(true));
            return;
        }

        return await getAllProjectsFromApi({})
            .then((projects) => {
                if (!projects) {
                    app_store.dispatch(app_actions.backend.setProjects([]));
                    app_store.dispatch(app_actions.backend.setProjectsLoaded(true));
                    return;
                }
                app_store.dispatch(app_actions.backend.setProjects(projects));
                this.syncAuthorization();
                app_store.dispatch(app_actions.backend.setProjectsLoaded(true));
                return projects;
            })
            .catch(() => {
                app_store.dispatch(app_actions.backend.setProjectsLoadError(true));
                app_store.dispatch(app_actions.backend.setProjectsLoaded(true));
            });
    }

    override async refresh(): Promise<Project[] | void> {
        return await this.get();
    }
}
