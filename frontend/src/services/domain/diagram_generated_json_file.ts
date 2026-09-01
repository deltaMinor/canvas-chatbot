import { enqueueSnackbar } from "notistack";

import { ServiceDomainProps } from "#root/interfaces/domain";
import { base64ToText, downloadBase64File } from "#root/utils/fileDownloadHelper";

import { ArchitectureDiagramService } from "../api/architecture_diagram";

import { processDomainFailure } from "./helper";

export const getProjectDiagramFileGeneratedJsonFromApi = async (
    project_id: string, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.getProjectDiagramFileGeneratedJson({ project_id })
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar(
                    "Generated JSON files are retrieved successfully.", //
                    { variant: "success" }
                );
            return res?.data?.data?.project_generated_json_file || {};
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const deleteProjectDiagramFileGeneratedJson = async (
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
    return await ADApi.deleteProjectDiagramFileGeneratedJson({
        project_id,
        file_id_list,
    })
        .then((res) => {
            if (!hideSnackbar) {
                enqueueSnackbar(
                    "Generated JSON file(s) are deleted successfully.", //
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

export const downloadProjectDiagramFileGeneratedJson = async (
    {
        project_id, //
        file_id,
    }: {
        project_id: string;
        file_id: string;
    },
    serviceDomainProps: ServiceDomainProps = {}
): Promise<void> => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.getProjectDiagramFileGeneratedJsonFile({ project_id, file_id })
        .then((res) => {
            const file = res?.data?.data;
            if (!file) return;
            downloadBase64File(file.data, file.filename, file.content_type);
            if (!hideSnackbar) {
                enqueueSnackbar(
                    "Generated JSON file is downloaded successfully.", //
                    { variant: "success" }
                );
            }
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

/**
 * Fetches the raw JSON text content of a previously saved generated diagram
 * file (as opposed to `downloadProjectDiagramFileGeneratedJson`, which
 * triggers a browser file download). Used by the "Import Diagram" chip flow
 * to import straight from the database instead of from the temporary
 * directory the file was originally produced into.
 */
export const fetchProjectDiagramFileGeneratedJsonContent = async (
    {
        project_id, //
        file_id,
    }: {
        project_id: string;
        file_id: string;
    },
    serviceDomainProps: ServiceDomainProps = {}
): Promise<string | null> => {
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.getProjectDiagramFileGeneratedJsonFile({ project_id, file_id })
        .then((res) => {
            const file = res?.data?.data;
            if (!file?.data) return null;
            return base64ToText(file.data);
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

/**
 * Persists a TopologyGenerator-produced JSON diagram (already read from the
 * temporary directory) to the database, so the resulting "Import Diagram"
 * chip references a permanent, database-backed file rather than a temp path
 * that may be deleted or unavailable to other users/devices.
 *
 * Every generation is saved as its own new row, filed under the literal
 * filename "diagram.json" (see backend `GENERATED_JSON_FILENAME`), as a
 * temporary implementation.
 */
export const saveGeneratedTopologyJson = async (
    project_id: string,
    content: string,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<{ file_id: string; filename: string } | null> => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ADApi = new ArchitectureDiagramService();
    return await ADApi.postDiagramFileGeneratedJson({ project_id, content })
        .then((res) => {
            if (!hideSnackbar) {
                enqueueSnackbar(
                    "Generated diagram JSON saved successfully.", //
                    { variant: "success" }
                );
            }
            return res?.data?.data || null;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return null;
        });
};
