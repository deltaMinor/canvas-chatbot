from typing import Literal, Optional, Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.model_validators import TokenBaseValidator

from .shared.shared.database import PatchBaseModel

__all__ = [
    "TokenBaseModel",
    "JwtDictModel",
    "RedisTokenBaseModel",
]


class TokenBaseModel(
    PatchBaseModel,
    TokenBaseValidator,
):
    encoded_token: str | None = Field(default="")
    token_id: str | None = Field(default="")
    token_type: str | None = Field(default="")
    user_id: str | None = Field(default="")
    username: str | None = Field(default="")

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class JwtDictModel(BaseModel):
    user_id: str
    username: str | None = Field(default="")
    is_temp_password: bool | None = Field(default=False)
    remember_me: bool | None = Field(default=False)
    iat: int | None = 0
    nbf: int | None = 0
    exp: int | None = 0
    iss: str | None = Field(default="")
    jti: str
    type: Literal["access", "refresh"]
    sid: str | None = Field(default="")
    sub: str | None = Field(default="")

    @model_validator(mode="after")
    def validate_token_type(self) -> Self:
        """Validate token type and required fields."""
        if self.type not in ["access", "refresh"]:
            raise ValueError("Token type must be 'access' or 'refresh'")

        if not self.user_id:
            raise ValueError("User ID is required")

        if not self.jti:
            raise ValueError("JTI (JWT ID) is required")

        return self

    def is_expired(self) -> bool:
        """Check if the token is expired."""
        import time

        return self.exp and int(time.time()) > self.exp

    def is_valid(self) -> bool:
        """Check if the token is valid (not expired and has required fields)."""
        return not self.is_expired() and bool(self.user_id and self.jti)


class RedisTokenBaseModel(BaseModel):
    encoded_token: str | None = Field(default="")
    decoded_token: Optional["JwtDictModel"] = Field(
        default_factory=JwtDictModel,
    )
    token_type: str | None = Field(default="")
