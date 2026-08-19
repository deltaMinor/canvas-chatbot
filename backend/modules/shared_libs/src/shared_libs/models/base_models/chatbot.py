from typing import Literal

from pydantic import BaseModel, Field

__all__ = [
    "ChatFileAttachmentBaseModel",
    "ChatBubblePropsBaseModel",
    "SpecialInputBaseModel",
    "ConversationBaseModel",
]

class ChatFileAttachmentBaseModel(BaseModel):
    file_id: str
    file_name: str
    content_type: str | None = None

class ChatBubblePropsBaseModel(BaseModel):
    id: int
    type: Literal["command", "response"]
    text: str
    timestamp: str
    files: list["ChatFileAttachmentBaseModel"] | None = Field(default=[])
    topology_diagram_address: str | None = Field(default=None)

class SpecialInputBaseModel(BaseModel):
    label: str
    input: str

class ConversationBaseModel(BaseModel):
    conversation_id: str
    conversation_name: str | None = Field(default="")
    created_at: str
    chat_history: list["ChatBubblePropsBaseModel"] | None = Field(default=[])
    chat_state: int | None = Field(default=0)
    chat_pending: bool | None = Field(default=False)
    chat_special_inputs: list["SpecialInputBaseModel"] | None = Field(default=[])