import { enqueueSnackbar } from "notistack";

import { ServiceDomainProps } from "#root/interfaces/domain";

import {
    ArchitectureDiagramFormService,
    ArchitectureDiagramService,
} from "../api/architecture_diagram";

import { processDomainFailure } from "./helper";

export const getModuleFilesFromApi = async (
    project_id: string, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramFormService();
    return await ADApi.getModuleFiles({ project_id })
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Module directory is retrieved successfully.", {
                    variant: "success",
                });
            return res?.data?.data?.module_files;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postModuleFiles = async (
    body: FormData, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramFormService();
    return await ADApi.postModuleFiles(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Module is updated successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const deleteModuleFiles = async (
    body: { project_id: string; file_id_list: string[] }, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.deleteModuleFiles(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Module directory is deleted successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};
