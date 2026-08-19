import React from "react";

import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";

interface ChatbotHeaderProps {
    title: string;
    isFullscreen: boolean;
    showConversationList: boolean;
    hasConversationsPanel: boolean;
    onHeaderClick: () => void;
    onToggleConversationList: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onFullscreenToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ChatbotHeader = ({
    title,
    isFullscreen,
    showConversationList,
    hasConversationsPanel,
    onHeaderClick,
    onToggleConversationList,
    onFullscreenToggle,
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
            <div className="chat-header__actions">
                <button
                    className="chat-header__fullscreen-btn"
                    onClick={onFullscreenToggle}
                    title={isFullscreen ? "Exit fullscreen" : "Maximise"}
                >
                    {isFullscreen ? (
                        <CloseFullscreenRoundedIcon sx={{ fontSize: 15 }} />
                    ) : (
                        <OpenInFullRoundedIcon sx={{ fontSize: 15 }} />
                    )}
                </button>
                <div className="chat-header__chevron">
                    <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
                </div>
            </div>
        </div>
    );
};

export type { ChatbotHeaderProps };
export default React.memo(ChatbotHeader);
