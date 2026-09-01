"""Server-side mirror of the topology-file dedup + "Diagram Generated"
chip logic in `topologyFileTracking.ts` -- keep the two in sync.

This only runs from `chat_persistence.append_turn`'s durability safety
net. In the normal case the frontend already detects the same file
change and saves the resulting chip (and persists the generated JSON to
the database) itself; this exists purely so that if the safety net is
what ends up persisting a turn (e.g. the browser closed before the
frontend's own save happened), the "Diagram Generated" chip -- backed by
a real database file_id, not a temporary directory path -- is still
present when the conversation is reloaded.
"""

from __future__ import annotations

import logging
import re
from typing import TYPE_CHECKING

from .file_access import FileAccessError, read_temp_file

if TYPE_CHECKING:
    from .process import IntentRXSession

logger = logging.getLogger(__name__)

_TOPOLOGY_FILEDIR_PANEL_TITLE = "TOPO-GENERATOR-PREFLIGHT"

_PATH_ALIAS_LINE_RE = re.compile(r"^-\s*\$([A-Za-z_][A-Za-z0-9_]*):\s*(.+)$")
_TOPOLOGY_FILE_LINE_RE = re.compile(r"^-\s*topology_file:\s*(.+?)\s*\(exists=")


def _update_topology_file_tracking(session: "IntentRXSession", text: str) -> None:
    tracking = session.topology_tracking
    for raw_line in text.split("\n"):
        line = raw_line.strip()

        alias_match = _PATH_ALIAS_LINE_RE.match(line)
        if alias_match:
            name, value = alias_match.group(1), alias_match.group(2)
            if name and value:
                tracking["aliases"][name] = value.strip()
            continue

        if tracking["file_path"] is None:
            file_match = _TOPOLOGY_FILE_LINE_RE.match(line)
            raw_path = file_match.group(1) if file_match else None
            if raw_path:
                resolved = raw_path.strip()
                for name, value in tracking["aliases"].items():
                    resolved = resolved.replace(f"${name}", value)
                tracking["file_path"] = resolved


def _save_generated_json(project_id: str, content: str) -> str | None:
    """Persists `content` to the database as a new generated-JSON file
    (see `ProjectADFileApplicationService.save_generated_json`) and
    returns the resulting `file_id`, or None if the save failed.
    """
    try:
        from main import celery_app
        from service.application.project_diagram.files.services import (
            ProjectADFileApplicationService,
        )

        service = ProjectADFileApplicationService(celery_app=celery_app)
        result = service.save_generated_json(
            {"project_id": project_id, "content": content}
        )
        return result.get("file_id") if result else None
    except Exception:
        logger.warning(
            "Failed to persist generated topology JSON to the database "
            "as a durability safety net (project_id=%s); no diagram chip "
            "will be attached to this turn.",
            project_id,
            exc_info=True,
        )
        return None


def _apply_topology_file(
    session: "IntentRXSession", address: str, project_id: str
) -> str | None:
    """Returns a database `file_id` if `address` points at a new/changed
    diagram file that was successfully saved to the database (and records
    it as seen on `session`), otherwise None."""
    tracking = session.topology_tracking
    tracking["file_path"] = address

    try:
        file_read = read_temp_file(address)
    except FileAccessError:
        return None

    if not file_read.get("exists") or "content" not in file_read:
        return None

    unchanged = (
        file_read.get("mtime") == tracking["last_mtime"]
        and file_read.get("size") == tracking["last_size"]
    )
    if unchanged:
        return None

    tracking["last_mtime"] = file_read.get("mtime")
    tracking["last_size"] = file_read.get("size")

    return _save_generated_json(project_id, file_read["content"])


def check_topology_file(
    session: "IntentRXSession | None", panels: list[dict], project_id: str | None
) -> dict | None:
    """Returns a chat entry dict (``{"text": ..., "topology_diagram_address":
    <file_id>}``) for a "Diagram Generated" chip if `panels` reveal a
    new/changed TopologyGenerator output file that was successfully saved to
    the database, otherwise None.

    `topology_diagram_address` now carries a database `file_id` (not a
    temporary directory path) so the resulting "Import Diagram" chip keeps
    working even after the temp directory is gone or the conversation is
    reopened on another device.
    """
    if session is None or not project_id:
        return None

    tracking = session.topology_tracking
    for panel in panels:
        if panel.get("title") != _TOPOLOGY_FILEDIR_PANEL_TITLE:
            continue
        _update_topology_file_tracking(session, panel.get("text") or "")

    if not tracking["file_path"]:
        return None

    file_id = _apply_topology_file(session, tracking["file_path"], project_id)
    if not file_id:
        return None

    return {
        "text": "A diagram has been generated from TopologyGenerator.",
        "topology_diagram_address": file_id,
    }
