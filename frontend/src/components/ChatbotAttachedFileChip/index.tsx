import React from "react";

import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";

interface ChatbotAttachedFileChipProps {
    fileName: string;
    onDownload: () => void;
}

const ChatbotAttachedFileChip = ({ fileName, onDownload }: ChatbotAttachedFileChipProps) => {
    return (
        <button
            className="chat-file-chip chat-file-chip--attachment"
            onClick={onDownload}
            title={`Download ${fileName}`}
        >
            <InsertDriveFileRoundedIcon sx={{ fontSize: 13 }} />
            <span className="chat-file-chip__name">{fileName}</span>
        </button>
    );
};

export type { ChatbotAttachedFileChipProps };
export default React.memo(ChatbotAttachedFileChip);
