export interface ChatFileAttachment {
    file_id: string;
    file_name: string;
    content_type?: string;
}

export interface ChatMessage {
    text?: string;
    files?: File[];
    topology_diagram_address?: string;
}

export interface ChatBubbleProps {
    id: number;
    type: "command" | "response";
    text: string;
    timestamp: string;
    files?: ChatFileAttachment[];
    topology_diagram_address?: string;
}

export type ProgressReporter = (progressText: string) => void;

export interface SpecialInput {
    label: string;
    input: string;
}

export interface HandleInputFnOutput {
    messages: ChatMessage[];
    inputs?: SpecialInput[];
}

export type HandleInputFn = (
    input: ChatMessage,
    onProgress: ProgressReporter
) => HandleInputFnOutput | Promise<HandleInputFnOutput>;

export interface ChatbotHandle {
    clearChat: () => void;
}

export type AbortInputFn = () => string | Promise<string>;

export interface ConversationSummary {
    conversation_id: string;
    conversation_name: string;
    created_at: string;
}

export interface ConversationSummaryResponse extends ConversationSummary {
    updated_at: string;
    message_count: number;
}

export interface ConversationListItem {
    conversation_id: string;
    conversation_name: string;
    created_at: string;
    updated_at: string;
    message_count: number;
    index: number;
    isActive: boolean;
}

export interface ConversationsPanelProps {
    conversations: ConversationListItem[];
    isBusy?: boolean;
    onSelect: (conversationId: string) => void;
    onCreate: () => void | Promise<void>;
    onRename: (conversationId: string, conversationName: string) => void | Promise<void>;
    onDelete: (conversationId: string) => void | Promise<void>;
}

export interface PersistedChatState {
    messages: ChatBubbleProps[];
    isWaiting: boolean;
    specialInputs?: SpecialInput[];
}

export interface ReconcileResult {
    appendMessages: ChatMessage[];
    isWaiting: boolean;
}

export interface ChatbotProps {
    handleInput?: HandleInputFn;
    onAbort?: AbortInputFn;
    initialMessages?: ChatMessage[];
    initialSpecialInputs?: SpecialInput[];
    emptyStateText?: string;

    getCommandDisabledCause?: () => string;

    getPersistedState?: () => PersistedChatState;

    onReconcile: (onProgress: ProgressReporter) => Promise<ReconcileResult>;

    onSave?: (messages: ChatBubbleProps[]) => void | Promise<void>;

    onWaitingChange?: (
        isWaiting: boolean,
        messages: ChatBubbleProps[],
        specialInputs?: SpecialInput[]
    ) => void | Promise<void>;

    onUploadFiles?: (files: File[]) => Promise<ChatFileAttachment[]>;

    onDownloadFile?: (fileId: string, fileName: string) => void;

    onImportTopologyDiagram?: (address: string) => void;

    conversationsPanel?: ConversationsPanelProps;
}
