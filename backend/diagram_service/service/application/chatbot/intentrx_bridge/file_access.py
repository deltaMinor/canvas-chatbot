"""A generic utility for reading a file's content and change-state
from disk, restricted to the OS temp directory.
"""

from __future__ import annotations

import tempfile
from pathlib import Path


class FileAccessError(Exception):
    """Raised for expected, user-facing problems (path outside the
    allowed directory, unreadable file, etc)."""


def _allowed_root() -> Path:
    return Path(tempfile.gettempdir()).resolve()


def read_temp_file(path: str) -> dict:
    """Return ``{"exists": bool, "mtime": float, "size": int, "content": str}``
    for a path inside the OS temp directory, or ``{"exists": False}`` if it
    doesn't exist yet. Raises :class:`FileAccessError` for a path outside
    the allowed root or a file that can't be decoded as text.
    """
    if not path:
        raise FileAccessError("No path was provided.")

    resolved = Path(path).resolve()
    root = _allowed_root()
    if resolved != root and root not in resolved.parents:
        raise FileAccessError("That path is outside the allowed directory.")

    try:
        stat = resolved.stat()
    except OSError:
        return {"exists": False}

    try:
        content = resolved.read_text(encoding="utf-8")
    except OSError as exc:
        raise FileAccessError(f"Could not read '{resolved}': {exc}") from exc

    return {
        "exists": True,
        "mtime": stat.st_mtime,
        "size": stat.st_size,
        "content": content,
    }
