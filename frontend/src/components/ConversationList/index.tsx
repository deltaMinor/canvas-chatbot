import React from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

import DialogConfirmContent from "#root/components/DialogConfirm/DialogConfirmContent";
import MuiDialog from "#root/components/MuiDialog";
import { ConversationListItem, ConversationsPanelProps } from "#root/interfaces/chatbot";
import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";

const formatTimestamp = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const conversationLabel = (conversation: ConversationListItem): string =>
    conversation.conversation_name?.trim() || `Conversation ${conversation.index}`;

const messageCountLabel = (count: number): string => `${count} message${count === 1 ? "" : "s"}`;

const ConversationList = ({
    conversations,
    isBusy = false,
    onSelect,
    onCreate,
    onRename,
    onDelete,
}: ConversationsPanelProps) => {
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editingValue, setEditingValue] = React.useState("");
    const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);

    const startEditing = (e: React.MouseEvent, conversation: ConversationListItem) => {
        e.stopPropagation();
        setEditingId(conversation.conversation_id);
        setEditingValue(conversation.conversation_name?.trim() || "");
    };

    const cancelEditing = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditingId(null);
        setEditingValue("");
    };

    const commitEditing = (e: React.MouseEvent | React.KeyboardEvent, conversationId: string) => {
        e.stopPropagation();
        void onRename(conversationId, editingValue);
        setEditingId(null);
        setEditingValue("");
    };

    const handleRequestDelete = (e: React.MouseEvent, conversationId: string) => {
        e.stopPropagation();
        setPendingDeleteId(conversationId);
    };

    const pendingDeleteConversation = conversations.find(
        (conversation) => conversation.conversation_id === pendingDeleteId
    );

    const deleteConfirmProps: ConfirmDialogProps = {
        stateKey: "confirmDeleteChatbotConversation",
        title: "Delete conversation?",
        message: pendingDeleteConversation
            ? `Are you sure you want to delete "${conversationLabel(pendingDeleteConversation)}"? This will permanently remove its chat history and cannot be undone.`
            : "Are you sure you want to delete this conversation? This cannot be undone.",
        onClick: async () => {
            if (pendingDeleteId) void onDelete(pendingDeleteId);
        },
    };

    return (
        <div className="chat-conversations-panel">
            <div className="chat-conversations-panel__list">
                {conversations.length === 0 ? (
                    <div className="chat-conversations-panel__empty">
                        No conversations yet. Start a new one below.
                    </div>
                ) : (
                    conversations.map((conversation) => {
                        const isEditing = editingId === conversation.conversation_id;
                        return (
                            <div
                                key={conversation.conversation_id}
                                className={`chat-conversation-row ${
                                    conversation.isActive ? "chat-conversation-row--active" : ""
                                }`}
                                onClick={() => !isEditing && onSelect(conversation.conversation_id)}
                            >
                                <div className="chat-conversation-row__info">
                                    {isEditing ? (
                                        <input
                                            autoFocus
                                            className="chat-conversation-row__name-input"
                                            value={editingValue}
                                            placeholder={`Conversation ${conversation.index}`}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter")
                                                    commitEditing(e, conversation.conversation_id);
                                                if (e.key === "Escape") cancelEditing();
                                            }}
                                        />
                                    ) : (
                                        <span className="chat-conversation-row__title">
                                            {conversationLabel(conversation)}
                                        </span>
                                    )}
                                    <span className="chat-conversation-row__timestamps">
                                        Created {formatTimestamp(conversation.created_at)} · Updated{" "}
                                        {formatTimestamp(conversation.updated_at)} ·{" "}
                                        {messageCountLabel(conversation.message_count)}
                                    </span>
                                </div>
                                <div className="chat-conversation-row__actions">
                                    {isEditing ? (
                                        <>
                                            <button
                                                className="chat-conversation-row__icon-btn chat-conversation-row__icon-btn--confirm"
                                                onClick={(e) =>
                                                    commitEditing(e, conversation.conversation_id)
                                                }
                                                title="Save name"
                                            >
                                                <CheckRoundedIcon sx={{ fontSize: 16 }} />
                                            </button>
                                            <button
                                                className="chat-conversation-row__icon-btn"
                                                onClick={cancelEditing}
                                                title="Cancel"
                                            >
                                                <CloseRoundedIcon sx={{ fontSize: 16 }} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="chat-conversation-row__icon-btn"
                                                onClick={(e) => startEditing(e, conversation)}
                                                title="Rename conversation"
                                            >
                                                <EditRoundedIcon sx={{ fontSize: 16 }} />
                                            </button>
                                            <button
                                                className="chat-conversation-row__icon-btn chat-conversation-row__icon-btn--delete"
                                                onClick={(e) =>
                                                    handleRequestDelete(
                                                        e,
                                                        conversation.conversation_id
                                                    )
                                                }
                                                title="Delete conversation"
                                            >
                                                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <button
                className="chat-conversations-panel__new-btn"
                onClick={() => void onCreate()}
                disabled={isBusy}
            >
                <AddRoundedIcon sx={{ fontSize: 16 }} />
                New conversation
            </button>

            <MuiDialog
                open={!!pendingDeleteId}
                onClose={() => setPendingDeleteId(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogConfirmContent
                    handleCloseDialog={() => setPendingDeleteId(null)}
                    prop={deleteConfirmProps}
                />
            </MuiDialog>
        </div>
    );
};

export default React.memo(ConversationList);
