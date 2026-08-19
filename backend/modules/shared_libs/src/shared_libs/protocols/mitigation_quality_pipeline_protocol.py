from typing import Any, Protocol


class MitigationQualityPipelineProtocol(Protocol):
    def process(self, mitigations: list[dict[str, Any]]) -> dict[str, Any]: ...

    def pair_master_lookup(self, mitigation_id: str, technique_id: str) -> Any: ...

    def pair_use_description(
        self, mitigation_id: str, technique_id: str
    ) -> str | None: ...

    def lookup(self, mitigation_id: str) -> dict[str, str] | None: ...

    def master_lookup(self, mitigation_id: str) -> Any: ...


__all__ = [
    "MitigationQualityPipelineProtocol",
]
