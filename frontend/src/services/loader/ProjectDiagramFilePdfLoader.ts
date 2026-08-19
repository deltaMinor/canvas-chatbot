import { ProjectDiagramPdfFiles } from "#root/interfaces/diagramFile";
import app_store, { app_actions } from "#root/redux/store";
import { ProjectDiagramFilePdfAuthorization } from "#root/services/authorization/ProjectDiagramFilePdfAuthorization";
import { getProjectDiagramFilePdfFromApi } from "#root/services/domain/diagram_pdf_file";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import {
    getProjectDiagramFilePdfFromStore,
    getProjectDiagramFilePdfLoadedFromStore,
    getProjectIdFromStore,
} from "#root/stores/backendStore";

export class ProjectDiagramFilePdfLoader extends BaseLoader {
    constructor(private readonly defaultProjectId?: string | null) {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectDiagramFilePdfAuthorization().isAuthorized;
    }

    override async init(): Promise<ProjectDiagramPdfFiles | void> {
        const projectDiagramFilePdf = getProjectDiagramFilePdfFromStore();
        const projectDiagramFilePdfLoaded = getProjectDiagramFilePdfLoadedFromStore();
        const currentProjectId = getProjectIdFromStore();
        const targetProjectId = this.defaultProjectId ?? "";

        if (projectDiagramFilePdfLoaded && currentProjectId === targetProjectId) {
            return projectDiagramFilePdf || undefined;
        }

        if (projectDiagramFilePdfLoaded && !targetProjectId) {
            return projectDiagramFilePdf || undefined;
        }

        return await this.refresh();
    }

    override async get(projectId?: string | null): Promise<ProjectDiagramPdfFiles | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const isAuthorized = this.syncAuthorization();

        app_store.dispatch(app_actions.backend.setProjectDiagramFilePdfLoaded(false));
        app_store.dispatch(app_actions.backend.setProjectDiagramFilePdfLoadError(false));

        if (!targetProjectId || !isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setProjectDiagramFilePdf(null));
            app_store.dispatch(app_actions.backend.setProjectDiagramFilePdfLoaded(true));
            return;
        }

        return await getProjectDiagramFilePdfFromApi(targetProjectId)
            .then((projectDiagramFilePdf) => {
                app_store.dispatch(
                    app_actions.backend.setProjectDiagramFilePdf(projectDiagramFilePdf || null)
                );
                app_store.dispatch(app_actions.backend.setProjectDiagramFilePdfLoaded(true));
                return projectDiagramFilePdf || undefined;
            })
            .catch(() => {
                app_store.dispatch(app_actions.backend.setProjectDiagramFilePdfLoadError(true));
                app_store.dispatch(app_actions.backend.setProjectDiagramFilePdfLoaded(true));
            });
    }

    override async refresh(): Promise<ProjectDiagramPdfFiles | void> {
        return await this.get(undefined);
    }
}
