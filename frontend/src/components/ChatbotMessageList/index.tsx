import React from "react";

import { ChatBubbleProps } from "#root/interfaces/chatbot";

import { MessageBubble } from "./MessageBubble";

interface ChatbotMessageListProps {
    messages: ChatBubbleProps[];
    emptyStateText?: string | undefined;
    onDownloadFile: (fileId: string, fileName: string) => void;
    onImportTopologyDiagram: (address: string) => void;
    isNewMessage?: ((id: number) => boolean) | undefined;
}

const ChatbotMessageList = ({
    messages,
    emptyStateText = "Ask me anything.",
    onDownloadFile,
    onImportTopologyDiagram,
    isNewMessage,
}: ChatbotMessageListProps) => {
    if (messages.length === 0) {
        return <div className="chat-empty"> {emptyStateText} </div>;
    }
    return (
        <>
            {messages.map((msg) => (
                <MessageBubble
                    key={msg["id"]}
                    msg={msg}
                    onDownloadFile={onDownloadFile}
                    onImportTopologyDiagram={onImportTopologyDiagram}
                    isNewTopologyDiagram={isNewMessage?.(msg.id) ?? false}
                />
            ))}
        </>
    );
};

export type { ChatbotMessageListProps };
export default React.memo(ChatbotMessageList);
