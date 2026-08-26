import { forwardRef, useImperativeHandle, useRef } from "react";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
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
            conversationsPanel,
        },
        ref
    ) => {
        const {
            isOpen,
            showConversationList,
            handleToggle,
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
            <div className="chat-sidebar-root">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => stageFiles(e.target.files)}
                />

                <div
                    className={`chat-panel ${isOpen ? "chat-panel--open" : ""} ${isDraggingOver ? "chat-panel--dragging" : ""}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {isOpen && (
                        <div className="chat-panel__inner">
                            {/* Drag-over overlay */}
                            {isDraggingOver && <ChatbotFileDropOverlay />}

                            <ChatbotHeader
                                title={headerTitle}
                                showConversationList={showConversationList}
                                hasConversationsPanel={!!conversationsPanel}
                                onHeaderClick={handleToggle}
                                onToggleConversationList={handleToggleConversationList}
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
                </div>

                {/* Edge toggle tab — stays attached to the panel's trailing edge */}
                {
                    <button
                        className="chat-toggle-tab"
                        onClick={handleToggle}
                        title={isOpen ? "Collapse AI Assistant" : "Open AI Assistant"}
                    >
                        {isOpen ? (
                            <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
                        ) : (
                            <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                        )}
                    </button>
                }
            </div>
        );
    }
);

export default Chatbot;
