import { getConversationsFromStore } from "#root/stores/projectDiagramFeatureStore";
import { getActiveConversationId } from "#root/utils/chatbot/activeConversation";

export const resolveInitialConversationId = (projectId: string): string => {
    const conversations = getConversationsFromStore();
    const remembered = projectId ? getActiveConversationId(projectId) : undefined;
    if (remembered && conversations.some((conv) => conv.conversation_id === remembered)) {
        return remembered;
    }
    return conversations[0]?.conversation_id ?? "";
};
