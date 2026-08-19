"""Generic pipeline-job heartbeat tracker and active-heartbeat scanner.

``AssessmentJobTracker`` (risk-register) and ``DiagramGenerationJobTracker``
(diagram service) are the two concrete subclasses that inherit from
``PipelineJobTracker``.  All threading,
Redis-write, and lifecycle logic lives here; subclasses only supply their
namespace-specific Redis key, service name, and any extra payload fields.

Checkpoint support
------------------
Subclasses that want to persist the most-recent pipeline checkpoint inside the
Redis heartbeat (for post-mortem inspection when a worker dies) should set the
class variable ``_checkpoint_field`` to the field name they want to use, e.g.::

    class MyTracker(PipelineJobTracker):
        _checkpoint_field = "my_namespace:latest_checkpoint"

``_write()`` will then automatically preserve the latest checkpoint across every
heartbeat write: it uses the value supplied by the caller, falling back to
whatever is already stored in Redis so the field is never silently cleared.
"""

import logging
import threading
import time
from collections.abc import Callable

from shared_libs.infrastructure.redis_repository.service import RedisRepository

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Module-level scanner (replaces the duplicated for-loop in every registry)
# ---------------------------------------------------------------------------


def scan_active_heartbeats(
    key_pattern: str,
    redis_repository: RedisRepository,
) -> list[dict]:
    """Return all heartbeats that match *key_pattern* and have ``is_running=True``.

    Both ``AssessmentLLMJobUtil`` and ``DiagramLLMJobUtil`` use this
    function via ``PipelineJobUtil`` — it was previously copy-pasted into each.

    Args:
        key_pattern: Redis ``KEYS`` glob pattern, e.g.
            ``"risk_register:assessment_job:{project_id}:*"``.
        redis_repository: Caller-supplied repository (already bound to the
            correct Redis service name).

    Returns:
        List of heartbeat dicts whose ``is_running`` field is truthy.
    """
    keys = redis_repository.get_keys(pattern=key_pattern)
    heartbeats = []
    for key in keys:
        heartbeat = redis_repository.get_item_in_redis(key)
        if heartbeat and heartbeat.get("is_running", True):
            heartbeats.append(heartbeat)
    return heartbeats


# ---------------------------------------------------------------------------
# Base tracker
# ---------------------------------------------------------------------------


class PipelineJobTracker:
    """Manage lifecycle and heartbeat for a single pipeline run.

    Subclasses must call ``super().__init__`` with all required arguments and
    may override ``_build_payload`` to inject extra domain-specific fields into
    the Redis heartbeat hash.

    Args:
        project_id: The project this job belongs to.
        job_id: Unique identifier for this particular run (e.g. assessment
            version or generation lock token).
        redis_key: The exact Redis key used to store the heartbeat.
        redis_repository: Repository bound to the correct Redis service.
        ttl_seconds: How long the key survives without a refresh before Redis
            evicts it automatically — the dead-worker detection window.
        refresh_seconds: How often the background thread calls ``touch()``.
    """

    #: Set to a non-None string in subclasses to enable checkpoint persistence.
    #: The value becomes the field name stored inside the Redis heartbeat hash.
    _checkpoint_field: str | None = None

    def __init__(
        self,
        project_id: str,
        job_id: str,
        redis_key: str,
        redis_repository: RedisRepository,
        ttl_seconds: int,
        refresh_seconds: int,
    ):
        self.project_id = project_id
        self.job_id = job_id
        self.redis_key = redis_key
        self.redis_repository = redis_repository
        self.ttl_seconds = ttl_seconds
        self.refresh_seconds = refresh_seconds
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._on_missing_heartbeat: Callable[[], None] | None = None

    # ------------------------------------------------------------------
    # Payload building — subclasses override to add domain fields
    # ------------------------------------------------------------------

    def _build_payload(self, is_running: bool) -> dict:
        """Return the dict written to Redis for every heartbeat update.

        Subclasses should call ``super()._build_payload(is_running)`` and
        merge in their own fields.
        """
        return {
            "job_id": self.job_id,
            "project_id": self.project_id,
            "is_running": is_running,
            "updated_at": time.time(),
        }

    # ------------------------------------------------------------------
    # Redis helpers
    # ------------------------------------------------------------------

    def _write(
        self,
        is_running: bool,
        *,
        latest_checkpoint: dict | None = None,
    ) -> None:
        """Write the heartbeat to Redis.

        When ``_checkpoint_field`` is set on the subclass the checkpoint is
        preserved across writes: the supplied *latest_checkpoint* is used if
        provided, otherwise the existing value is read from Redis and carried
        forward so the field is never silently erased.
        """
        mapping = self._build_payload(is_running)

        if self._checkpoint_field:
            checkpoint = latest_checkpoint
            if checkpoint is None:
                checkpoint = (self.get_heartbeat() or {}).get(self._checkpoint_field)
            if checkpoint:
                mapping[self._checkpoint_field] = checkpoint

        self.redis_repository.set_item_in_redis(
            name=self.redis_key,
            mapping=mapping,
            expiry=self.ttl_seconds,
        )

    def get_heartbeat(self) -> dict | None:
        return self.redis_repository.get_item_in_redis(self.redis_key)

    def is_running(self) -> bool:
        heartbeat = self.get_heartbeat()
        return bool(heartbeat and heartbeat.get("is_running", True))

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def touch(self, *, latest_checkpoint: dict | None = None) -> None:
        """Refresh the heartbeat to signal the pipeline is still alive."""
        self._write(is_running=True, latest_checkpoint=latest_checkpoint)

    def fail(self, *, latest_checkpoint: dict | None = None) -> None:
        """Write a terminal heartbeat indicating the job failed."""
        self._write(is_running=False, latest_checkpoint=latest_checkpoint)

    def complete(self, *, latest_checkpoint: dict | None = None) -> None:
        """Write a terminal heartbeat indicating the job completed successfully."""
        self._write(is_running=False, latest_checkpoint=latest_checkpoint)

    def clear(self) -> None:
        """Delete the heartbeat key from Redis immediately."""
        self.redis_repository.delete_item_in_redis([self.redis_key])

    def register_on_missing_heartbeat(
        self, callback: Callable[[], None] | None
    ) -> None:
        """Register a callback fired by the background thread when the heartbeat disappears."""
        self._on_missing_heartbeat = callback

    def start(self) -> None:
        """Write the initial heartbeat and launch the background refresh thread."""
        if self._thread and self._thread.is_alive():
            return

        self._stop_event.clear()
        self.touch()

        def _heartbeat_loop() -> None:
            while not self._stop_event.wait(self.refresh_seconds):
                try:
                    if not self.is_running():
                        logger.warning(
                            "Pipeline job heartbeat missing for"
                            " project_id=%s job_id=%s",
                            self.project_id,
                            self.job_id,
                        )
                        self._stop_event.set()
                        if self._on_missing_heartbeat:
                            self._on_missing_heartbeat()
                        return
                    self.touch()
                except Exception:
                    logger.exception(
                        "Failed to refresh pipeline job heartbeat for"
                        " project_id=%s job_id=%s",
                        self.project_id,
                        self.job_id,
                    )

        self._thread = threading.Thread(
            target=_heartbeat_loop,
            name=f"pipeline-job-heartbeat-{self.project_id}",
            daemon=True,
        )
        self._thread.start()

    def stop(self, clear: bool = True) -> None:
        """Stop the background thread and optionally delete the heartbeat key.

        Args:
            clear: When ``True`` (default) the key is deleted immediately —
                use this on the clean-exit path.  Pass ``False`` when an
                exception handler will write the terminal ``fail()`` state
                instead.
        """
        self._stop_event.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=1)
        self._thread = None
        if clear:
            self.clear()
