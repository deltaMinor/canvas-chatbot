import { SpecialInput } from "#root/interfaces/chatbot";
import { readIntentRXFile } from "#root/services/domain/intentrx";
import {
    TopologyRunContextEntry,
    deleteTopologyRunContext,
    listTopologyRunContexts,
    recordTopologyRunContext,
} from "#root/services/domain/topology_run_context";

const RUN_ID_LINE_RE = /^Run id:\s*(.+?)\s*$/;

const INTENTRX_TOPO_REGEX = /^(?=.{24,80}$)intentrx-topo-.*-.*$/;

export const extractTopologyRunId = (text: string): string | null => {
    for (const rawLine of text.split("\n")) {
        const match = RUN_ID_LINE_RE.exec(rawLine.trim());
        if (match?.[1]) return match[1];
    }
    return null;
};

export const persistTopologyRunContext = (
    projectId: string,
    conversationId: string,
    runId: string,
    address: string
): void => {
    void recordTopologyRunContext(projectId, conversationId, runId, address, {
        hideSnackbar: true,
    });
};

export const formatTopologyRunContexts = (runs: TopologyRunContextEntry[]): string => {
    if (runs.length === 0) return "No topology run contexts recorded for this conversation.";
    return runs.map((run) => `${run.run_id}: ${run.address}`).join("\n");
};

export const fetchTopologyRunContexts = async (
    projectId: string,
    conversationId: string
): Promise<TopologyRunContextEntry[]> => {
    const runs = await listTopologyRunContexts(projectId, conversationId);
    const checked = await Promise.all(
        runs.map(async (run) => {
            const fileRead = await readIntentRXFile(run.address);
            return fileRead.exists ? run : null;
        })
    );

    const stale = checked
        .map((run, index) => (run === null ? runs[index] : null))
        .filter((run): run is TopologyRunContextEntry => run !== null);
    for (const run of stale) {
        void deleteTopologyRunContext(projectId, conversationId, run.run_id);
    }

    return checked.filter((run): run is TopologyRunContextEntry => run !== null);
};

export const clearTopologyRunContexts = async (
    projectId: string,
    conversationId: string
): Promise<void> => {
    const runs = await listTopologyRunContexts(projectId, conversationId);
    for (const run of runs) {
        await deleteTopologyRunContext(projectId, conversationId, run.run_id);
    }
};

export const topologyRunContextToSpecialInput = (
    context: TopologyRunContextEntry
): SpecialInput => ({
    label: `${context.run_id} (created on ${new Date(context.created_at).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })})`,
    input: context.run_id,
});

export const isValidTopologyRunId = (value: string): boolean => INTENTRX_TOPO_REGEX.test(value);
