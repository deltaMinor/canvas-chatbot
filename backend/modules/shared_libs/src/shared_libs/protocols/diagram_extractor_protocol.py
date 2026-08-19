from typing import Any, Protocol


class DiagramExtractorProtocol(Protocol):
    def init_diagrams(
        self,
        diagram: dict[str, Any],
        extraction_logic: list[dict[str, Any]],
    ) -> None: ...
