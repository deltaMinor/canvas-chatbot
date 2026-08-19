from typing import Optional, Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.alias import Datetime
from shared_libs.models.model_validators import UserBaseValidator

from .shared.shared.database import PatchBaseModel

__all__ = [
    "LoginMetadata",
    "UserEntitlement",
    "TncAcceptance",
    "OnboardingStep",
    "OnboardingInfo",
    "UserBaseModel",
]


class UserEntitlement(BaseModel):
    tag_id: str
    permission_type: str | None = None
    permissions: list[str] = Field(default_factory=list)
    policies: list[str] = Field(default_factory=list)
    roles: list[str] = Field(default_factory=list)


class LoginMetadata(BaseModel):
    timestamp: Datetime
    session_id: str | None = None
    referrer: str | None = None
    authority: str | None = None
    user_agent: str | None = None


class TncAcceptance(BaseModel):
    tnc_type: str
    accepted: bool = Field(default=False)
    accepted_at: Datetime | None = Field(default=None)
    version: str | None = None  # T&C document version

    @model_validator(mode="after")
    def validate_version_when_accepted(self) -> Self:
        if self.accepted and (self.version is None or self.version == ""):
            raise ValueError("version is required when accepted is True")
        return self


class OnboardingStep(BaseModel):
    step_name: str
    step_type: str | None = None  # e.g., "tnc"


class OnboardingInfo(BaseModel):
    required_steps: list["OnboardingStep"] = Field(default_factory=list)
    completed_steps: list[str] = Field(default_factory=list)
    is_complete: bool | None = Field(default=False)


class UserBaseModel(
    PatchBaseModel,
    UserBaseValidator,
):
    user_id: str | None = None
    password: str | None = None
    username: str | None = None
    email: str | None = None
    entitlements: list["UserEntitlement"] = Field(default_factory=list)
    is_admin: bool | None = Field(default=False)
    is_email_verified: bool | None = Field(default=False)
    is_superuser: bool | None = Field(default=False)
    is_temp_password: bool | None = Field(default=False)
    login_metadata: list["LoginMetadata"] = Field(default_factory=list)
    user_status: str | None = Field(default="pending")
    tnc_acceptance_records: list["TncAcceptance"] = Field(default_factory=list)
    onboarding: Optional["OnboardingInfo"] = Field(default=None)
    last_billing_date: str | None = Field(default=None)
    next_billing_date: str | None = Field(default=None)

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

    def __init__(self, **data):
        entitlements: list[dict] = data.get("entitlements", [])
        for entitlement in entitlements:
            entitlement["permissions"].sort()

        super().__init__(**data)
