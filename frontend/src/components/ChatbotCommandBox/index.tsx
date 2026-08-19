import React, { RefObject } from "react";

import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";

import ChatbotStagedFileChip from "#root/components/ChatbotStagedFileChip";

interface ChatbotCommandBoxProps {
    inputRef: RefObject<HTMLInputElement | null>;
    pendingFiles: File[];
    removeFile: (index: number) => void;
    commandString: string;
    setCommandString: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onAttachClick: () => void;
    onAbortClick: () => void;
    isWaiting: boolean;
}

const ChatbotCommandBox = ({
    inputRef,
    pendingFiles,
    removeFile,
    commandString,
    setCommandString,
    onKeyDown,
    onSubmit,
    onAttachClick,
    onAbortClick,
    isWaiting,
}: ChatbotCommandBoxProps) => {
    return (
        <>
            {/* Staged file chips */}
            {pendingFiles.length > 0 && (
                <div className="chat-chips">
                    {pendingFiles.map((file, i) => (
                        <ChatbotStagedFileChip
                            key={`${file.name}-${i}`}
                            file={file}
                            onRemove={() => removeFile(i)}
                        />
                    ))}
                </div>
            )}

            {/* Input area */}
            <div className="chat-input-area">
                <input
                    ref={inputRef}
                    className="chat-input"
                    autoFocus
                    placeholder={
                        pendingFiles.length > 0 ? "Add a message or send files…" : "Type a message…"
                    }
                    value={commandString}
                    onChange={(e) => setCommandString(e.target.value)}
                    onKeyDown={onKeyDown}
                />
                <button
                    className="chat-icon-btn chat-icon-btn--abort"
                    onClick={onAbortClick}
                    disabled={!isWaiting}
                    title="Abort current response"
                >
                    <StopRoundedIcon sx={{ fontSize: 17 }} />
                </button>
                <button
                    className={`chat-icon-btn ${pendingFiles.length > 0 ? "chat-icon-btn--paperclip-active" : ""}`}
                    onClick={onAttachClick}
                    title="Attach file(s)"
                >
                    <AttachFileRoundedIcon sx={{ fontSize: 17 }} />
                </button>
                <button
                    className="chat-icon-btn chat-icon-btn--send"
                    onClick={onSubmit}
                    disabled={isWaiting}
                    title="Send message"
                >
                    <SendRoundedIcon sx={{ fontSize: 17 }} />
                </button>
            </div>
        </>
    );
};

export type { ChatbotCommandBoxProps };
export default ChatbotCommandBox;
