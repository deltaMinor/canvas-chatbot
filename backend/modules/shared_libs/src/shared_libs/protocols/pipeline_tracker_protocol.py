from typing import Protocol, runtime_checkable


@runtime_checkable
class PipelineTrackerProtocol(Protocol):
    """Minimal interface required by ``PipelineProgressReporter`` for a tracker."""

    def start(self) -> None: ...

    def touch(self, *, latest_checkpoint: dict | None = None) -> None: ...

    def fail(self, *, latest_checkpoint: dict | None = None) -> None: ...

    def complete(self, *, latest_checkpoint: dict | None = None) -> None: ...


__all__ = ["PipelineTrackerProtocol"]
