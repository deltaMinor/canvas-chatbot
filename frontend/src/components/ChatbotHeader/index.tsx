import React from "react";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

interface ChatbotHeaderProps {
    title: string;
    showConversationList: boolean;
    hasConversationsPanel: boolean;
    onHeaderClick: () => void;
    onToggleConversationList: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ChatbotHeader = ({
    title,
    showConversationList,
    hasConversationsPanel,
    onHeaderClick,
    onToggleConversationList,
}: ChatbotHeaderProps) => {
    return (
        <div
            className="chat-header"
            onClick={onHeaderClick}
        >
            <div className="chat-header__title-group">
                {hasConversationsPanel && (
                    <button
                        className={`chat-header__menu-btn ${
                            showConversationList ? "chat-header__menu-btn--active" : ""
                        }`}
                        onClick={onToggleConversationList}
                        title="Conversations"
                    >
                        <MenuRoundedIcon sx={{ fontSize: 17 }} />
                    </button>
                )}
                <span className="chat-header__title">{title}</span>
            </div>
        </div>
    );
};

export type { ChatbotHeaderProps };
export default React.memo(ChatbotHeader);
