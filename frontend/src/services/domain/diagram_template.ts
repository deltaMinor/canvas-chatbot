import { enqueueSnackbar } from "notistack";

import { ServiceDomainProps } from "#root/interfaces/domain";

import { ArchitectureDiagramService } from "../api/architecture_diagram";

import { processDomainFailure } from "./helper";

export const getMasterDiagramTemplatesFromApi = async (
    _props: {},
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.getMasterDiagramTemplates()
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Master diagram templates are retrieved successfully.", {
                    variant: "success",
                });
            return res?.data?.data?.master_diagram_templates;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};
