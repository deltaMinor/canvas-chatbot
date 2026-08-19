from typing import Protocol


class OntologyModelProtocol(Protocol):
    individual_names: list[str]

    def equals(
        self,
        value: str,
        target_class_label: str,
    ) -> bool: ...
