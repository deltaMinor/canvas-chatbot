import { enqueueSnackbar } from "notistack";

import { ServiceDomainProps } from "#root/interfaces/domain";

import {
    ArchitectureDiagramFormService,
    ArchitectureDiagramService,
} from "../api/architecture_diagram";

import { processDomainFailure } from "./helper";

export const getProjectCactiFromApi = async (
    project_id: string, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.getProjectCacti({ project_id })
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar(
                    "Project cacti is retrieved successfully.", //
                    { variant: "success" }
                );
            return res?.data?.data?.project_cacti || {};
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postCactiFile = async (
    body: FormData, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramFormService();
    return await ADApi.postCactiFile(body)
        .then((res) => {
            if (!hideSnackbar) {
                enqueueSnackbar(
                    "Project cacti file is inserted successfully.", //
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

export const deleteCactiFiles = async (
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
    return await ADApi.deleteCactiFiles({ project_id, file_id_list })
        .then((res) => {
            if (!hideSnackbar) {
                enqueueSnackbar(
                    "Project cacti files are deleted successfully.", //
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
