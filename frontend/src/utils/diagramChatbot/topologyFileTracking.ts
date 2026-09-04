import { ChatMessage } from "#root/interfaces/chatbot";
import { saveGeneratedTopologyJson } from "#root/services/domain/diagram_generated_json_file";
import { IntentRXPanel, readIntentRXFile } from "#root/services/domain/intentrx";
import { refreshProjectDiagramFileGeneratedJson } from "#root/stores/backendRefreshStore";
import { formatIntentRXPanels } from "#root/utils/diagramChatbot/formatIntentRX";
import {
    extractTopologyRunId,
    persistTopologyRunContext,
} from "#root/utils/diagramChatbot/topologyRunContext";

interface TopologyFileTrackingState {
    aliases: Record<string, string>;
    filePath: string | null;
    runId: string | null;
    runContextPersisted: boolean;
    lastMtime: number | null;
    lastSize: number | null;
    fileName: string | null;
}

export const DEFAULT_TOPOLOGY_FILE_NAME = "diagram";

const TOPOLOGY_FILEDIR_PANELTITLE = "TOPO-GENERATOR-PREFLIGHT";

const PATH_ALIAS_LINE_RE = /^-\s*\$([A-Za-z_][A-Za-z0-9_]*):\s*(.+)$/;
const TOPOLOGY_FILE_LINE_RE = /^-\s*topology_file:\s*(.+?)\s*\(exists=/;

const topologyFileTrackingBySession = new Map<string, TopologyFileTrackingState>();

const getTopologyFileTrackingState = (sessionId: string): TopologyFileTrackingState => {
    let state = topologyFileTrackingBySession.get(sessionId);
    if (!state) {
        state = {
            aliases: {},
            filePath: null,
            runId: null,
            runContextPersisted: false,
            lastMtime: null,
            lastSize: null,
            fileName: null,
        };
        topologyFileTrackingBySession.set(sessionId, state);
    }
    return state;
};

export const resetTopologyFileTrackingState = (sessionId: string): void => {
    topologyFileTrackingBySession.delete(sessionId);
};

export const setTopologyFileTrackingFileName = (sessionId: string, fileName: string): void => {
    const state = getTopologyFileTrackingState(sessionId);
    state.fileName = fileName;
};

const updateTopologyFileTracking = (state: TopologyFileTrackingState, text: string): void => {
    for (const rawLine of text.split("\n")) {
        const line = rawLine.trim();

        const aliasMatch = PATH_ALIAS_LINE_RE.exec(line);
        if (aliasMatch) {
            const [, name, value] = aliasMatch;
            if (name && value) state.aliases[name] = value.trim();
            continue;
        }

        if (state.filePath === null) {
            const fileMatch = TOPOLOGY_FILE_LINE_RE.exec(line);
            const rawPath = fileMatch?.[1];
            if (rawPath) {
                let resolved = rawPath.trim();
                for (const [name, value] of Object.entries(state.aliases)) {
                    resolved = resolved.split(`$${name}`).join(value);
                }
                state.filePath = resolved;
            }
        }

        if (state.runId === null) {
            const runId = extractTopologyRunId(line);
            if (runId) state.runId = runId;
        }
    }
};

export const applyTopologyFileFromAddress = async (
    sessionId: string,
    projectId: string,
    address: string
): Promise<ChatMessage[]> => {
    const state = getTopologyFileTrackingState(sessionId);
    state.filePath = address;

    const fileRead = await readIntentRXFile(state.filePath);
    if (!fileRead.exists || fileRead.content === undefined) return [];

    const unchanged = fileRead.mtime === state.lastMtime && fileRead.size === state.lastSize;
    if (unchanged) return [];

    state.lastMtime = fileRead.mtime ?? null;
    state.lastSize = fileRead.size ?? null;

    const saved = await saveGeneratedTopologyJson(projectId, fileRead.content, {
        hideSnackbar: true,
    });
    if (!saved?.file_id) return [];

    void refreshProjectDiagramFileGeneratedJson();

    return [
        {
            text: "A diagram has been generated from TopologyGenerator.",
            topology_diagram_address: saved.file_id,
        },
    ];
};

export const checkAndApplyTopologyFile = async (
    sessionId: string,
    projectId: string,
    conversationId: string,
    panels: IntentRXPanel[],
    generatedJsonFileId?: string
): Promise<ChatMessage[]> => {
    const state = getTopologyFileTrackingState(sessionId);
    for (const panel of panels) {
        if (panel.title !== TOPOLOGY_FILEDIR_PANELTITLE) continue;
        updateTopologyFileTracking(state, panel.text);
    }
    const messages = formatIntentRXPanels(panels);

    if (state.runId && state.filePath && !state.runContextPersisted) {
        state.runContextPersisted = true;
        persistTopologyRunContext(
            projectId,
            conversationId,
            state.runId,
            state.filePath,
            state.fileName ?? DEFAULT_TOPOLOGY_FILE_NAME
        );
    }

    if (!generatedJsonFileId) return messages;

    void refreshProjectDiagramFileGeneratedJson();

    return [
        ...messages,
        {
            text: "A diagram has been generated from TopologyGenerator.",
            topology_diagram_address: generatedJsonFileId,
        },
    ];
};
