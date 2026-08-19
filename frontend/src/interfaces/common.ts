import { DatabaseProps } from ".";

export interface ProjectProps {
    project_id: string;
}

export interface ProjectDiagramFile extends ProjectProps, DatabaseProps {
    filename?: string;
    file_id?: string;
    file_type?: string;
    content_type?: string;
    data?: string;
    timestamp?: string;
    chunkSize?: number;
    length?: number;
    uploadDate?: string;
    selected?: boolean;
    imageUrl?: string;
    fileUrl?: string;
    source?: string;
}

export type DiagramFile = ProjectDiagramFile;
export type ImageFile = ProjectDiagramFile;

export interface JsonFile {
    data: string;
    file_id: string;
    filename: string;
    timestamp: string;
}
