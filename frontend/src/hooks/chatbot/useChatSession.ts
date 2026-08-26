import { useEffect, useRef, useState } from "react";

import { MSG_ABORTED } from "#root/constants/chatbot";
import { ChatbotOpenState } from "#root/enums/chatbot";
import {
    AbortInputFn,
    ChatBubbleProps,
    ChatFileAttachment,
    ChatMessage,
    HandleInputFn,
    HandleInputFnOutput,
    PersistedChatState,
    ProgressReporter,
    ReconcileResult,
    SpecialInput,
} from "#root/interfaces/chatbot";
import {
    getChatbotOpenStateFromStore,
    setChatbotOpenStateInStore,
} from "#root/utils/chatbot/openState";

import { useChatBubbleProps } from "./useChatBubbleProps";
import { useFileAttachments } from "./useFileAttachments";

const EMPTY_PERSISTED_STATE: PersistedChatState = { messages: [], isWaiting: false };

interface UseChatSessionParams {
    handleInput: HandleInputFn;
    onAbort?: AbortInputFn | undefined;
    initialMessages?: ChatMessage[] | undefined;
    initialSpecialInputs?: SpecialInput[] | undefined;
    getCommandDisabledCause: () => string;
    getPersistedState?: (() => PersistedChatState) | undefined;
    onReconcile: (onProgress: ProgressReporter) => Promise<ReconcileResult>;
    onSave?: ((messages: ChatBubbleProps[]) => void | Promise<void>) | undefined;
    onWaitingChange?:
        | ((
              isWaiting: boolean,
              messages: ChatBubbleProps[],
              specialInputs?: SpecialInput[] | undefined
          ) => void | Promise<void>)
        | undefined;
    onUploadFiles?: ((files: File[]) => Promise<ChatFileAttachment[]>) | undefined;
    onSelectConversation?: ((conversationId: string) => void) | undefined;
    onCommandDisabled: (cause: string) => void;
}

export const useChatSession = ({
    handleInput,
    onAbort,
    initialMessages,
    initialSpecialInputs,
    getCommandDisabledCause,
    getPersistedState,
    onReconcile,
    onSave,
    onWaitingChange,
    onUploadFiles,
    onSelectConversation,
    onCommandDisabled,
}: UseChatSessionParams) => {
    const [commandString, setCommandString] = useState("");
    const [openState, setOpenState] = useState<ChatbotOpenState>(() =>
        getChatbotOpenStateFromStore()
    );
    const [showConversationList, setShowConversationList] = useState(false);

    const [persisted] = useState<PersistedChatState>(
        () => getPersistedState?.() ?? EMPTY_PERSISTED_STATE
    );
    const [isWaiting, setIsWaiting] = useState(persisted.isWaiting);
    const [progressText, setProgressText] = useState("");
    const [specialInputs, setSpecialInputs] = useState<SpecialInput[] | undefined>(() =>
        persisted.messages.length > 0 ? persisted.specialInputs : initialSpecialInputs
    );

    const isOpen = openState !== ChatbotOpenState.Closed;

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const activeRequestRef = useRef<{ aborted: boolean } | null>(null);

    const { pendingFiles, stageFiles, removeFile, clearFiles } = useFileAttachments();
    const { messages, clearChat, pushMessage, isNewMessage } = useChatBubbleProps(
        initialMessages,
        persisted.messages,
        onSave
    );

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, openState, isWaiting]);

    // If the chatbot was still awaiting a response the last time it was
    // saved, reconcile that with reality: e.g. an IntentRX session may
    // have kept running (or finished, or ended) while the user was
    // away. Runs once, only when there's something to reconcile.
    useEffect(() => {
        if (!persisted.isWaiting || !onReconcile) return;
        let cancelled = false;

        void onReconcile((nextProgressText) => {
            if (!cancelled) setProgressText(nextProgressText);
        }).then((result) => {
            if (cancelled) return;
            let latest = messages;
            for (const message of result.appendMessages) {
                latest = pushMessage(
                    "response",
                    message.text ?? "",
                    undefined,
                    message.topology_diagram_address
                );
            }
            setIsWaiting(result.isWaiting);
            setProgressText("");
            setSpecialInputs(undefined);
            void onWaitingChange?.(result.isWaiting, latest, undefined);
        });

        return () => {
            cancelled = true;
        };
        // Runs once on mount only -- `persisted` is a lazy initial
        // value and `messages`/`pushMessage` are stable across it.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submitCommand = async (overrideText?: string) => {
        const text = (overrideText ?? commandString).trim();
        const files = pendingFiles;
        if (!text && files.length === 0) return;

        if (isWaiting) {
            onCommandDisabled(getCommandDisabledCause());
            return;
        }

        const input: ChatMessage = {};
        if (text) input.text = text;
        if (files.length > 0) input.files = files;

        const uploadedFiles =
            files.length > 0 && onUploadFiles ? await onUploadFiles(files) : undefined;

        const messagesAfterCommand = pushMessage("command", text, uploadedFiles);

        setCommandString("");
        clearFiles();

        setProgressText("");
        setIsWaiting(true);
        setSpecialInputs(undefined);
        await onWaitingChange?.(true, messagesAfterCommand, undefined);

        const requestState = { aborted: false };
        activeRequestRef.current = requestState;

        let response: HandleInputFnOutput;
        try {
            response = await handleInput(input, (nextProgressText) =>
                setProgressText(nextProgressText)
            );
        } catch (err) {
            if (requestState.aborted) return;
            setIsWaiting(false);
            throw err;
        }

        if (requestState.aborted) {
            return;
        }
        if (activeRequestRef.current === requestState) activeRequestRef.current = null;
        setIsWaiting(false);

        let latest = messagesAfterCommand;
        for (const message of response.messages) {
            const responseFiles =
                message.files !== undefined && onUploadFiles
                    ? await onUploadFiles(message.files)
                    : undefined;
            latest = pushMessage(
                "response",
                message.text != undefined ? message.text : "",
                responseFiles,
                message.topology_diagram_address
            );
        }
        setSpecialInputs(response.inputs);
        // Flush again once the response(s) are in, clearing the waiting
        // flag in the same write so the two always stay consistent.
        await onWaitingChange?.(false, latest, response.inputs);

        inputRef.current?.focus();
    };

    const handleAbort = async () => {
        if (!isWaiting) return;

        const requestState = activeRequestRef.current;
        if (requestState) requestState.aborted = true;
        activeRequestRef.current = null;

        setProgressText("");
        setSpecialInputs(undefined);

        let abortText: string;
        try {
            abortText = (await onAbort?.()) ?? MSG_ABORTED;
        } catch {
            abortText = MSG_ABORTED;
        }

        const latest = pushMessage("response", abortText);
        setIsWaiting(false);
        await onWaitingChange?.(false, latest, undefined);

        inputRef.current?.focus();
    };

    // ── Event handlers ──────────────────────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") void submitCommand();
    };

    const handleSpecialInputClick = (special: SpecialInput) => {
        void submitCommand(special.input);
    };

    const handleToggle = () => {
        setOpenState((prev) => {
            const next =
                prev === ChatbotOpenState.Closed ? ChatbotOpenState.Open : ChatbotOpenState.Closed;
            setChatbotOpenStateInStore(next);
            if (next === ChatbotOpenState.Open) {
                setTimeout(() => inputRef.current?.focus(), 300);
            }
            return next;
        });
    };

    const handleToggleConversationList = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setShowConversationList((prev) => !prev);
    };

    const handleSelectConversation = (conversationId: string) => {
        setShowConversationList(false);
        onSelectConversation?.(conversationId);
    };

    return {
        // open / conversation-list state
        openState,
        isOpen,
        showConversationList,
        handleToggle,
        handleToggleConversationList,
        handleSelectConversation,

        // message session
        messages,
        clearChat,
        isNewMessage,
        isWaiting,
        progressText,
        specialInputs,
        scrollRef,
        inputRef,

        // composer
        commandString,
        setCommandString,
        pendingFiles,
        stageFiles,
        removeFile,
        handleKeyDown,
        handleSpecialInputClick,
        submitCommand,
        handleAbort,
    };
};
