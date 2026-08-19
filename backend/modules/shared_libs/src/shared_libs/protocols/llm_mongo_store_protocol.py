from typing import Any, Protocol, runtime_checkable


@runtime_checkable
class LlmMongoStoreProtocol(Protocol):
    repository: Any

    def get_document(self, request_id: str) -> dict[str, Any] | None: ...

    def put_request_document(self, request: Any) -> None: ...

    def reserve_request_submission(self, request: Any) -> bool: ...

    def put_job_record(self, job_record: dict[str, Any]) -> Any: ...

    def abort_request_attempt(
        self,
        *,
        request_id: str,
        attempt_id: str,
        reason: str,
    ) -> Any: ...

    def put_result(
        self,
        *,
        request_id: str,
        attempt_id: str,
        result: dict[str, Any],
    ) -> Any: ...

    def put_job_result(
        self,
        *,
        request_id: str,
        attempt_id: str,
        job: dict[str, Any],
        result: dict[str, Any] | None = None,
    ) -> Any: ...

    def get_active_job_documents(self, *, project_id: str) -> list[dict[str, Any]]: ...

    def invalidate_active_jobs(
        self,
        *,
        project_id: str,
        reason: str = "manual_abort",
    ) -> int: ...


__all__ = [
    "LlmMongoStoreProtocol",
]
