from typing import Protocol, runtime_checkable


@runtime_checkable
class DiagramLLMJobUtilProtocol(Protocol):
    """Heartbeat queries and start-reservation management (class-method interface)."""

    @classmethod
    def get_active_heartbeat(cls, project_id: str) -> dict | None: ...

    @classmethod
    def has_active_generation_job(cls, project_id: str) -> bool: ...

    @classmethod
    def reserve_start(cls, project_id: str, job_id: str) -> bool: ...

    @classmethod
    def clear_start_reservation(cls, project_id: str) -> None: ...

    @classmethod
    def is_start_reservation_stale(cls, project_id: str) -> bool: ...


__all__ = ["DiagramLLMJobUtilProtocol"]
