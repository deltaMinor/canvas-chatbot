from typing import Any, Protocol


class ThreatQualityCheckerProtocol(Protocol):
    def process(self, scenario: dict[str, Any]) -> dict[str, Any]: ...


__all__ = [
    "ThreatQualityCheckerProtocol",
]
