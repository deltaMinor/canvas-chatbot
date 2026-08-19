from typing import Any, Protocol


class QuestionnaireExtractorProtocol(Protocol):
    def init_questionnaire(
        self,
        questionnaire: dict[str, Any],
        extraction_logic: list[dict[str, Any]],
    ) -> None: ...
