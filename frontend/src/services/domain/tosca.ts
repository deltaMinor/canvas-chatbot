import { enqueueSnackbar } from "notistack";

import { ServiceDomainProps } from "#root/interfaces/domain";

import { ArchitectureDiagramService } from "../api/architecture_diagram";

import { processDomainFailure } from "./helper";

export const getKbToscaFromApi = async (
    _props: {},
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.getKbTosca()
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Kb Tosca is retrieved successfully.", {
                    variant: "success",
                });
            return res?.data?.data?.kb_tosca;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postValidateTosca = async (
    body: { project_id: string }, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.postValidateTosca(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Diagram has been validated with TOSCA rules successfully.", {
                    variant: "success",
                });
            return res?.data?.data?.canvas;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};
