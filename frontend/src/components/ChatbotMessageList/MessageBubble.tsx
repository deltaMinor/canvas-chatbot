import ChatbotAttachedFileChip from "#root/components/ChatbotAttachedFileChip";
import ChatbotTopologyDiagramChip from "#root/components/ChatbotTopologyDiagramChip";
import { ChatBubbleProps } from "#root/interfaces/chatbot";

interface MessageBubbleProps {
    msg: ChatBubbleProps;
    onDownloadFile: (fileId: string, fileName: string) => void;
    onImportTopologyDiagram: (address: string) => void;
    isNewTopologyDiagram?: boolean;
}

export const MessageBubble = ({
    msg,
    onDownloadFile,
    onImportTopologyDiagram,
    isNewTopologyDiagram = false,
}: MessageBubbleProps) => {
    const isCmd = msg.type === "command";
    return (
        <div
            className={`chat-message ${isCmd ? "chat-message--command" : "chat-message--response"}`}
        >
            {msg.text && <div className="chat-message__bubble">{msg.text}</div>}
            {msg.files && msg.files.length > 0 && (
                <div className="chat-message__attachments">
                    {msg.files.map((f) => (
                        <ChatbotAttachedFileChip
                            key={f.file_id}
                            fileName={f.file_name}
                            onDownload={() => onDownloadFile(f.file_id, f.file_name)}
                        />
                    ))}
                </div>
            )}
            {msg.topology_diagram_address && (
                <div className="chat-message__attachments">
                    <ChatbotTopologyDiagramChip
                        onClick={() => onImportTopologyDiagram(msg.topology_diagram_address!)}
                        isNew={isNewTopologyDiagram}
                    />
                </div>
            )}
            <span className="chat-message__timestamp">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </span>
        </div>
    );
};
