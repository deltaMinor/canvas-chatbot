from typing import Self

from pydantic import BaseModel, Field, model_validator

from .shared.shared.database import PatchBaseModel

__all__ = [
    "AppTNCSectionModel",
    "AppTNCDocumentModel",
    "AppTNCBaseModel",
]


class AppTNCSectionModel(BaseModel):
    number: int
    heading: str
    content: str


class AppTNCDocumentModel(BaseModel):
    type: str
    title: str
    introduction: str
    version: str  # Formatted date (e.g., "2024-01-15")
    sections: list["AppTNCSectionModel"] = Field(default=[])


class AppTNCBaseModel(
    PatchBaseModel,
):
    schema_: str
    documents: list["AppTNCDocumentModel"] = Field(default=[])

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        return handler(data)
