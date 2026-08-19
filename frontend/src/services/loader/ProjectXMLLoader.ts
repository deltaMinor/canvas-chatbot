import { ProjectDiagram } from "#root/interfaces/diagram";
import { ProjectXML } from "#root/interfaces/xml";
import app_store, { app_actions } from "#root/redux/store";
import { getProjectXMLFromApi } from "#root/services/domain/xml";
import { BaseLoader } from "#root/services/loader/BaseLoader";
import {
    getProjectIdFromStore,
    getProjectXMLFromStore,
    getProjectXMLLoadedFromStore,
} from "#root/stores/backendStore";

import { ProjectDiagramFileXMLAuthorization } from "../authorization/ProjectDiagramFileXMLAuthorization";

export class ProjectXMLLoader extends BaseLoader {
    constructor(private readonly defaultProjectId?: string | null) {
        super();
    }

    /**
     * @deprecated Authorization is now computed directly via hooks in src/hooks/authorization/.
     */
    override syncAuthorization() {
        return new ProjectDiagramFileXMLAuthorization().isAuthorized;
    }

    private withSelectedFile(
        projectDiagramFileXml: ProjectXML | null,
        projectDiagram?: ProjectDiagram | null
    ) {
        if (!projectDiagramFileXml) {
            return null;
        }

        const selectedXMLFileId = projectDiagram?.ref?.selected_xml_file_id || "";
        return {
            ...projectDiagramFileXml,
            files:
                projectDiagramFileXml.files?.map((file) => ({
                    ...file,
                    selected: file.file_id === selectedXMLFileId,
                })) || [],
        };
    }

    override async init(): Promise<ProjectXML | void> {
        const projectDiagramFileXml = getProjectXMLFromStore();
        const projectDiagramFileXmlLoaded = getProjectXMLLoadedFromStore();
        const currentProjectId = getProjectIdFromStore();
        const targetProjectId = this.defaultProjectId ?? "";

        if (projectDiagramFileXmlLoaded && currentProjectId === targetProjectId) {
            return projectDiagramFileXml || undefined;
        }

        if (projectDiagramFileXmlLoaded && !targetProjectId) {
            return projectDiagramFileXml || undefined;
        }

        return await this.refresh();
    }

    override async get(
        projectId?: string | null,
        projectDiagram?: ProjectDiagram | null
    ): Promise<ProjectXML | void> {
        const targetProjectId = projectId ?? this.defaultProjectId ?? "";
        const isAuthorized = this.syncAuthorization();

        app_store.dispatch(app_actions.backend.setProjectDiagramFileXmlLoaded(false));
        app_store.dispatch(app_actions.backend.setProjectDiagramFileXmlLoadError(false));

        if (!targetProjectId || !isAuthorized.read) {
            app_store.dispatch(app_actions.backend.setProjectDiagramFileXml(null));
            app_store.dispatch(app_actions.backend.setProjectDiagramFileXmlLoaded(true));
            return;
        }

        return await getProjectXMLFromApi(targetProjectId)
            .then((projectDiagramFileXml) => {
                const nextProjectXML = this.withSelectedFile(
                    projectDiagramFileXml ?? null,
                    projectDiagram
                );
                app_store.dispatch(app_actions.backend.setProjectDiagramFileXml(nextProjectXML));
                app_store.dispatch(app_actions.backend.setProjectDiagramFileXmlLoaded(true));
                return nextProjectXML || undefined;
            })
            .catch(() => {
                app_store.dispatch(app_actions.backend.setProjectDiagramFileXmlLoadError(true));
                app_store.dispatch(app_actions.backend.setProjectDiagramFileXmlLoaded(true));
            });
    }

    override async refresh(projectDiagram?: ProjectDiagram | null): Promise<ProjectXML | void> {
        return await this.get(undefined, projectDiagram);
    }
}
