import { enqueueSnackbar } from "notistack";

import { ServiceDomainProps } from "#root/interfaces/domain";

import {
    ArchitectureDiagramFormService,
    ArchitectureDiagramService,
} from "../api/architecture_diagram";

import { processDomainFailure } from "./helper";

export const getProjectXMLFromApi = async (
    project_id: string, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.getProjectXML({ project_id })
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar(
                    "Project XML is retrieved successfully.", //
                    { variant: "success" }
                );
            return res?.data?.data?.project_xml || {};
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postXMLFile = async (
    body: FormData, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramFormService();
    return await ADApi.postXMLFile(body)
        .then((res) => {
            if (!hideSnackbar) {
                enqueueSnackbar(
                    "Project XML file is inserted successfully.", //
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

export const deleteXMLFiles = async (
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
    return await ADApi.deleteXMLFiles({ project_id, file_id_list })
        .then((res) => {
            if (!hideSnackbar) {
                enqueueSnackbar(
                    "Project XML files are deleted successfully.", //
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
