import { DatabaseProps } from ".";

import { ProjectDiagramFile, ProjectProps } from "./common";

export interface ProjectDiagramFiles extends ProjectProps, DatabaseProps {
    files: ProjectDiagramFile[];
    selected_file_id: string;
}

export type ProjectDiagramJsonFile = ProjectDiagramFile;

export type ProjectDiagramPdfFiles = ProjectDiagramFiles;
export type ProjectDiagramPdfFile = ProjectDiagramFile;

export type ProjectDiagramGeneratedJsonFiles = ProjectDiagramFiles;
export type ProjectDiagramGeneratedJsonFile = ProjectDiagramFile;

export enum ProjectDiagramFileField {
    data = "data",
    file_id = "file_id",
    filename = "filename",
    timestamp = "timestamp",
    project_id = "project_id",
    metadata = "metadata",
    select = "select",
    download = "download",
    delete = "delete",
}
