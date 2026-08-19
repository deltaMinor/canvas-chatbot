import { enqueueSnackbar } from "notistack";

import { ServiceDomainProps } from "#root/interfaces/domain";

import {
    ArchitectureDiagramFormService,
    ArchitectureDiagramService,
} from "../api/architecture_diagram";

import { processDomainFailure } from "./helper";

export const getProjectDiagramFilePdfFromApi = async (
    project_id: string, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.getProjectDiagramFilePdf({ project_id })
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar(
                    "Project PDF document file is retrieved successfully.", //
                    { variant: "success" }
                );
            return res?.data?.data?.project_pdf_document_file || {};
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const deleteProjectDiagramFilePdf = async (
    {
        project_id,
        file_id_list, //
    }: {
        project_id: string; //
        file_id_list: string[];
    },
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.deleteProjectDiagramFilePdf({
        project_id,
        file_id_list,
    })
        .then((res) => {
            if (!hideSnackbar) {
                enqueueSnackbar(
                    "Project PDF document file(s) are deleted successfully.", //
                    { variant: "success" }
                );
            }
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postDiagramPdfFiles = async (
    body: FormData, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramFormService();
    return await ADApi.postDiagramPdfFiles(body)
        .then((res) => {
            if (!hideSnackbar) {
                enqueueSnackbar(
                    "Project PDF document file is uploaded successfully.", //
                    { variant: "success" }
                );
            }
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};
