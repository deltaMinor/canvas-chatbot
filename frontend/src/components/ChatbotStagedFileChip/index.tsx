import React from "react";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface ChatbotStagedFileChipProps {
    file: File;
    onRemove: () => void;
}

const ChatbotStagedFileChip = ({ file, onRemove }: ChatbotStagedFileChipProps) => {
    return (
        <div className="chat-file-chip">
            <span className="chat-file-chip__name">{file.name}</span>
            <button
                onClick={onRemove}
                title={`Remove ${file.name}`}
                className="chat-file-chip__remove"
            >
                <CloseRoundedIcon sx={{ fontSize: 12 }} />
            </button>
        </div>
    );
};

export type { ChatbotStagedFileChipProps };
export default React.memo(ChatbotStagedFileChip);
