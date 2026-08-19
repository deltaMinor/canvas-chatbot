"""Subprocess wrapper around the vendored IntentRX CLI.

This module drives a real ``python -m main`` subprocess the same way a
person would from a terminal:

- text typed into the chatbot is written to the subprocess' stdin
- text printed by the subprocess to stdout is captured and returned as the
  chatbot's response
"""

from __future__ import annotations

import logging
import os
import queue
import re
import subprocess
import threading
import time
from pathlib import Path

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #

# IntentRX prints its prompt as "<state> > " with no trailing
# newline before blocking on input(). That is the most reliable signal that
# the subprocess is now idle and waiting for the next chatbot message.
_PROMPT_TAIL_RE = re.compile(r"[^\n]{0,80} > $")
_ANSI_RE = re.compile(rb"\x1b\[[0-9;]*m")

# IntentRX renders all of its conversational content (responses, guidance,
# banners) inside box-drawing panels. These match that renderer's exact
# border/body characters.
_PANEL_BORDER_ROW_RE = re.compile(r"^[\u256d\u2570\u251c][\u2500]*[\u256e\u256f\u2524]$")  # ╭/╰/├ ─ ╮/╯/┤
_PANEL_BODY_RE = re.compile(r"^\u2502(.*)\u2502$")  # │ ... │
_PANEL_TOP_LEFT = "\u256d"
_WHITESPACE_RUN_RE = re.compile(r"\s{2,}")
_PANEL_TITLE_RE = re.compile(r"^\*\s+(.+?)\s+Console$")

_LOG_LEVEL_LINE_RE = re.compile(
    r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[(?P<level>[A-Z]+)\s*\] "
)
_FATAL_LOG_LEVELS = frozenset({"ERROR", "CRITICAL"})

_EXIT_LOG_LINE_RE = re.compile(
    r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[INFO\s*\] Completed CLI \(app=(?P<app>\w+)\) <[^>]+>\s*$",
    re.MULTILINE,
)
_APP_DISPLAY_NAMES = {
    "onto": "OntoPilot",
    "intent": "IntentRx",
    "topology": "TopologyGenerator",
}

_POLL_INTERVAL_SECONDS = 1.5

_MAX_INACTIVITY_SECONDS = 600

_EXIT_WAIT_SECONDS = 5

VALID_APPS = ("onto", "intent", "topology")

# One rendered panel, split into its title chip and the remaining body text.
Panel = dict[str, "str | None"]

class IntentRXProcessError(Exception):
    """Raised for expected, user-actionable setup problems (missing venv,
    missing source, etc). Callers should surface ``str(exc)`` directly in
    the chat rather than treating it as an internal server error."""


def _resolve_intentrx_root() -> Path:
    """Resolve the directory IntentRX was vendored into.

    Defaults to ``backend/intentrx`` (a sibling of ``diagram_service``),
    but can be overridden with the ``INTENTRX_ROOT`` environment variable
    (useful for Docker images that place it elsewhere).
    """
    override = os.environ.get("INTENTRX_ROOT")
    if override:
        return Path(override).resolve()

    backend_dir = Path(__file__).resolve().parents[5]
    return backend_dir / "intentrx"


def _resolve_python_executable(root: Path) -> Path | None:
    """Resolve the interpreter inside IntentRX's own virtual environment.

    Can be overridden with the ``INTENTRX_PYTHON`` environment variable.
    """
    override = os.environ.get("INTENTRX_PYTHON")
    if override:
        return Path(override)

    candidates = [
        root / ".venv" / "bin" / "python",  # macOS / Linux
        root / ".venv" / "Scripts" / "python.exe",  # Windows
    ]
    return next((c for c in candidates if c.exists()), None)


class IntentRXSession:
    """Drives a single ``python -m main --app <app_name>`` subprocess.

    One instance corresponds to one chatbot conversation that is currently
    in the IntentRX state. It is not thread-safe against concurrent calls
    for the *same* session; the caller (see ``registry.py``) is responsible
    for serialising access per session id.
    """

    def __init__(self, session_id: str):
        self.session_id = session_id
        self._proc: subprocess.Popen | None = None
        self._queue: "queue.Queue[bytes | None]" = queue.Queue()
        self._reader_thread: threading.Thread | None = None
        self._ended = False
        # Latest non-empty line IntentRX has printed so far, updated
        # continuously by the reader thread. Guarded by its own lock so a
        # `GET .../progress` request can read it while a `send()`/`start()`
        # call is still blocked collecting a turn's full output.
        self._progress_lock = threading.Lock()
        self._progress_line = ""

        self.topology_tracking: dict = {
            "aliases": {},
            "file_path": None,
            "last_mtime": None,
            "last_size": None,
        }


    @property
    def is_running(self) -> bool:
        return self._proc is not None and self._proc.poll() is None

    def start(self, app_name: str | None = None) -> tuple[list[Panel], bool]:
        """Launch the subprocess and return its startup output as a list of panels

        ``app_name`` (one of :data:`VALID_APPS`) is passed straight through
        as ``--app <app_name>``, the equivalent of running
        ``python -m main --app <app_name>`` -- this jumps straight to that
        workflow's own startup banner.

        The bare launcher (``python -m main`` with no ``--app``, which
        prompts interactively for a workflow) is not supported yet: it
        needs a real TTY to prompt, which a piped subprocess never has, and
        IntentRX's own source isn't modified to work around that. Passing
        ``app_name=None`` raises a clear :class:`IntentRXProcessError`
        instead of forwarding a broken invocation to IntentRX.
        """
        if self.is_running:
            raise IntentRXProcessError("IntentRX is already running for this session.")
        if app_name is None:
            raise IntentRXProcessError(
                "Starting IntentRX without choosing a workflow isn't supported yet. "
                "Use 'start onto', 'start intent', or 'start topology' instead."
            )
        if app_name not in VALID_APPS:
            raise IntentRXProcessError(f"Unknown IntentRX app '{app_name}'.")

        root = _resolve_intentrx_root()
        if not (root / "main.py").exists():
            raise IntentRXProcessError(
                f"IntentRX source was not found at `{root}`. "
                "See the README for setup instructions."
            )

        python_exe = _resolve_python_executable(root)
        if not python_exe:
            raise IntentRXProcessError(
                "IntentRX's virtual environment was not found. From "
                f"`{root}`, run `uv sync` (see the README) and try again."
            )

        env = {
            **os.environ,
            "PYTHONUNBUFFERED": "1",
            # IntentRX's banners/panels use box-drawing and other non-ASCII
            # characters. Without this, a child process on Windows inherits
            # the console's codepage (commonly cp1252), which can't encode
            # them and crashes with a UnicodeEncodeError. stdout here is a
            # pipe, not a real console, so forcing UTF-8 is always safe.
            "PYTHONIOENCODING": "utf-8",
        }
        command = [str(python_exe), "-u", "-m", "main", "--app", app_name]
        try:
            self._proc = subprocess.Popen(  # noqa: S603
                command,
                cwd=str(root),
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                env=env,
            )
        except OSError as exc:
            raise IntentRXProcessError(f"Failed to start IntentRX: {exc}") from exc

        self._ended = False
        with self._progress_lock:
            self._progress_line = ""
        self._reader_thread = threading.Thread(target=self._read_loop, daemon=True)
        self._reader_thread.start()
        panels = self._collect_output()
        return panels, self._ended
 
    def send(self, text: str) -> tuple[list[Panel], bool]:
        """Send one line of user input and return ``(panels, ended)``.
 
        ``ended`` is ``True`` once IntentRX has exited (e.g. after the user
        typed ``:quit``, or the process crashed), signalling the caller
        should return the chatbot to its Neutral state.
        """
        if not self.is_running:
            return [{"title": None, "text": "IntentRX session ended unexpectedly."}], True
 
        payload = (text or "").rstrip("\n") + "\n"
        with self._progress_lock:
            self._progress_line = ""
        try:
            assert self._proc is not None and self._proc.stdin is not None
            self._proc.stdin.write(payload.encode("utf-8"))
            self._proc.stdin.flush()
        except (BrokenPipeError, OSError):
            self._finalize()
            return [{"title": None, "text": "IntentRX session ended unexpectedly."}], True
 
        panels = self._collect_output()
        return panels, self._ended
 
    def peek_progress(self) -> str:
        """Return the latest line IntentRX has printed so far during the
        turn currently in flight (or "" if none yet / not running).
 
        Safe to call from a different request than the one blocked inside
        `send()`/`start()` -- it only reads a small piece of state guarded
        by its own lock, never the per-session lock in `registry.py`, so it
        never waits behind a slow turn.
        """
        with self._progress_lock:
            return self._progress_line

    def stop(self) -> str:
        """Force-stop the subprocess (used for cleanup outside the normal
        ``:quit`` flow, e.g. if the session is abandoned)."""
        if not self.is_running:
            self._finalize()
            return "IntentRX session has already ended."

        assert self._proc is not None
        try:
            self._proc.terminate()
            self._proc.wait(timeout=_EXIT_WAIT_SECONDS)
        except Exception:  # noqa: BLE001
            self._proc.kill()
        self._finalize()
        return "IntentRX session stopped."

    # -- internal helpers --------------------------------------------------

    def _read_loop(self) -> None:
        assert self._proc is not None and self._proc.stdout is not None
        stdout = self._proc.stdout
        # `read1()` is what lets us return as soon as *any* data is
        # available instead of blocking until 4096 bytes accumulate (which
        # would stall on short chunks like a bare prompt). Not every stream
        # exposes it (e.g. some platforms hand back a raw, unbuffered
        # stream), so fall back to a raw os.read() on the file descriptor.
        read_chunk = getattr(stdout, "read1", None)
        if read_chunk is None:
            fd = stdout.fileno()
            read_chunk = lambda n: os.read(fd, n)  # noqa: E731

        rolling = bytearray()
        try:
            while True:
                chunk = read_chunk(4096)
                if not chunk:
                    break
                self._queue.put(chunk)
                rolling.extend(chunk)
                del rolling[:-8192]
                self._update_progress(rolling)
        except (ValueError, OSError):
            # Expected once the process exits and the pipe is torn down.
            pass
        except Exception:  # noqa: BLE001
            logger.exception("IntentRX[%s] reader thread failed.", self.session_id)
        finally:
            self._queue.put(None)

    def _update_progress(self, rolling: bytearray) -> None:
        text = self._decode(bytes(rolling))
        for raw_line in reversed(text.splitlines()):
            line = self._clean_progress_line(raw_line)
            if line:
                with self._progress_lock:
                    self._progress_line = line
                return
 
    @staticmethod
    def _clean_progress_line(line: str) -> str:
        """Strip box-drawing chrome from one line of raw output so it reads
        naturally as a progress snippet, or return "" if the line is
        uninformative (blank, a bare border row, or the idle prompt)."""
        stripped = line.strip()
        if not stripped:
            return ""
        body_match = _PANEL_BODY_RE.match(stripped)
        if body_match:
            stripped = _WHITESPACE_RUN_RE.sub(" ", body_match.group(1)).strip()
            if not stripped:
                return ""
        elif _PANEL_BORDER_ROW_RE.match(stripped):
            return ""
        if _PROMPT_TAIL_RE.search(stripped):
            return ""
        return stripped

    def _collect_output(self) -> list[Panel]:
        """Collect output for one turn. Keeps reading for as long as
        IntentRX keeps producing new output.
        """
        buf = bytearray()
        deadline = time.monotonic() + _MAX_INACTIVITY_SECONDS
        timed_out = False
        errored = False
 
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                timed_out = True
                break
            try:
                item = self._queue.get(timeout=min(_POLL_INTERVAL_SECONDS, remaining))
            except queue.Empty:
                # No new bytes this interval, but IntentRX may still be
                # working (e.g. a slow LLM call) -- keep waiting until the
                # inactivity deadline instead of returning early.
                continue
 
            if item is None:
                self._ended = True
                break
 
            # Any new output means IntentRX is still active; push the
            # inactivity deadline back out.
            deadline = time.monotonic() + _MAX_INACTIVITY_SECONDS
            buf.extend(item)
 
            if self._looks_like_prompt(buf):
                break
            if self._has_fatal_log_line(buf):
                errored = True
                break
 
        if self._ended:
            self._finalize()
 
        text = self._decode(bytes(buf))
        panels = self._extract_panels(text)

        if self._ended and not panels:
            exit_match = _EXIT_LOG_LINE_RE.search(text)
            if exit_match:
                app_display = _APP_DISPLAY_NAMES.get(
                    exit_match.group("app"), exit_match.group("app")
                )
                panels = [{"title": None, "text": f"{app_display} exited"}]
            else:
                panels = [{"title": None, "text": "IntentRX session ended unexpectedly."}]
                if text:
                    panels.append({"title": None, "text": text})

        # Fall back to the raw (cleaned) text as a single, title-less panel
        # if no panel content was found (e.g. an error was printed outside
        # of a panel) so nothing is silently lost.
        if not panels and text:
            panels = [{"title": None, "text": text}]
        if timed_out:
            panels.append(
                {
                    "title": None,
                    "text": (
                        "IntentRX has not printed any new output in "
                        f"{_MAX_INACTIVITY_SECONDS // 60} minutes; it may be stuck."
                    ),
                }
            )
        elif errored:
            panels.append(
                {
                    "title": None,
                    "text": "IntentRX reported an error; stopped waiting for a response.",
                }
            )
        return panels

    @staticmethod
    def _has_fatal_log_line(buf: bytearray) -> bool:
        """Return True if an ERROR/CRITICAL log record (IntentRX's own
        failure signal, see `_LOG_LEVEL_LINE_RE`) appears anywhere in the
        output collected so far this turn."""
        text = IntentRXSession._decode(bytes(buf))
        for line in text.splitlines():
            match = _LOG_LEVEL_LINE_RE.match(line.strip())
            if match and match.group("level") in _FATAL_LOG_LEVELS:
                return True
        return False

    @staticmethod
    def _looks_like_prompt(buf: bytearray) -> bool:
        tail = _ANSI_RE.sub(b"", bytes(buf[-120:])).decode("utf-8", errors="ignore")
        return bool(_PROMPT_TAIL_RE.search(tail))

    @staticmethod
    def _decode(raw: bytes) -> str:
        return _ANSI_RE.sub(b"", raw).decode("utf-8", errors="replace").strip("\n")

    @staticmethod
    def _extract_panels(text: str) -> list[Panel]:
        """Split raw output into the individual panels IntentRX printed,
        keeping only what's inside each box, e.g.::
 
            ╭───────────────────╮
            │ * TOPOLOGY Console│   <- title chip, split into Panel["title"]
            ├───────────────────┤   <- border row, dropped entirely
            │ Response           │   <- kept in Panel["text"]
            │                    │   <- kept as a blank separator line
            │ Some message here  │   <- kept in Panel["text"]
            ╰───────────────────╯   <- border row, dropped entirely
 
        Lines outside of any panel (log lines, the bare "<state> > "
        prompt, etc) are dropped. Each panel in the same turn is returned
        as its own entry -- callers decide whether/how to combine them,
        e.g. as separate chat messages.
        """
        raw_panels: list[list[str]] = []
        current: list[str] | None = None
 
        for line in text.splitlines():
            stripped = line.strip()
            if not stripped:
                if current is not None:
                    current.append("")
                continue
 
            if _PANEL_BORDER_ROW_RE.match(stripped):
                if stripped[0] == _PANEL_TOP_LEFT:
                    current = []
                    raw_panels.append(current)
                continue
 
            body_match = _PANEL_BODY_RE.match(stripped)
            if body_match and current is not None:
                content = _WHITESPACE_RUN_RE.sub(" ", body_match.group(1)).strip()
                current.append(content)
                continue
 
            # Non-panel line (log output, bare prompt, etc) -- dropped.
 
        panels: list[Panel] = []
        for panel_lines in raw_panels:
            while panel_lines and panel_lines[0] == "":
                panel_lines.pop(0)
            while panel_lines and panel_lines[-1] == "":
                panel_lines.pop()
            if not panel_lines:
                continue
 
            title: str | None = None
            title_match = _PANEL_TITLE_RE.match(panel_lines[0])
            if title_match:
                title = title_match.group(1).strip()
                panel_lines = panel_lines[1:]
                while panel_lines and panel_lines[0] == "":
                    panel_lines.pop(0)
 
            if panel_lines:
                panels.append({"title": title, "text": "\n".join(panel_lines)})
 
        return panels

    def _finalize(self) -> None:
        self._ended = True
        if self._proc and self._proc.poll() is None:
            try:
                self._proc.wait(timeout=1)
            except Exception:  # noqa: BLE001
                pass
