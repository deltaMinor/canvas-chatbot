from typing import Any, Protocol, runtime_checkable


@runtime_checkable
class DiagramGenerationJobTrackerProtocol(Protocol):
    """Heartbeat lifecycle for a single diagram generation pipeline run."""

    def start(self) -> None: ...

    def stop(self, clear: bool = True) -> None: ...

    def touch(self, *, latest_checkpoint: dict | None = None) -> None: ...

    def fail(self, *, latest_checkpoint: dict | None = None) -> None: ...

    def complete(self, *, latest_checkpoint: dict | None = None) -> None: ...

    def record_checkpoint(
        self,
        name: str,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict | None: ...


__all__ = ["DiagramGenerationJobTrackerProtocol"]
