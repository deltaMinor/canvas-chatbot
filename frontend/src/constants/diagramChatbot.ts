import { SpecialInput } from "#root/interfaces/chatbot";

export const MSG_HELP =
    "• /start onto: Starts an OntoPilot session\n" +
    "• /start intent: Starts an IntentRX session\n" +
    "• /start topology: Starts a TopologyGenerator session\n" +
    "• /clear chat: Clears chat history\n" +
    "• /clear diagram: Clear the canvas diagram\n" +
    "• /clear runs: Clear all stored run ids\n" +
    "• /clear all: Clear chat history, canvas diagram, and stored run ids\n" +
    "• /help: Send the list of available commands";
export const MSG_CONFIRM_CLEAR_CHAT =
    'This will clear the chat history, are you sure?\n(Enter "yes" to confirm)';
export const MSG_CONFIRM_CLEAR_DIAGRAM =
    'This will clear the current canvas diagram, are you sure?\n(Enter "yes" to confirm)';
export const MSG_CONFIRM_CLEAR_RUNS =
    'This will clear all stored run ids, are you sure?\n(Enter "yes" to confirm)';
export const MSG_CONFIRM_CLEAR_ALL =
    'This will clear the chat history, canvas diagram, and stored run ids, are you sure?\n(Enter "yes" to confirm)';

export const INPUT_HELP: SpecialInput = {
    label: "Command List: /help",
    input: "/help",
};
export const INPUT_LLM_ONTO: SpecialInput = {
    label: "Start OntoPilot Workflow: /start onto",
    input: "/start onto",
};
export const INPUT_LLM_INTENT: SpecialInput = {
    label: "Start IntentRX Workflow: /start intent",
    input: "/start intent",
};
export const INPUT_LLM_TOPOLOGY: SpecialInput = {
    label: "Start TopologyGenerator Workflow: /start topology",
    input: "/start topology",
};

export const MSG_INTENTRX_ABORTED = "IntentRX session aborted.";

export const TOPOLOGY_DATABASE_INPUT = "3";
export const TOPOLOGY_CONTINUE_INPUT = "4";
export const TOPOLOGY_CURRPROJ_INPUT = "6";
export const TOPOLOGY_DIRUPLOAD_INPUT = "7";

export const TOPOLOGY_CONTINUE_TITLE = "SETUP-RESUME-RUN";

export const TOPOLOGY_SETUP_TITLE = "SETUP-SOURCE";
export const TOPOLOGY_DATABASE_FILE_TITLE = "SETUP-DB-FILE";
