from typing import Any, Protocol, runtime_checkable


@runtime_checkable
class DiagramProgressReporterProtocol(Protocol):
    """Facade coordinating the tracker and benchmark recorder for a pipeline run."""

    def start(
        self,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None: ...

    def record_checkpoint(
        self,
        name: str,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None: ...

    def finish(
        self,
        status: str,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None: ...


__all__ = ["DiagramProgressReporterProtocol"]
