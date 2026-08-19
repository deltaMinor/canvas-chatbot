from collections.abc import Mapping
from typing import Any


def success(
    msg: str,
    data: Any = None,
    code: str = 200,
) -> Mapping[str, Any]:
    return {
        "code": code,
        "message": msg,
        "data": data,
    }
