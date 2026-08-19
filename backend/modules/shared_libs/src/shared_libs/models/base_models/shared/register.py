from pydantic import BaseModel, Field, model_serializer

__all__ = [
    "ThreatFrameworks",
]


class ThreatFrameworks(BaseModel):
    tm: list[str] | None = Field(default_factory=list)
    rapids: list[str] | None = Field(default_factory=list)
    stride: list[str] | None = Field(default_factory=list)
    owasp: list[str] | None = Field(default_factory=list)
    scanHp: list[str] | None = Field(default_factory=list)
    owaspAi: list[str] | None = Field(default_factory=list)

    @model_serializer(mode="wrap")
    def serialize_model(self, handler):
        data = handler(self)
        return {
            key: value for key, value in data.items() if key in self.model_fields_set
        }
