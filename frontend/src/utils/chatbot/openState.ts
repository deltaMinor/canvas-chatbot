import { ChatbotOpenState } from "#root/enums/chatbot";

const CHATBOT_OPEN_STATE_KEY = "chatbot_panel_state";

export const getChatbotOpenStateFromStore = (): ChatbotOpenState => {
    try {
        const stored = localStorage.getItem(CHATBOT_OPEN_STATE_KEY);
        if (stored === ChatbotOpenState.Open || stored === ChatbotOpenState.Fullscreen) {
            return stored;
        }
        return ChatbotOpenState.Closed;
    } catch {
        return ChatbotOpenState.Closed;
    }
};

export const setChatbotOpenStateInStore = (state: ChatbotOpenState): void => {
    try {
        localStorage.setItem(CHATBOT_OPEN_STATE_KEY, state);
    } catch {
        // localStorage unavailable (e.g. private browsing quota exceeded) — ignore.
    }
};
