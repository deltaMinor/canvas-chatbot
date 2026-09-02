import { ChatMessage } from "#root/interfaces/chatbot";
import { IntentRXPanel } from "#root/services/domain/intentrx";

const INTENTRX_PANEL_DISPLAY_OPTIONS = {
    keepTitle: true,
    keepGuidance: false,
};

const INTENTRX_SECTION_LABEL_RE = /^(Response|Guidance)$/;

const formatIntentRXPanelText = (panel: IntentRXPanel): string => {
    let lines = panel.text.split("\n");

    if (!INTENTRX_PANEL_DISPLAY_OPTIONS.keepGuidance) {
        const guidanceIndex = lines.findIndex((line) => line.trim() === "Guidance");
        if (guidanceIndex !== -1) lines = lines.slice(0, guidanceIndex);
    }
    lines = lines.filter((line) => !INTENTRX_SECTION_LABEL_RE.test(line.trim()));

    while (lines.length && lines[0]?.trim() === "") lines.shift();
    while (lines.length && lines[lines.length - 1]?.trim() === "") lines.pop();

    const body = lines.join("\n");
    if (INTENTRX_PANEL_DISPLAY_OPTIONS.keepTitle && panel.title) {
        return body ? `${panel.title}\n\n${body}` : panel.title;
    }
    return body;
};

export const formatIntentRXPanels = (panels: IntentRXPanel[]): ChatMessage[] =>
    panels
        .map(formatIntentRXPanelText)
        .filter((text) => text.length > 0)
        .map((text) => ({ text }));

const TO_REPLACE_SETUP_PARAGRAPH = [
    "How would you like to continue?",
    "[1] Use one of the detected files",
    "[2] Provide a new absolute PDF path",
    "[3] Import from database (tm_ad_db)",
    "[4] Continue from previous run",
    "[5] Continue without a diagram",
].join("\n");

const REPLACEMENT_SETUP_PARAGRAPH = [
    "How would you like to continue?",
    "[1] Continue from previous run",
    "[2] Continue without a diagram",
    "[3] Import from current project database",
    "[4] Upload PDF file",
].join("\n");

const addMenuOptions = (input: string): string => {
    return input.split(TO_REPLACE_SETUP_PARAGRAPH).join(REPLACEMENT_SETUP_PARAGRAPH);
};

export const formatSetupTopologyPanels = (messages: ChatMessage[]): ChatMessage[] =>
    messages.map((message) =>
        message.text?.includes(TO_REPLACE_SETUP_PARAGRAPH)
            ? { text: addMenuOptions(message.text) }
            : message
    );
