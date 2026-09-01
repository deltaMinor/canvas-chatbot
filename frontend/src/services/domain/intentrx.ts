import { ServiceDomainProps } from "#root/interfaces/domain";
import IntentRXService, {
    FileReadResult,
    IntentRXApp,
    IntentRXPanel,
} from "#root/services/api/intentrx";

import { processDomainFailure } from "./helper";

export type { IntentRXPanel };

export interface IntentRXTurn {
    panels: IntentRXPanel[];
    ended: boolean;
    /**
     * The database file_id of a newly generated topology diagram the
     * backend detected and saved during this same request (if any). Use
     * this directly instead of independently re-reading the temp file and
     * saving it again -- doing both creates duplicate "diagram.json" rows.
     */
    topology_diagram_address?: string;
}

const FAILURE_TURN: IntentRXTurn = {
    panels: [{ title: null, text: "Could not reach IntentRX. Please try again." }],
    ended: true,
};

const FAILURE_FILE_READ: FileReadResult = { exists: false };

export const startIntentRX = async (
    sessionId: string,
    app?: IntentRXApp,
    projectId?: string,
    conversationId?: string,
    chatState?: number,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<IntentRXTurn> => {
    const api = new IntentRXService();
    return await api
        .start({
            session_id: sessionId,
            app,
            project_id: projectId,
            conversation_id: conversationId,
            chat_state: chatState,
        })
        .then((res) => res?.data?.data ?? FAILURE_TURN)
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return FAILURE_TURN;
        });
};

export const sendIntentRXMessage = async (
    sessionId: string,
    text: string,
    projectId?: string,
    conversationId?: string,
    chatState?: number,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<IntentRXTurn> => {
    const api = new IntentRXService();
    return await api
        .sendMessage({
            session_id: sessionId,
            text,
            project_id: projectId,
            conversation_id: conversationId,
            chat_state: chatState,
        })
        .then((res) => res?.data?.data ?? FAILURE_TURN)
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return FAILURE_TURN;
        });
};

export const stopIntentRX = async (sessionId: string): Promise<void> => {
    const api = new IntentRXService();
    await api.stop({ session_id: sessionId }).catch(() => undefined);
};

export const readIntentRXFile = async (
    path: string,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<FileReadResult> => {
    const api = new IntentRXService();
    return await api
        .readFile({ path })
        .then((res) => res?.data?.data ?? FAILURE_FILE_READ)
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return FAILURE_FILE_READ;
        });
};

export const pollIntentRXProgress = async (sessionId: string): Promise<string> => {
    const api = new IntentRXService();
    return await api
        .progress({ session_id: sessionId })
        .then((res) => res?.data?.data?.text ?? "")
        .catch(() => "");
};

export interface IntentRXStatus {
    running: boolean;
    busy: boolean;
}

const FAILURE_STATUS: IntentRXStatus = { running: true, busy: false };

export const checkIntentRXStatus = async (sessionId: string): Promise<IntentRXStatus> => {
    const api = new IntentRXService();
    return await api
        .status({ session_id: sessionId })
        .then((res) => res?.data?.data ?? FAILURE_STATUS)
        .catch(() => FAILURE_STATUS);
};
