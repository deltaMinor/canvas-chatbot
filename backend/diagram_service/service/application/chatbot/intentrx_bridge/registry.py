"""In-memory registry of active IntentRX sessions, keyed by a chatbot
session id (the frontend uses its diagram instance id, see
`useDiagramChatbotProps.ts`).

Note: this registry lives in the Django process' memory. It works for a
single-process dev server (the normal local setup for this project, see
`task start`). If the service is ever scaled to multiple worker processes,
sessions would need to be made sticky to a worker or moved to an external
store (e.g. Redis) keyed by session id -- there is no such requirement for
the current scope.
"""

from __future__ import annotations

import threading

from .process import IntentRXSession

_sessions: dict[str, IntentRXSession] = {}
_registry_lock = threading.Lock()
_session_locks: dict[str, threading.Lock] = {}


def get_or_create_session(session_id: str) -> IntentRXSession:
    with _registry_lock:
        session = _sessions.get(session_id)
        if session is None:
            session = IntentRXSession(session_id)
            _sessions[session_id] = session
        return session

def get_session(session_id: str) -> IntentRXSession | None:
    """Look up an existing session without creating one."""
    with _registry_lock:
        return _sessions.get(session_id)

def get_session_lock(session_id: str) -> threading.Lock:
    """Serialise start/message/stop calls for a given session id so two
    concurrent chatbot requests can't write to the same subprocess stdin at
    the same time."""
    with _registry_lock:
        lock = _session_locks.get(session_id)
        if lock is None:
            lock = threading.Lock()
            _session_locks[session_id] = lock
        return lock


def drop_session(session_id: str) -> None:
    with _registry_lock:
        _sessions.pop(session_id, None)
        _session_locks.pop(session_id, None)
