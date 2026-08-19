from pydantic import BaseModel, Field

__all__ = ["AiInvocationLogBaseModel"]


class AiInvocationLogBaseModel(BaseModel):
    transaction_id: str  # UUID linking to credit_transaction_log
    user_id: str
    project_id: str | None = Field(default=None)
    assessment_id: str | None = Field(default=None)
    task_name: str | None = Field(default=None)
    task_type: str | None = Field(default=None)
    model_tag: str | None = Field(default=None)
    queue_name: str | None = Field(default=None)
    invocation_source: str | None = Field(default=None)
    initiated_by: str  # user_id string or literal "system"
    status: str | None = Field(default=None)  # "success" | "failed" | "pending"
    invoked_at: str | None = Field(default=None)
    completed_at: str | None = Field(default=None)
