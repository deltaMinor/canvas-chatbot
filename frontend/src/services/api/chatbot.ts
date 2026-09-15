import axios from "axios";

import { AxiosApiResponse } from "#root/interfaces";
import {
    ChatBubbleProps,
    ChatFileAttachment,
    ConversationSummaryResponse,
    SpecialInput,
} from "#root/interfaces/chatbot";
import {
    AD_API_URL_PREFIX,
    SINGLE_ORIGIN_SERVER_BASE_URL,
    baseHeaders,
} from "#root/lib/http-common";

import { setupApiInterceptors } from "./tokenRefresh";

const baseURL = `${SINGLE_ORIGIN_SERVER_BASE_URL}/${AD_API_URL_PREFIX}`;

const axios_json_api = axios.create({ baseURL, headers: { ...baseHeaders } });
const axios_multipart_api = axios.create({
    baseURL,
    headers: { ...baseHeaders, "Content-type": "multipart/form-data" },
});

setupApiInterceptors(axios_json_api);
setupApiInterceptors(axios_multipart_api);

export interface PatchChatDataBody {
    project_id: string;
    conversation_id: string;
    chat_history: ChatBubbleProps[];
    chat_state: number;
    chat_pending: boolean;
    chat_special_inputs?: SpecialInput[];
}

export interface ChatFileDownload extends ChatFileAttachment {
    data: string;
}

export interface ConversationChatData {
    chat_history: ChatBubbleProps[];
    chat_state: number;
    chat_pending: boolean;
    chat_special_inputs: SpecialInput[];
}

class ChatbotService {
    async getChatHistory({
        project_id,
        conversation_id,
    }: {
        project_id: string;
        conversation_id: string;
    }): Promise<AxiosApiResponse<ConversationChatData>> {
        return await axios_json_api.get("chat_history", {
            params: { project_id, conversation_id },
        });
    }

    async patchChatHistory(body: PatchChatDataBody): Promise<AxiosApiResponse> {
        return await axios_json_api.patch("chat_history", body);
    }

    async uploadChatFiles({
        project_id,
        files,
    }: {
        project_id: string;
        files: File[];
    }): Promise<AxiosApiResponse<{ files: ChatFileAttachment[] }>> {
        const formData = new FormData();
        formData.append("project_id", project_id);
        files.forEach((file) => formData.append("file", file));
        return await axios_multipart_api.post("chat_history/file", formData);
    }

    async getChatFile({
        project_id,
        file_id,
    }: {
        project_id: string;
        file_id: string;
    }): Promise<AxiosApiResponse<ChatFileDownload>> {
        return await axios_json_api.get("chat_history/file", {
            params: { project_id, file_id },
        });
    }

    async listConversations({
        project_id,
    }: {
        project_id: string;
    }): Promise<AxiosApiResponse<{ conversations: ConversationSummaryResponse[] }>> {
        return await axios_json_api.get("chat_history/conversations", {
            params: { project_id },
        });
    }

    async createConversation({
        project_id,
        conversation_name,
    }: {
        project_id: string;
        conversation_name?: string | undefined;
    }): Promise<AxiosApiResponse<ConversationSummaryResponse & ConversationChatData>> {
        return await axios_json_api.post("chat_history/conversations", {
            project_id,
            conversation_name,
        });
    }

    async renameConversation({
        project_id,
        conversation_id,
        conversation_name,
    }: {
        project_id: string;
        conversation_id: string;
        conversation_name: string;
    }): Promise<AxiosApiResponse<{ conversation_id: string; conversation_name: string }>> {
        return await axios_json_api.patch("chat_history/conversation", {
            project_id,
            conversation_id,
            conversation_name,
        });
    }

    async deleteConversation({
        project_id,
        conversation_id,
    }: {
        project_id: string;
        conversation_id: string;
    }): Promise<AxiosApiResponse<{ conversation_id: string }>> {
        return await axios_json_api.delete("chat_history/conversation", {
            data: { project_id, conversation_id },
        });
    }
}

export default ChatbotService;
