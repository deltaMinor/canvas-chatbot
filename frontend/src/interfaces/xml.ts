import { DatabaseProps } from ".";

import { ProjectDiagramFile, ProjectProps } from "./common";

export interface ProjectXML extends ProjectProps, DatabaseProps {
    files: ProjectDiagramFile[];
    selected_file_id: string;
}

export type ProjectXMLFile = ProjectDiagramFile;

export enum ProjectXMLFileField {
    data = "data",
    file_id = "file_id",
    filename = "filename",
    timestamp = "timestamp",
    project_id = "project_id",
    metadata = "metadata",
    select = "select",
    delete = "delete",
}
