from collections.abc import Iterable
from typing import Any


class DomainRequestDataPrefilterService:
    """Domain utility mixin for request data prefiltering."""

    @staticmethod
    def remove_reserved_keys(
        data: dict[str, Any],
        reserved_keys: Iterable[str] | None = None,
    ) -> dict[str, Any]:
        reserved_keys_set = set(reserved_keys or [])
        return {
            key: value for key, value in data.items() if key not in reserved_keys_set
        }

    @classmethod
    def filter_request_data(
        cls,
        data: dict[str, Any],
        reserved_keys: Iterable[str] | None = None,
        allowed_keys: Iterable[str] | None = None,
        model: Any | None = None,
    ) -> dict[str, Any]:
        """Filter request data by reserved keys and allowed keys/model fields.

        Order:
        1. Remove reserved keys.
        2. If `allowed_keys` is provided, keep only those keys.
        3. Else if `model` is provided, keep only keys found in `model.model_fields`.
        """
        filtered = cls.remove_reserved_keys(
            data=data,
            reserved_keys=reserved_keys,
        )

        if allowed_keys is not None:
            allowed_keys_set = set(allowed_keys)
            return {
                key: value for key, value in filtered.items() if key in allowed_keys_set
            }

        if model is not None and hasattr(model, "model_fields"):
            model_fields = set(model.model_fields.keys())
            return {
                key: value for key, value in filtered.items() if key in model_fields
            }

        return filtered
