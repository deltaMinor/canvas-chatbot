import { ChatBubbleProps, ConversationSummary, SpecialInput } from "#root/interfaces/chatbot";

import { getBackendProjectDiagramFromStore, setBackendProjectDiagram } from "./backend";

export interface StoredConversation extends ConversationSummary {
    chat_history?: ChatBubbleProps[];
    chat_state?: number;
    chat_pending?: boolean;
    chat_special_inputs?: SpecialInput[];
}

type ProjectDiagramWithConversations = ReturnType<typeof getBackendProjectDiagramFromStore> & {
    conversations?: StoredConversation[];
};

export const getConversationsFromStore = (): StoredConversation[] => {
    try {
        const projectDiagram =
            getBackendProjectDiagramFromStore() as ProjectDiagramWithConversations;
        return projectDiagram?.conversations ?? [];
    } catch {
        return [];
    }
};

const setConversationsInStore = (conversations: StoredConversation[]): void => {
    const projectDiagram = getBackendProjectDiagramFromStore() as ProjectDiagramWithConversations;
    setBackendProjectDiagram({
        ...projectDiagram,
        conversations,
    } as ProjectDiagramWithConversations);
};

export const getConversationFromStore = (conversationId: string): StoredConversation | undefined =>
    getConversationsFromStore().find(
        (conversation) => conversation.conversation_id === conversationId
    );

/** Adds a brand new conversation, or replaces an existing one with the same id. */
export const upsertConversationInStore = (conversation: StoredConversation): void => {
    const conversations = getConversationsFromStore();
    const index = conversations.findIndex(
        (existing) => existing.conversation_id === conversation.conversation_id
    );
    if (index === -1) {
        setConversationsInStore([...conversations, conversation]);
    } else {
        const next = [...conversations];
        next[index] = conversation;
        setConversationsInStore(next);
    }
};

export const removeConversationFromStore = (conversationId: string): void => {
    setConversationsInStore(
        getConversationsFromStore().filter(
            (conversation) => conversation.conversation_id !== conversationId
        )
    );
};

const patchConversationInStore = (
    conversationId: string,
    patch: Partial<StoredConversation>
): void => {
    const conversations = getConversationsFromStore();
    const index = conversations.findIndex(
        (conversation) => conversation.conversation_id === conversationId
    );
    if (index === -1) {
        // Defensive fallback: keep the write instead of silently dropping it,
        // in case this conversation hasn't been added to the store yet.
        const now = new Date().toISOString();
        setConversationsInStore([
            ...conversations,
            { conversation_id: conversationId, conversation_name: "", created_at: now, ...patch },
        ]);
        return;
    }
    const next = [...conversations];
    next[index] = { ...next[index], ...patch } as StoredConversation;
    setConversationsInStore(next);
};

export const getChatHistoryFromStore = (conversationId: string): ChatBubbleProps[] =>
    getConversationFromStore(conversationId)?.chat_history ?? [];

export const setChatHistoryInStore = (
    conversationId: string,
    messages: ChatBubbleProps[]
): void => {
    patchConversationInStore(conversationId, { chat_history: messages });
};

export const getChatStateFromStore = (conversationId: string): number =>
    getConversationFromStore(conversationId)?.chat_state ?? 0;

export const setChatStateInStore = (conversationId: string, chatState: number): void => {
    patchConversationInStore(conversationId, { chat_state: chatState });
};

export const getChatPendingFromStore = (conversationId: string): boolean =>
    getConversationFromStore(conversationId)?.chat_pending ?? false;

export const setChatPendingInStore = (conversationId: string, chatPending: boolean): void => {
    patchConversationInStore(conversationId, { chat_pending: chatPending });
};

export const getChatSpecialInputsFromStore = (conversationId: string): SpecialInput[] =>
    getConversationFromStore(conversationId)?.chat_special_inputs ?? [];

export const setChatSpecialInputsInStore = (
    conversationId: string,
    specialInputs: SpecialInput[]
): void => {
    patchConversationInStore(conversationId, { chat_special_inputs: specialInputs });
};

export const setConversationNameInStore = (
    conversationId: string,
    conversationName: string
): void => {
    patchConversationInStore(conversationId, { conversation_name: conversationName });
};
