import { enqueueSnackbar } from "notistack";

import { ServiceDomainProps } from "#root/interfaces/domain";

import {
    ArchitectureDiagramFormService,
    ArchitectureDiagramService,
} from "../api/architecture_diagram";

import { processDomainFailure } from "./helper";

export const getProjectDiagramFileJsonFromApi = async (
    project_id: string, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.getProjectDiagramFile({ project_id })
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar(
                    "Project Diagram File is retrieved successfully.", //
                    { variant: "success" }
                );
            return res?.data?.data?.project_diagram_file || {};
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const deleteProjectDiagramFile = async (
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
    return await ADApi.deleteProjectDiagramFile({
        project_id,
        file_id_list,
    })
        .then((res) => {
            if (!hideSnackbar) {
                enqueueSnackbar(
                    "Project Diagram File(s) are deleted successfully.", //
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

export const postDiagramFiles = async (
    body: FormData, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramFormService();
    return await ADApi.postDiagramFiles(body)
        .then((res) => {
            if (!hideSnackbar) {
                enqueueSnackbar(
                    "Project Diagram File is inserted successfully.", //
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
