from typing import Any, TypeAlias

Datetime: TypeAlias = Any
InitialValue: TypeAlias = Any
MetadataModelData: TypeAlias = Any
QuestionnaireValue: TypeAlias = dict[str, Any]
AttackObject: TypeAlias = dict[str, Any]

__all__ = [
    "AttackObject",
    "Datetime",
    "InitialValue",
    "MetadataModelData",
    "QuestionnaireValue",
]
