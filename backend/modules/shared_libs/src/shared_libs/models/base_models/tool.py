from pydantic import Field

from .shared.shared.database import PatchBaseModel

__all__ = [
    "ToolHistoryBaseModel",
]


class ToolHistoryBaseModel(PatchBaseModel):
    tool_history_id: str
    tool_key: str
    tool_label: str | None = Field(default="")
    action: str | None = Field(default="run")
    status: str | None = Field(default="queued")
    task_id: str | None = Field(default="")
    timestamp: str | None = Field(default="")
    user_id: str | None = Field(default="")
    username: str | None = Field(default="")
    email: str | None = Field(default="")
    result: dict | None = Field(default={})
