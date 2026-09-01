import logging
import re
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from .topology_file_tracking import check_topology_file

if TYPE_CHECKING:
    from .process import IntentRXSession

logger = logging.getLogger(__name__)

_CHATBOT_STATE_NEUTRAL = 0

_KEEP_TITLE = True
_KEEP_GUIDANCE = False
_SECTION_LABEL_RE = re.compile(r"^(Response|Guidance)$") 

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _format_panel_text(panel: dict) -> str:
    """Python port of `formatIntentRXPanelText` in
    `useDiagramChatbotProps.ts` -- keep the two in sync."""
    lines = (panel.get("text") or "").split("\n")

    if not _KEEP_GUIDANCE:
        guidance_index = next(
            (i for i, line in enumerate(lines) if line.strip() == "Guidance"), None
        )
        if guidance_index is not None:
            lines = lines[:guidance_index]

    lines = [line for line in lines if not _SECTION_LABEL_RE.match(line.strip())]

    while lines and lines[0].strip() == "":
        lines.pop(0)
    while lines and lines[-1].strip() == "":
        lines.pop()

    body = "\n".join(lines)
    title = panel.get("title")
    if _KEEP_TITLE and title:
        return f"{title}\n\n{body}" if body else title
    return body


def _format_panels(panels: list[dict]) -> list[str]:
    """Python port of `formatIntentRXPanels` in `useDiagramChatbotProps.ts`."""
    return [text for text in (_format_panel_text(panel) for panel in panels) if text]


def append_turn(
    session: "IntentRXSession | None",
    project_id: str | None,
    conversation_id: str | None,
    command_text: str,
    panels: list[dict],
    ended: bool,
    chat_state: int,
) -> str | None:
    """Append one command + response exchange to a single conversation's
    persisted chat history, and bring its stored chat_state/chat_pending in
    line with `ended`.

    Returns the database `file_id` of a newly generated topology diagram
    detected this turn (if any), so the HTTP response can hand it straight
    back to the frontend. The frontend then reuses this value instead of
    independently re-reading the temp file and saving it a second time --
    doing both used to create two near-identical "diagram.json" rows a
    second apart for every single generation.
    """
    if not project_id or not conversation_id:
        logger.debug(
            "Skipping IntentRX chat persistence: missing project_id/conversation_id."
        )
        return None

    response_texts = _format_panels(panels)
    topology_entry = check_topology_file(session, panels, project_id)
    topology_diagram_address = (
        topology_entry["topology_diagram_address"] if topology_entry else None
    )
    if not command_text and not response_texts and not topology_entry:
        return None

    try:
        from main import celery_app

        from ..services.project_ad import ProjectChatbotApplicationService

        service = ProjectChatbotApplicationService(celery_app=celery_app)
        current = service.get_chat_data(
            {"project_id": project_id, "conversation_id": conversation_id}
        )
        history: list[dict] = list(current.get("chat_history") or [])
        next_id = max((msg.get("id", 0) for msg in history), default=0) + 1

        new_entries = []
        if command_text:
            new_entries.append(
                {"id": next_id, "type": "command", "text": command_text, "timestamp": _now_iso()}
            )
            next_id += 1
        for text in response_texts:
            new_entries.append(
                {"id": next_id, "type": "response", "text": text, "timestamp": _now_iso()}
            )
            next_id += 1
        if topology_entry:
            new_entries.append(
                {
                    "id": next_id,
                    "type": "response",
                    "text": topology_entry["text"],
                    "timestamp": _now_iso(),
                    "topology_diagram_address": topology_entry["topology_diagram_address"],
                }
            )
            next_id += 1

        service.update_chat_data(
            {
                "project_id": project_id,
                "conversation_id": conversation_id,
                "chat_history": history + new_entries,
                "chat_state": _CHATBOT_STATE_NEUTRAL if ended else chat_state,
                "chat_pending": False,
            }
        )
    except Exception:
        logger.warning(
            "Failed to persist IntentRX turn as a durability safety net "
            "(project_id=%s, conversation_id=%s); the live response already "
            "succeeded and is unaffected.",
            project_id,
            conversation_id,
            exc_info=True,
        )

    # Returned regardless of whether the try block above succeeded: the
    # generated JSON file (if any) was already saved to the database by
    # `check_topology_file` earlier, independent of chat-history persistence.
    return topology_diagram_address
