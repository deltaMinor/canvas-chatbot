import React from "react";

import SaveAlt from "@mui/icons-material/SaveAlt";

interface ChatbotTopologyDiagramChipProps {
    onClick: () => void;
    isNew?: boolean;
}

const ChatbotTopologyDiagramChip = ({
    onClick,
    isNew = false,
}: ChatbotTopologyDiagramChipProps) => {
    const [isPulsing, setIsPulsing] = React.useState(isNew);

    const handleClick = () => {
        if (isPulsing) setIsPulsing(false);
        onClick();
    };

    return (
        <button
            className={`chat-file-chip chat-file-chip--attachment ${isPulsing ? "chat-file-chip--pulsing" : ""}`}
            onClick={handleClick}
            title="Review and import the generated diagram"
        >
            <SaveAlt sx={{ fontSize: 13 }} />
            <span className="chat-file-chip__name">Import diagram</span>
        </button>
    );
};

export type { ChatbotTopologyDiagramChipProps };
export default React.memo(ChatbotTopologyDiagramChip);
