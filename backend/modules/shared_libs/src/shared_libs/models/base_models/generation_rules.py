from pydantic import BaseModel, Field

__all__ = [
    "GenerationRulesDictModel",
]


class GenerationRulesDictModel(BaseModel):
    master_register: dict | None = Field(default={})
    mitre_attack: dict | None = Field(default={})
