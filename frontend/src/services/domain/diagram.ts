import { enqueueSnackbar } from "notistack";

import { ProjectProps } from "#root/interfaces/common";
import { ProjectDiagram, ProjectDiagramImageFiles } from "#root/interfaces/diagram";
import { ServiceDomainProps } from "#root/interfaces/domain";
import {
    PatchProjectDiagramCanvasBody,
    PatchProjectDiagramEdgeBody,
    PatchProjectDiagramNodeBody,
} from "#root/interfaces/service";

import {
    ArchitectureDiagramFormService,
    ArchitectureDiagramService,
} from "../api/architecture_diagram";

import { processDomainFailure } from "./helper";

export const getProjectDiagramFromApi = async (
    project_id: string,
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.getProjectDiagram({ project_id })
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Project diagram is retrieved successfully.", {
                    variant: "success",
                });
            return res?.data?.data?.project_diagram;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const patchProjectDiagram = async (
    body: Partial<ProjectDiagram>, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.patchProjectDiagram(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Project diagram is updated successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postGenerateDiagramFromIac = async (
    body: {
        project_id: string; //
        selected_terraform_file_id_list: string[];
        selected_module_file_id_list: string[];
    },
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.postGenerateDiagramFromIac(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("A new diagram is generated successfully from file.", {
                    variant: "success",
                });
            return res?.data?.data?.project_ad;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postGenerateDiagramFromTemplate = async (
    body: {
        project_id: string; //
        selected_template_id: string;
    },
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.postGenerateDiagramFromTemplate(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("A new diagram is generated successfully from template.", {
                    variant: "success",
                });
            return res?.data?.data?.project_ad;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postGenerateDiagramBlank = async (
    body: ProjectProps, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.postGenerateDiagramBlank(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("A blank diagram is generated successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postGenerateDiagramFromCacti = async (
    body: {
        project_id: string; //
        selected_cacti_file_id: string;
    },
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.postGenerateDiagramFromCacti(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("A new diagram is generated successfully from CACTi.", {
                    variant: "success",
                });
            return res?.data?.data?.project_ad;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postGenerateDiagramFromDiagramFile = async (
    body: {
        project_id: string; //
        selected_diagram_file_id: string;
    },
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.postGenerateDiagramFromDiagramFile(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("A new diagram is generated successfully from a diagram file.", {
                    variant: "success",
                });
            return res?.data?.data?.project_ad;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postGenerateDiagramFromXML = async (
    body: {
        project_id: string; //
        selected_xml_file_id: string;
    },
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.postGenerateDiagramFromXML(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("A new diagram is generated successfully from XML.", {
                    variant: "success",
                });
            return res?.data?.data?.project_ad;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const getProjectDiagramLogsFromApi = async (
    body: { project_id: string }, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ArchitectureDiagramService();
    return await ApplicationApi.getProjectDiagramLogs(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar(
                    "Project diagram logs are retrieved successfully.", //
                    { variant: "success" }
                );
            return res?.data?.data?.logs;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const getProjectDiagramNodeLogsFromApi = async (
    body: { project_id: string; node_id: string }, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ArchitectureDiagramService();
    return await ApplicationApi.getProjectDiagramNodeLogs(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Project diagram node logs are retrieved successfully.", {
                    variant: "success",
                });
            return res?.data?.data?.logs;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const getProjectDiagramEdgeLogsFromApi = async (
    body: { project_id: string; edge_id: string }, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ArchitectureDiagramService();
    return await ApplicationApi.getProjectDiagramEdgeLogs(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Project diagram edge logs are retrieved successfully.", {
                    variant: "success",
                });
            return res?.data?.data?.logs;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const getLLMImageFilesFromApi = async (
    project_id: string,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<ProjectDiagramImageFiles> => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramFormService();
    return await ADApi.getLLMImageFiles({ project_id })
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("LLM image and PDF files are retrieved successfully.", {
                    variant: "success",
                });
            const imageFiles = res?.data?.data?.image_files;
            return {
                project_id,
                files: imageFiles?.files || [],
                selected_file_id: imageFiles?.selected_file_id || "",
            };
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postLLMImageFiles = async (
    body: FormData,
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramFormService();
    return await ADApi.postLLMImageFiles(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("LLM image files are uploaded successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const deleteLLMImageFiles = async (
    body: {
        project_id: string;
        file_id_list: string[];
    },
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.deleteLLMImageFiles(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("LLM image files are deleted successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

type LLMGenerationCanvasType = "architecture" | "data_flow";

export const getLLMGenerationStatusFromApi = async (
    project_id: string,
    canvas_id: string,
    serviceDomainProps: ServiceDomainProps = {},
    canvasType: LLMGenerationCanvasType = "architecture"
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    const statusRequest =
        canvasType === "data_flow"
            ? ADApi.getLLMDataFlowGenerationStatus(project_id, canvas_id)
            : ADApi.getLLMArchitectureGenerationStatus(project_id, canvas_id);

    return await statusRequest
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("LLM Generation status is retrieved successfully.", {
                    variant: "success",
                });
            return res?.data?.data || {};
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postGenerateLLMDataflow = async (
    project_id: string,
    canvas_id: string,
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const body = {
        project_id: project_id,
        canvas_id: canvas_id,
    };
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.postGenerateLLMDataflow(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Dataflow has been generated using LLM successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postGenerateLLMDiagram = async (
    project_id: string,
    canvas_id: string,
    file_id: string,
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const body = {
        project_id: project_id,
        canvas_id: canvas_id,
        file_id,
    };
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.postGenerateLLMDiagram(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Diagram has been generated using LLM successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const postGenerateLLMArchitecture = async (
    body: {
        project_id: string; //
        canvas_id: string;
        description: string;
    },
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.postGenerateLLMArchitecture(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Architecture has been generated using LLM successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const updateProjectDiagramNode = async (
    body: PatchProjectDiagramNodeBody,
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.patchProjectDiagramNode(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Node is updated successfully.", {
                    variant: "success",
                });
            return res;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const updateProjectDiagramEdge = async (
    body: PatchProjectDiagramEdgeBody,
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.patchProjectDiagramEdge(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Edge is updated successfully.", {
                    variant: "success",
                });
            return res;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const updateProjectDiagramCanvas = async (
    body: PatchProjectDiagramCanvasBody,
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.patchProjectDiagramCanvas(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Canvas is updated successfully.", {
                    variant: "success",
                });
            return res;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};
