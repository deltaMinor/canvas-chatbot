import { enqueueSnackbar } from "notistack";

import {
    ChatBubbleProps,
    ChatFileAttachment,
    ConversationSummaryResponse,
    SpecialInput,
} from "#root/interfaces/chatbot";
import { ServiceDomainProps } from "#root/interfaces/domain";
import ChatbotService, { PatchChatDataBody } from "#root/services/api/chatbot";
import { downloadBase64File } from "#root/utils/fileDownloadHelper";

import { processDomainFailure } from "./helper";

export interface ChatData {
    chat_history: ChatBubbleProps[];
    chat_state: number;
    chat_pending: boolean;
    chat_special_inputs: SpecialInput[];
}

const FAILURE_CHAT_DATA: ChatData = {
    chat_history: [],
    chat_state: 0,
    chat_pending: false,
    chat_special_inputs: [],
};

export const fetchChatData = async (
    projectId: string,
    conversationId: string,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<ChatData> => {
    const api = new ChatbotService();
    return await api
        .getChatHistory({ project_id: projectId, conversation_id: conversationId })
        .then((res) => res?.data?.data ?? FAILURE_CHAT_DATA)
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return FAILURE_CHAT_DATA;
        });
};

export const updateChatHistory = async (
    body: PatchChatDataBody,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<void> => {
    const { hideSnackbar = true } = serviceDomainProps;
    const api = new ChatbotService();
    return await api
        .patchChatHistory(body)
        .then(() => {
            if (!hideSnackbar)
                enqueueSnackbar("Chat history saved successfully.", { variant: "success" });
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const uploadChatFiles = async (
    projectId: string,
    files: File[],
    serviceDomainProps: ServiceDomainProps = {}
): Promise<ChatFileAttachment[]> => {
    const api = new ChatbotService();
    return await api
        .uploadChatFiles({ project_id: projectId, files })
        .then((res) => res?.data?.data?.files ?? [])
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const downloadChatFile = async (
    projectId: string,
    fileId: string,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<void> => {
    const api = new ChatbotService();
    return await api
        .getChatFile({ project_id: projectId, file_id: fileId })
        .then((res) => {
            const file = res?.data?.data;
            if (!file) return;
            downloadBase64File(file.data, file.file_name, file.content_type);
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const fetchConversations = async (
    projectId: string,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<ConversationSummaryResponse[]> => {
    const api = new ChatbotService();
    return await api
        .listConversations({ project_id: projectId })
        .then((res) => res?.data?.data?.conversations ?? [])
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return [];
        });
};

export const createConversation = async (
    projectId: string,
    conversationName?: string,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<(ConversationSummaryResponse & ChatData) | undefined> => {
    const api = new ChatbotService();
    return await api
        .createConversation({ project_id: projectId, conversation_name: conversationName })
        .then((res) => res?.data?.data)
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const renameConversation = async (
    projectId: string,
    conversationId: string,
    conversationName: string,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<void> => {
    const api = new ChatbotService();
    return await api
        .renameConversation({
            project_id: projectId,
            conversation_id: conversationId,
            conversation_name: conversationName,
        })
        .then(() => undefined)
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const deleteConversation = async (
    projectId: string,
    conversationId: string,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<void> => {
    const api = new ChatbotService();
    return await api
        .deleteConversation({ project_id: projectId, conversation_id: conversationId })
        .then(() => undefined)
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};
