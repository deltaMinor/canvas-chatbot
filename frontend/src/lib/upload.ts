import JSZip from "jszip";
import { enqueueSnackbar } from "notistack";

import { ServiceDomainProps } from "#root/interfaces/domain";
import { postCactiFile } from "#root/services/domain/cacti";
import { postDiagramFiles } from "#root/services/domain/diagram_file";
import { postDiagramPdfFiles } from "#root/services/domain/diagram_pdf_file";
import { postModuleFiles } from "#root/services/domain/module";
import { postTerraformFiles } from "#root/services/domain/terraform";
import { postXMLFile } from "#root/services/domain/xml";

export class FileUploadFactory {
    project_id: string;

    constructor(project_id: string) {
        this.project_id = project_id;
    }

    _getFormDataDiscreteFiles(files: FileList) {
        const formData = new FormData();
        Object.values(files)?.forEach((f) => {
            formData.append("file", f);
        });
        formData.append("project_id", `${this.project_id}`);
        return formData;
    }

    async _postFiles(
        files: FileList,
        postFilesFunction: (
            f: FormData,
            serviceDomainProps?: ServiceDomainProps
        ) => Promise<unknown>,
        serviceDomainProps: ServiceDomainProps = {}
    ) {
        try {
            const formData = this._getFormDataDiscreteFiles(files);
            return await postFilesFunction(
                formData, //
                serviceDomainProps
            );
        } catch (err) {
            enqueueSnackbar(`Files upload failed. ${err}`, {
                variant: "error",
            });
            return Promise.reject(err);
        }
    }

    async postTerraformFiles(files: FileList, serviceDomainProps: ServiceDomainProps = {}) {
        await this._postFiles(
            files, //
            postTerraformFiles,
            serviceDomainProps
        );
    }

    async postCactiFiles(files: FileList, serviceDomainProps: ServiceDomainProps = {}) {
        await this._postFiles(
            files, //
            postCactiFile,
            serviceDomainProps
        );
    }

    async postDiagramFile(files: FileList, serviceDomainProps: ServiceDomainProps = {}) {
        await this._postFiles(
            files, //
            postDiagramFiles,
            serviceDomainProps
        );
    }

    async postDiagramPdfFile(files: FileList, serviceDomainProps: ServiceDomainProps = {}) {
        await this._postFiles(
            files, //
            postDiagramPdfFiles,
            serviceDomainProps
        );
    }

    async postXMLFiles(files: FileList, serviceDomainProps: ServiceDomainProps = {}) {
        await this._postFiles(
            files, //
            postXMLFile,
            serviceDomainProps
        );
    }

    async _postDirectory(
        files: FileList,
        postFilesFunction: (
            f: FormData,
            serviceDomainProps?: ServiceDomainProps
        ) => Promise<unknown>,
        directoryName: string,
        serviceDomainProps: ServiceDomainProps = {}
    ) {
        try {
            const jszip = new JSZip();
            Object.values(files)?.forEach((f) => {
                jszip.file(f.webkitRelativePath, f);
            });
            await jszip.generateAsync({ type: "blob" }).then(async (content) => {
                const formData = new FormData();
                formData.append("directory_name", directoryName);
                formData.append("zip_file", content);
                formData.append("project_id", this.project_id);
                return await postFilesFunction(
                    formData, //
                    serviceDomainProps
                );
            });
        } catch (err) {
            enqueueSnackbar(`Module files upload failed. ${err}`, {
                variant: "error",
            });
            return Promise.reject(err);
        }
    }

    async postModuleDirectory(
        files: FileList,
        directoryName: string,
        serviceDomainProps: ServiceDomainProps = {}
    ) {
        await this._postDirectory(
            files, //
            postModuleFiles,
            directoryName,
            serviceDomainProps
        );
    }
}
