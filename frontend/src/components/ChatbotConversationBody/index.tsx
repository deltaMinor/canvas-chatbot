import { RefObject } from "react";

import ChatbotMessageList from "#root/components/ChatbotMessageList";
import { ChatBubbleProps, SpecialInput } from "#root/interfaces/chatbot";

interface ChatbotConversationBodyProps {
    scrollRef: RefObject<HTMLDivElement | null>;
    messages: ChatBubbleProps[];
    emptyStateText?: string | undefined;
    onDownloadFile: (fileId: string, fileName: string) => void;
    onImportTopologyDiagram: (address: string) => void;
    isWaiting: boolean;
    progressText: string;
    specialInputs?: SpecialInput[] | undefined;
    onSpecialInputClick: (special: SpecialInput) => void;
    isNewMessage?: ((id: number) => boolean) | undefined;
}

const ChatbotConversationBody = ({
    scrollRef,
    messages,
    emptyStateText,
    onDownloadFile,
    onImportTopologyDiagram,
    isWaiting,
    progressText,
    specialInputs,
    onSpecialInputClick,
    isNewMessage,
}: ChatbotConversationBodyProps) => {
    const showSpecialInputs =
        !isWaiting &&
        specialInputs &&
        specialInputs.length > 0 &&
        messages.length > 0 &&
        messages[messages.length - 1]?.type === "response";

    return (
        <>
            {/* Progress bar — extends from beneath the header while waiting on a response */}
            {isWaiting && !!progressText && (
                <div className="chat-progress-bar">
                    <div className="chat-progress-bar__fill" />
                    {progressText && (
                        <span className="chat-progress-bar__text">{progressText}</span>
                    )}
                </div>
            )}

            {/* Message log */}
            <div
                ref={scrollRef}
                className="chat-scroll"
            >
                <ChatbotMessageList
                    messages={messages}
                    emptyStateText={emptyStateText}
                    onDownloadFile={onDownloadFile}
                    onImportTopologyDiagram={onImportTopologyDiagram}
                    isNewMessage={isNewMessage}
                />
                {showSpecialInputs && (
                    <div className="chat-special-inputs">
                        {specialInputs!.map((special, i) => (
                            <button
                                key={`${special.input}-${i}`}
                                className="chat-special-input-btn"
                                onClick={() => onSpecialInputClick(special)}
                            >
                                {special.label}
                            </button>
                        ))}
                    </div>
                )}
                {isWaiting && (
                    <div className="chat-message chat-message--response">
                        <div className="chat-message__bubble chat-typing-bubble">
                            <span className="chat-typing-dot" />
                            <span className="chat-typing-dot" />
                            <span className="chat-typing-dot" />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export type { ChatbotConversationBodyProps };
export default ChatbotConversationBody;
