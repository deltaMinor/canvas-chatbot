import { enqueueSnackbar } from "notistack";

import { ServiceDomainProps } from "#root/interfaces/domain";

import {
    ArchitectureDiagramFormService,
    ArchitectureDiagramService,
} from "../api/architecture_diagram";

import { processDomainFailure } from "./helper";

export const getTerraformFilesFromApi = async (
    project_id: string, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramFormService();
    return await ADApi.getTerraformFiles({ project_id })
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Terraform is retrieved successfully.", {
                    variant: "success",
                });
            return res?.data?.data?.terraform_files;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postTerraformFiles = async (
    body: FormData, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramFormService();
    return await ADApi.postTerraformFiles(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Terraform is updated successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const deleteTerraformFiles = async (
    body: { project_id: string; file_id_list: string[] }, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.deleteTerraformFiles(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Terraform is deleted successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};
