#service.py
import logging

from shared_libs.decorators import raise_exception

from .chat_persistence import append_turn
from .file_access import FileAccessError, read_temp_file
from .process import IntentRXProcessError
from .registry import drop_session, get_or_create_session, get_session, get_session_lock

logger = logging.getLogger(__name__)


class IntentRXApplicationService:
    """Bridges the chatbot's HTTP requests to a per-session IntentRX
    subprocess (see `process.py`). Expected setup issues (missing venv,
    missing source) are returned as a normal chat response rather than
    raised as server errors, so the chatbot can surface them to the dev
    directly.
    """

    @raise_exception("Failed to start IntentRX.", exception_logger=logger)
    def start(self, data: dict) -> dict:
        session_id: str = data["session_id"]
        app_name: str | None = data.get("app")
        project_id: str | None = data.get("project_id")
        conversation_id: str | None = data.get("conversation_id")
        chat_state: int = data.get("chat_state", 0)
        command_text = f"/start {app_name}" if app_name else "/start"
        with get_session_lock(session_id):
            session = get_or_create_session(session_id)
            try:
                panels, ended = session.start(app_name=app_name)
            except IntentRXProcessError as exc:
                drop_session(session_id)
                panels, ended = [{"title": None, "text": str(exc)}], True
            else:
                if ended:
                    drop_session(session_id)
        topology_diagram_address = append_turn(
            session, project_id, conversation_id, command_text, panels, ended, chat_state
        )
        return {
            "panels": panels,
            "ended": ended,
            "topology_diagram_address": topology_diagram_address,
        }
 
    @raise_exception("Failed to exchange message with IntentRX.", exception_logger=logger)
    def send_message(self, data: dict) -> dict:
        session_id: str = data["session_id"]
        text: str = data.get("text", "")
        project_id: str | None = data.get("project_id")
        conversation_id: str | None = data.get("conversation_id")
        chat_state: int = data.get("chat_state", 0)
        with get_session_lock(session_id):
            session = get_or_create_session(session_id)
            panels, ended = session.send(text)
            if ended:
                drop_session(session_id)
        topology_diagram_address = append_turn(
            session, project_id, conversation_id, text, panels, ended, chat_state
        )
        return {
            "panels": panels,
            "ended": ended,
            "topology_diagram_address": topology_diagram_address,
        }
 
    @raise_exception("Failed to check IntentRX status.", exception_logger=logger)
    def status(self, data: dict) -> dict:
        """Report whether a session id the caller believes is in IntentRX
        state is actually still running.

        Called once when the chatbot reconnects before any message is sent, so a
        session that ended can be reported immediately instead of only
        surfacing on the next message the user happens to send.
        """
        session_id: str = data["session_id"]
        session = get_session(session_id)
        if session is None:
            return {"running": False, "busy": False}

        lock = get_session_lock(session_id)
        acquired = lock.acquire(blocking=False)
        if not acquired:
            return {"running": session.is_running, "busy": True}
        try:
            running = session.is_running
            if not running:
                session.stop()
                drop_session(session_id)
            return {"running": running, "busy": False}
        finally:
            lock.release()


    @raise_exception("Failed to read IntentRX progress.", exception_logger=logger)
    def progress(self, data: dict) -> dict:
        """Return the latest line IntentRX has printed for the turn
        currently in flight. Deliberately does *not* take the per-session
        lock (`get_session_lock`): that lock is held for the full duration
        of a slow `start`/`send_message` call, and the whole point of this
        endpoint is to be pollable while one of those is still running.
        """
        session_id: str = data["session_id"]
        session = get_or_create_session(session_id)
        return {"text": session.peek_progress()}

    @raise_exception("Failed to stop IntentRX.", exception_logger=logger)
    def stop(self, data: dict) -> dict:
        session_id: str = data["session_id"]
        with get_session_lock(session_id):
            session = get_or_create_session(session_id)
            text = session.stop()
            drop_session(session_id)
            return {"text": text, "ended": True}

    @raise_exception("Failed to read file.", exception_logger=logger)
    def read_file(self, data: dict) -> dict:
        path: str = data["path"]
        try:
            return read_temp_file(path)
        except FileAccessError as exc:
            return {"exists": False, "error": str(exc)}
