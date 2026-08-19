from typing import Any, Protocol, runtime_checkable


@runtime_checkable
class PipelineBenchmarkRecorderProtocol(Protocol):
    """Minimal interface required by ``PipelineProgressReporter`` for a benchmark recorder."""

    DEFAULT_START_MESSAGE: str

    def start(
        self,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict | None: ...

    def record_checkpoint(
        self,
        name: str,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict | None: ...

    def record_messages(
        self,
        name: str,
        messages: str | list[str] | tuple[str, ...] | None,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> list[dict]: ...

    def finish(
        self,
        status: str,
        *,
        message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict | None: ...


__all__ = ["PipelineBenchmarkRecorderProtocol"]
