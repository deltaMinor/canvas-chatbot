import { forwardRef, useImperativeHandle, useRef } from "react";

import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import { enqueueSnackbar } from "notistack";

import ChatbotCommandBox from "#root/components/ChatbotCommandBox";
import ChatbotConversationBody from "#root/components/ChatbotConversationBody";
import ChatbotFileDropOverlay from "#root/components/ChatbotFileDropOverlay";
import ChatbotHeader from "#root/components/ChatbotHeader";
import ConversationList from "#root/components/ConversationList";
import { useChatSession } from "#root/hooks/chatbot/useChatSession";
import { useDragDrop } from "#root/hooks/chatbot/useDragDrop";
import {
    ChatMessage,
    ChatbotHandle,
    ChatbotProps,
    HandleInputFn,
    HandleInputFnOutput,
} from "#root/interfaces/chatbot";

const defaultHandleInput: HandleInputFn = (input: ChatMessage): HandleInputFnOutput => {
    const parts: string[] = ["HandleInputFn empty. Reusing dummy handler.\n"];
    if (input.text) parts.push(`Echo: ${input.text}`);
    if (input.files?.length === 1) parts.push(`(file attached: ${input.files[0]?.name})`);
    else if (input.files && input.files.length > 1)
        parts.push(
            `(${input.files.length} files attached: ${input.files.map((f) => f.name).join(", ")})`
        );
    return { messages: [{ text: parts.join("\n") || "—" }] };
};

export const Chatbot = forwardRef<ChatbotHandle, ChatbotProps>(
    (
        {
            handleInput = defaultHandleInput,
            onAbort,
            initialMessages,
            initialSpecialInputs,
            emptyStateText,
            getCommandDisabledCause = () => "Please wait for the current response to finish.",
            getPersistedState,
            onReconcile,
            onSave,
            onWaitingChange,
            onUploadFiles,
            onDownloadFile,
            onImportTopologyDiagram,
            onFullscreenChange,
            conversationsPanel,
        },
        ref
    ) => {
        const {
            isOpen,
            isFullscreen,
            showConversationList,
            handleToggle,
            handleFullscreenToggle,
            handleToggleConversationList,
            handleSelectConversation,
            messages,
            clearChat,
            isNewMessage,
            isWaiting,
            progressText,
            specialInputs,
            scrollRef,
            inputRef,
            commandString,
            setCommandString,
            pendingFiles,
            stageFiles,
            removeFile,
            handleKeyDown,
            handleSpecialInputClick,
            submitCommand,
            handleAbort,
        } = useChatSession({
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
            onFullscreenChange,
            onSelectConversation: conversationsPanel?.onSelect,
            onCommandDisabled: (cause) => enqueueSnackbar(cause, { variant: "error" }),
        });

        const activeConversation = conversationsPanel?.conversations.find(
            (conversation) => conversation.isActive
        );
        const activeConversationLabel = activeConversation
            ? activeConversation.conversation_name || `Conversation ${activeConversation.index}`
            : "AI Assistant";
        const headerTitle = showConversationList ? "Conversations" : activeConversationLabel;

        const fileInputRef = useRef<HTMLInputElement>(null);

        useImperativeHandle(ref, () => ({ clearChat }), [clearChat]);

        const { isDraggingOver, handleDragEnter, handleDragLeave, handleDrop } =
            useDragDrop(stageFiles);

        const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "copy";
        };

        // ── Render ──────────────────────────────────────────────────────────
        return (
            <div className="chat-root">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => stageFiles(e.target.files)}
                />

                {isOpen && (
                    <div
                        className={`chat-panel ${isDraggingOver ? "chat-panel--dragging" : ""} ${isFullscreen ? "chat-panel--fullscreen" : ""}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {/* Drag-over overlay */}
                        {isDraggingOver && <ChatbotFileDropOverlay />}

                        <ChatbotHeader
                            title={headerTitle}
                            isFullscreen={isFullscreen}
                            showConversationList={showConversationList}
                            hasConversationsPanel={!!conversationsPanel}
                            onHeaderClick={handleToggle}
                            onToggleConversationList={handleToggleConversationList}
                            onFullscreenToggle={handleFullscreenToggle}
                        />

                        {showConversationList && conversationsPanel ? (
                            <ConversationList
                                {...conversationsPanel}
                                onSelect={handleSelectConversation}
                            />
                        ) : (
                            <>
                                <ChatbotConversationBody
                                    scrollRef={scrollRef}
                                    messages={messages}
                                    emptyStateText={emptyStateText}
                                    onDownloadFile={onDownloadFile ?? (() => undefined)}
                                    onImportTopologyDiagram={
                                        onImportTopologyDiagram ?? (() => undefined)
                                    }
                                    isNewMessage={isNewMessage}
                                    isWaiting={isWaiting}
                                    progressText={progressText}
                                    specialInputs={specialInputs}
                                    onSpecialInputClick={handleSpecialInputClick}
                                />

                                <ChatbotCommandBox
                                    inputRef={inputRef}
                                    pendingFiles={pendingFiles}
                                    removeFile={removeFile}
                                    commandString={commandString}
                                    setCommandString={setCommandString}
                                    onKeyDown={handleKeyDown}
                                    onSubmit={() => void submitCommand()}
                                    onAttachClick={() => fileInputRef.current?.click()}
                                    onAbortClick={() => void handleAbort()}
                                    isWaiting={isWaiting}
                                />
                            </>
                        )}
                    </div>
                )}

                {/* Collapsed toggle */}
                {!isOpen && (
                    <button
                        className="chat-toggle-btn"
                        onClick={handleToggle}
                        title="Open AI Assistant"
                    >
                        <SmartToyRoundedIcon sx={{ fontSize: 22 }} />
                    </button>
                )}
            </div>
        );
    }
);

export default Chatbot;
