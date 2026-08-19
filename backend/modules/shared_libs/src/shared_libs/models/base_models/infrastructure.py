from typing import Optional

from pydantic import BaseModel, Field

__all__ = [
    "TaskMappingsModel",
    "ProducerDataModel",
]


class TaskMappingsModel(BaseModel):
    task_name_dict: dict | None = Field(default={})
    task_key_dict: dict | None = Field(default={})


class ProducerDataModel(BaseModel):
    task_collection_name: str | None = Field(default="")
    task_queue: str | None = Field(default="")
    task_mappings: Optional["TaskMappingsModel"] = Field(
        default_factory=TaskMappingsModel,
    )
