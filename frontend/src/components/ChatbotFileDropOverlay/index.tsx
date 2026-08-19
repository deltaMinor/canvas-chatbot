import React from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";

const ChatbotFileDropOverlay = () => {
    return (
        <div className="chat-drop-overlay">
            <div className="chat-drop-overlay__icon">
                <AddRoundedIcon sx={{ fontSize: 32 }} />
            </div>
            <span className="chat-drop-overlay__label">Drop files to attach</span>
        </div>
    );
};

export default React.memo(ChatbotFileDropOverlay);
