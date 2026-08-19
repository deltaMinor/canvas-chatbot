from pydantic import BaseModel


class LlmTaskContext(BaseModel):
    queue_name: str
    task_name: str
    task_type: str
