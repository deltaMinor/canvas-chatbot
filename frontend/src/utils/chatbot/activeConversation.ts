import { appendToProjectLocalStorage, getFromProjectLocalStorage } from "#root/utils/localStorage";

const ACTIVE_CONVERSATION_KEY = "chatbot_active_conversation_id";

export const getActiveConversationId = (projectId: string): string | undefined =>
    getFromProjectLocalStorage(projectId, ACTIVE_CONVERSATION_KEY);

export const setActiveConversationId = (projectId: string, conversationId: string): void => {
    appendToProjectLocalStorage(projectId, ACTIVE_CONVERSATION_KEY, conversationId);
};
