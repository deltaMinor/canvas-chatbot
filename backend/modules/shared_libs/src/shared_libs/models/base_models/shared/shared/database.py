import datetime
from typing import Any

from pydantic import BaseModel, Field, PrivateAttr

from shared_libs.models.alias import Datetime

__all__ = [
    "UserInfoModel",
    "MetadataModel",
    "PatchBaseModel",
]


def _normalize_datetime_values(value: Any) -> tuple[Any, bool]:
    if isinstance(value, datetime.datetime):
        return value.isoformat(), True

    if isinstance(value, dict):
        changed = False
        normalized = {}
        for key, item in value.items():
            normalized_item, item_changed = _normalize_datetime_values(item)
            normalized[key] = normalized_item
            changed = changed or item_changed
        return (normalized, True) if changed else (value, False)

    if isinstance(value, list):
        changed = False
        normalized = []
        for item in value:
            normalized_item, item_changed = _normalize_datetime_values(item)
            normalized.append(normalized_item)
            changed = changed or item_changed
        return (normalized, True) if changed else (value, False)

    if isinstance(value, tuple):
        changed = False
        normalized = []
        for item in value:
            normalized_item, item_changed = _normalize_datetime_values(item)
            normalized.append(normalized_item)
            changed = changed or item_changed
        return (tuple(normalized), True) if changed else (value, False)

    return value, False


class UserInfoModel(BaseModel):
    user_id: str | None = Field(default="")
    username: str | None = Field(default="")


class MetadataModel(UserInfoModel):
    timestamp: Datetime | None = None

    def model_dump(self, *args, **kwargs) -> dict:
        dump_val = super().model_dump(*args, **kwargs)
        dump_val, _ = _normalize_datetime_values(dump_val)
        return dump_val


class PatchBaseModel(BaseModel):
    _patch: bool | None = PrivateAttr(default=False)
    _unset: bool | None = PrivateAttr(default=False)
    _unsetkeys: list[str] | None = PrivateAttr(default=[])
    patchVer_: str | None = Field(default="")
