import { ServiceDomainProps } from "#root/interfaces/domain";
import TopologyRunContextService, {
    TopologyRunContextEntry,
} from "#root/services/api/topologyRunContext";

import { processDomainFailure } from "./helper";

export type { TopologyRunContextEntry };

export const recordTopologyRunContext = async (
    projectId: string,
    conversationId: string,
    runId: string,
    address: string,
    fileName: string,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<TopologyRunContextEntry | null> => {
    if (!projectId || !conversationId || !runId || !address) return null;
    const api = new TopologyRunContextService();
    return await api
        .record({
            project_id: projectId,
            conversation_id: conversationId,
            run_id: runId,
            address,
            file_name: fileName,
        })
        .then((res) => res?.data?.data ?? null)
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return null;
        });
};

/** Returns every run context recorded for the given conversation only. */
export const listTopologyRunContexts = async (
    projectId: string,
    conversationId: string,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<TopologyRunContextEntry[]> => {
    if (!projectId || !conversationId) return [];
    const api = new TopologyRunContextService();
    return await api
        .list({ project_id: projectId, conversation_id: conversationId })
        .then((res) => res?.data?.data?.runs ?? [])
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return [];
        });
};

export const deleteTopologyRunContext = async (
    projectId: string,
    conversationId: string,
    runId: string,
    serviceDomainProps: ServiceDomainProps = { hideSnackbar: true }
): Promise<boolean> => {
    if (!projectId || !conversationId || !runId) return false;
    const api = new TopologyRunContextService();
    return await api
        .delete({ project_id: projectId, conversation_id: conversationId, run_id: runId })
        .then(() => true)
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return false;
        });
};
