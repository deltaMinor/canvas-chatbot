import axios from "axios";

import { AuditLog, AxiosApiResponse } from "#root/interfaces";
import { ProjectCacti } from "#root/interfaces/cacti";
import { ProjectDiagramFile, ProjectProps } from "#root/interfaces/common";
import {
    DiagramCanvas,
    MasterDiagramTemplate,
    ProjectDiagram,
    WarningReport,
} from "#root/interfaces/diagram";
import { ProjectDiagramFiles, ProjectDiagramPdfFiles } from "#root/interfaces/diagramFile";
import {
    PatchProjectDiagramCanvasBody,
    PatchProjectDiagramEdgeBody,
    PatchProjectDiagramNodeBody,
} from "#root/interfaces/service";
import { KBTosca } from "#root/interfaces/tosca";
import { ProjectXML } from "#root/interfaces/xml";
import {
    AD_API_URL_PREFIX,
    SINGLE_ORIGIN_SERVER_BASE_URL,
    baseHeaders,
} from "#root/lib/http-common";

import { setupApiInterceptors } from "./tokenRefresh";

export interface ProjectDiagramPdfFileDownload {
    file_id: string;
    filename: string;
    content_type: string;
    data: string;
}

const baseURL = `${SINGLE_ORIGIN_SERVER_BASE_URL}/${AD_API_URL_PREFIX}`;

const axios_api = axios.create({
    baseURL,
    headers: { "Content-type": "multipart/form-data" },
});

// Setup standardized interceptors for form API
setupApiInterceptors(axios_api);
export class ArchitectureDiagramFormService {
    constructor() {}

    // CACTi
    async postCactiFile(
        body: FormData //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project_diagram/files/cacti", body);
    }

    // Diagram File
    async postDiagramFiles(
        body: FormData //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project_diagram/files/diagram", body);
    }

    // PDF Document Files (storage only)
    async postDiagramPdfFiles(
        body: FormData //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project_diagram/files/pdf", body);
    }

    // Module Files
    async getModuleFiles(
        { project_id }: ProjectProps //
    ): Promise<AxiosApiResponse<{ module_files: ProjectDiagramFile[] }>> {
        const params = { project_id };
        return await axios_api.get("project_diagram/files/module", {
            params,
        });
    }
    async postModuleFiles(
        body: FormData //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project_diagram/files/module", body);
    }

    // Terraform Files
    async getTerraformFiles(
        { project_id }: ProjectProps //
    ): Promise<AxiosApiResponse<{ terraform_files: ProjectDiagramFile[] }>> {
        const params = { project_id };
        return await axios_api.get("project_diagram/files/terraform", {
            params,
        });
    }
    async postTerraformFiles(
        body: FormData //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project_diagram/files/terraform", body);
    }

    // LLM Image/PDF Files
    async getLLMImageFiles(
        { project_id }: ProjectProps //
    ): Promise<
        AxiosApiResponse<{
            image_files: {
                project_id: string;
                files: ProjectDiagramFile[];
                selected_file_id: string;
            };
        }>
    > {
        const params = { project_id };
        return await axios_api.get("project_diagram/files/image", {
            params,
        });
    }
    async postLLMImageFiles(
        body: FormData //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project_diagram/files/image", body);
    }

    // XML
    async postXMLFile(
        body: FormData //
    ): Promise<AxiosApiResponse> {
        return await axios_api.post("project_diagram/files/xml", body);
    }
}

const axios_json_api = axios.create({ baseURL, headers: { ...baseHeaders } });

// Setup standardized interceptors for regular API
setupApiInterceptors(axios_json_api);

export class ArchitectureDiagramService {
    constructor() {}

    // Tosca
    async getKbTosca(): Promise<AxiosApiResponse<{ kb_tosca: KBTosca }>> {
        return await axios_json_api.get("kb/tosca");
    }
    async postValidateTosca(
        { project_id }: ProjectProps //
    ): Promise<AxiosApiResponse<{ canvas: DiagramCanvas<WarningReport>[] }>> {
        return await axios_json_api.post("tosca/validate", { project_id });
    }

    // master diagram templates
    async getMasterDiagramTemplates(): Promise<
        AxiosApiResponse<{ master_diagram_templates: MasterDiagramTemplate[] }>
    > {
        return await axios_json_api.get("master_diagram_templates");
    }

    // Diagram
    async getProjectDiagram(
        { project_id }: ProjectProps //
    ): Promise<AxiosApiResponse<{ project_diagram: ProjectDiagram }>> {
        const params = { project_id };
        return await axios_json_api.get("project_diagram", { params });
    }
    async patchProjectDiagram(
        body: Partial<ProjectDiagram> //
    ): Promise<AxiosApiResponse> {
        return await axios_json_api.patch("project_diagram", body);
    }
    async postGenerateDiagramBlank(
        body: ProjectProps //
    ): Promise<AxiosApiResponse> {
        return await axios_json_api.post("project_diagram", body);
    }
    async postGenerateDiagramFromCacti(body: {
        project_id: string; //
        selected_cacti_file_id: string;
    }): Promise<AxiosApiResponse<{ project_ad: unknown }>> {
        return await axios_json_api.post("project_diagram/canvas/architecture/generate", {
            project_id: body.project_id,
            file_type: "cacti",
            file_id: body.selected_cacti_file_id,
        });
    }
    async postGenerateDiagramFromDiagramFile(body: {
        project_id: string; //
        selected_diagram_file_id: string;
    }): Promise<AxiosApiResponse<{ project_ad: unknown }>> {
        return await axios_json_api.post("project_diagram/canvas/architecture/generate", {
            project_id: body.project_id,
            file_type: "json",
            file_id: body.selected_diagram_file_id,
        });
    }
    async postGenerateDiagramFromIac(body: {
        project_id: string; //
        selected_terraform_file_id_list: string[];
        selected_module_file_id_list: string[];
    }): Promise<AxiosApiResponse<{ project_ad: unknown }>> {
        return await axios_json_api.post("project_diagram/canvas/architecture/generate", {
            project_id: body.project_id,
            file_type: "iac",
            file_id_list: body.selected_terraform_file_id_list,
            module_file_id_list: body.selected_module_file_id_list,
        });
    }
    async postGenerateDiagramFromTemplate(body: {
        project_id: string; //
        selected_template_id: string;
    }): Promise<AxiosApiResponse<{ project_ad: unknown }>> {
        return await axios_json_api.post("project_diagram/canvas/architecture/generate", {
            project_id: body.project_id,
            file_type: "template",
            file_id: body.selected_template_id,
        });
    }
    async postGenerateDiagramFromXML(body: {
        project_id: string; //
        selected_xml_file_id: string;
    }): Promise<AxiosApiResponse<{ project_ad: unknown }>> {
        return await axios_json_api.post("project_diagram/canvas/architecture/generate", {
            project_id: body.project_id,
            file_type: "xml",
            file_id: body.selected_xml_file_id,
        });
    }
    async getProjectDiagramLogs(
        { project_id }: ProjectProps //
    ): Promise<AxiosApiResponse<{ logs: AuditLog[] }>> {
        const params = { project_id };
        return await axios_json_api.get("project_diagram/logs", { params });
    }
    async getProjectDiagramNodeLogs(
        { project_id, node_id }: { project_id: string; node_id: string } //
    ): Promise<AxiosApiResponse<{ logs: AuditLog[] }>> {
        const params = { project_id, node_id };
        return await axios_json_api.get("project_diagram/logs/node", { params });
    }
    async getProjectDiagramEdgeLogs(
        { project_id, edge_id }: { project_id: string; edge_id: string } //
    ): Promise<AxiosApiResponse<{ logs: AuditLog[] }>> {
        const params = { project_id, edge_id };
        return await axios_json_api.get("project_diagram/logs/edge", { params });
    }
    // Project diagram node
    async patchProjectDiagramNode(body: PatchProjectDiagramNodeBody): Promise<AxiosApiResponse> {
        return await axios_json_api.patch("project_diagram/canvas/node", body);
    }
    // Project diagram edge
    async patchProjectDiagramEdge(body: PatchProjectDiagramEdgeBody): Promise<AxiosApiResponse> {
        return await axios_json_api.patch("project_diagram/canvas/edge", body);
    }
    // Project diagram canvas
    async patchProjectDiagramCanvas(
        body: PatchProjectDiagramCanvasBody
    ): Promise<AxiosApiResponse> {
        return await axios_json_api.patch("project_diagram/canvas", body);
    }

    // CACTi Files
    async getProjectCacti(
        { project_id }: ProjectProps //
    ): Promise<AxiosApiResponse<{ project_cacti: ProjectCacti }>> {
        const params = { project_id };
        return await axios_json_api.get("project_diagram/files/cacti", { params });
    }
    async deleteCactiFiles({
        project_id,
        file_id_list, //
    }: {
        project_id: string; //
        file_id_list: string[];
    }): Promise<AxiosApiResponse> {
        return await axios_json_api.delete("project_diagram/files/cacti", {
            data: { project_id, file_id_list },
        });
    }

    // Diagram File
    async getProjectDiagramFile(
        { project_id }: ProjectProps //
    ): Promise<AxiosApiResponse<{ project_diagram_file: ProjectDiagramFiles }>> {
        const params = { project_id };
        return await axios_json_api.get("project_diagram/files/diagram", { params });
    }
    async deleteProjectDiagramFile(data: {
        project_id: string; //
        file_id_list: string[];
    }): Promise<AxiosApiResponse> {
        return await axios_json_api.delete(
            "project_diagram/files/diagram", //
            { data }
        );
    }

    // PDF Document Files
    async getProjectDiagramFilePdf(
        { project_id }: ProjectProps //
    ): Promise<AxiosApiResponse<{ project_pdf_document_file: ProjectDiagramPdfFiles }>> {
        const params = { project_id };
        return await axios_json_api.get("project_diagram/files/pdf", { params });
    }
    async deleteProjectDiagramFilePdf(data: {
        project_id: string; //
        file_id_list: string[];
    }): Promise<AxiosApiResponse> {
        return await axios_json_api.delete(
            "project_diagram/files/pdf", //
            { data }
        );
    }
    async getProjectDiagramFilePdfFile({
        project_id,
        file_id,
    }: {
        project_id: string;
        file_id: string;
    }): Promise<AxiosApiResponse<ProjectDiagramPdfFileDownload>> {
        const params = { project_id, file_id };
        return await axios_json_api.get("project_diagram/files/pdf/download", { params });
    }

    // Module Files
    async deleteModuleFiles(data: {
        project_id: string; //
        file_id_list: string[];
    }): Promise<AxiosApiResponse> {
        return await axios_json_api.delete(
            "project_diagram/files/module", //
            { data }
        );
    }

    // Terraform Files
    async deleteTerraformFiles(data: {
        project_id: string; //
        file_id_list: string[];
    }): Promise<AxiosApiResponse> {
        return await axios_json_api.delete(
            "project_diagram/files/terraform", //
            { data }
        );
    }

    // LLM Image/PDF Files
    async patchLLMImageFile(data: {
        project_id: string; //
        file_id: string;
    }): Promise<AxiosApiResponse> {
        return await axios_json_api.patch(
            "project_diagram/files/image", //
            data
        );
    }
    async deleteLLMImageFiles(data: {
        project_id: string; //
        file_id_list: string[];
    }): Promise<AxiosApiResponse> {
        return await axios_json_api.delete(
            "project_diagram/files/image", //
            { data }
        );
    }

    // XML Files
    async getProjectXML(
        { project_id }: ProjectProps //
    ): Promise<AxiosApiResponse<{ project_xml: ProjectXML }>> {
        const params = { project_id };
        return await axios_json_api.get("project_diagram/files/xml", { params });
    }
    async deleteXMLFiles({
        project_id,
        file_id_list, //
    }: {
        project_id: string; //
        file_id_list: string[];
    }): Promise<AxiosApiResponse> {
        return await axios_json_api.delete("project_diagram/files/xml", {
            data: { project_id, file_id_list },
        });
    }

    // LLM
    async getLLMArchitectureGenerationStatus(
        project_id: string,
        canvas_id: string
    ): Promise<AxiosApiResponse<{ status: number }>> {
        const params = { project_id, canvas_id };
        return await axios_json_api.get("project_diagram/canvas/architecture/generate", {
            params,
        });
    }

    async postGenerateLLMDiagram(body: {
        project_id: string;
        canvas_id: string;
        file_id: string;
    }): Promise<AxiosApiResponse<{ generation: { task_id: string } }>> {
        return await axios_json_api.post(
            "project_diagram/canvas/architecture/generate", //
            {
                project_id: body.project_id,
                canvas_id: body.canvas_id,
                file_type: "image",
                file_id: body.file_id,
            }
        );
    }
    async postGenerateLLMArchitecture(body: {
        project_id: string; //
        canvas_id: string;
        description: string;
    }): Promise<AxiosApiResponse<{ generation: { task_id: string } }>> {
        return await axios_json_api.post(
            "project_diagram/canvas/architecture/generate", //
            {
                project_id: body.project_id,
                canvas_id: body.canvas_id,
                file_type: "description",
                description: body.description,
            }
        );
    }
}
