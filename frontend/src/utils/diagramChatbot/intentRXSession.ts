import { TOPOLOGY_SETUP_TITLE } from "#root/constants/diagramChatbot";
import { ChatbotState } from "#root/enums/diagram-chatbot";
import { HandleInputFnOutput, ProgressReporter } from "#root/interfaces/chatbot";
import { IntentRXTurn, pollIntentRXProgress, startIntentRX } from "#root/services/domain/intentrx";
import {
    checkAndApplyTopologyFile,
    resetTopologyFileTrackingState,
} from "#root/utils/diagramChatbot/topologyFileTracking";

export const INTENTRX_PROGRESS_POLL_MS = 700;

export interface IntentRXContext {
    sessionId: string;
    projectId: string;
    conversationId: string;
    instanceId: string;
    onProgress: ProgressReporter;
    performImportDiagramFromFile: (file: File) => Promise<string>;
}

export const startIntentRXSession = async (
    app: "onto" | "intent" | "topology",
    state: ChatbotState,
    intentContext: IntentRXContext
): Promise<[HandleInputFnOutput, ChatbotState]> => {
    resetTopologyFileTrackingState(intentContext.sessionId);
    const intentRxResponse = await withIntentRXProgress(
        intentContext.sessionId,
        intentContext.onProgress,
        () =>
            startIntentRX(
                intentContext.sessionId,
                app,
                intentContext.projectId,
                intentContext.conversationId,
                state
            )
    );
    const messages = await checkAndApplyTopologyFile(
        intentContext.sessionId,
        intentContext.projectId,
        intentContext.conversationId,
        intentRxResponse.panels
    );
    return [
        { messages: messages.length > 0 ? messages : [{ text: "" }] },
        intentRxResponse.ended ? ChatbotState.Neutral : state,
    ];
};

export const withIntentRXProgress = async <T>(
    sessionId: string,
    onProgress: ProgressReporter | undefined,
    task: () => Promise<T>
): Promise<T> => {
    if (!onProgress) return task();

    let cancelled = false;
    const poll = async () => {
        while (!cancelled) {
            await new Promise((resolve) => setTimeout(resolve, INTENTRX_PROGRESS_POLL_MS));
            if (cancelled) return;
            const line = await pollIntentRXProgress(sessionId);
            if (!cancelled && line) onProgress(line);
        }
    };

    const pollPromise = poll();
    try {
        return await task();
    } finally {
        cancelled = true;
        await pollPromise;
    }
};

export const getIntentRXSessionId = (projectId: string, conversationId: string): string =>
    `intentrx:${projectId || "unknown-project"}:${conversationId || "unknown-conversation"}`;

export const isIntentRXState = (state: ChatbotState): boolean =>
    state === ChatbotState.LlmOnto ||
    state === ChatbotState.LlmIntent ||
    state === ChatbotState.LlmTopology ||
    state === ChatbotState.LlmTopologySetup ||
    state === ChatbotState.LlmTopologySetupContinue ||
    state === ChatbotState.LlmTopologySetupUpload;

export const isTopologySetup = (turn: IntentRXTurn): boolean => {
    for (const panel of turn.panels) {
        if (panel.title !== TOPOLOGY_SETUP_TITLE) return true;
    }
    return false;
};
