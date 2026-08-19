from pydantic import BaseModel, Field, model_validator

from shared_libs.models.base_models.shared.shared.database import PatchBaseModel
from shared_libs.models.model_validators import UserCreditsBaseValidator

__all__ = [
    "AiCreditsModel",
    "ReportingCreditsModel",
    "UserCreditsBaseModel",
    "UserCreditsPatchModel",
]


class AiCreditsModel(BaseModel):
    # Short-term credits — renew every 5 hours
    st_credits: int = Field(default=0)
    st_credits_max: int = Field(default=0)
    st_last_renewed_at: str | None = Field(default=None)
    # Medium-term credits — renew every 7 days
    mt_credits: int = Field(default=0)
    mt_credits_max: int = Field(default=0)
    mt_last_renewed_at: str | None = Field(default=None)
    # Monthly credits — renew on billing cycle start
    mc_credits: int = Field(default=0)
    mc_credits_max: int = Field(default=0)
    mc_last_renewed_at: str | None = Field(default=None)
    # Lifetime credits — non-renewable, deduct on use
    lt_credits: int = Field(default=0)
    lt_credits_max: int = Field(default=0)


class ReportingCreditsModel(BaseModel):
    # Monthly reporting credits — used for PDF/executive summary exports
    reporting_credits: int = Field(default=0)
    reporting_credits_max: int = Field(default=0)
    reporting_last_renewed_at: str | None = Field(default=None)


class UserCreditsBaseModel(PatchBaseModel, UserCreditsBaseValidator):
    user_id: str
    plan_type: str = Field(default="community")
    ai: AiCreditsModel = Field(default_factory=AiCreditsModel)
    reporting: ReportingCreditsModel = Field(default_factory=ReportingCreditsModel)
    # Timestamps (ISO 8601 strings)
    created_at: str | None = Field(default=None)
    updated_at: str | None = Field(default=None)

    @model_validator(mode="before")
    @classmethod
    def _migrate_flat_fields(cls, data: dict) -> dict:
        """Accept legacy flat documents and reshape to nested ai/reporting structure."""
        if not isinstance(data, dict):
            return data
        if "ai" in data or "reporting" in data:
            return data
        # Legacy flat-field migration
        data["ai"] = {
            "st_credits": data.pop("st_credits", 0),
            "st_credits_max": data.pop("st_credits_max", 0),
            "st_last_renewed_at": data.pop("st_last_renewed_at", None),
            "mt_credits": data.pop("mt_credits", 0),
            "mt_credits_max": data.pop("mt_credits_max", 0),
            "mt_last_renewed_at": data.pop("mt_last_renewed_at", None),
            "mc_credits": data.pop("mc_credits", 0),
            "mc_credits_max": data.pop("mc_credits_max", 0),
            "mc_last_renewed_at": data.pop("mc_last_renewed_at", None),
            "lt_credits": data.pop("lt_credits", 0),
            "lt_credits_max": data.pop("lt_credits_max", 0),
        }
        # Accept old diagram, report_gen, or current reporting flat fields
        data["reporting"] = {
            "reporting_credits": data.pop("reporting_credits", data.pop("report_gen_credits", data.pop("diagram_export_credits", 0))),
            "reporting_credits_max": data.pop("reporting_credits_max", data.pop("report_gen_credits_max", data.pop("diagram_export_credits_max", 0))),
            "reporting_last_renewed_at": data.pop("reporting_last_renewed_at", data.pop("report_gen_last_renewed_at", data.pop("diagram_export_last_renewed_at", None))),
        }
        return data

    @model_validator(mode="wrap")
    @classmethod
    def _get_validated(cls, data, handler):
        return cls.get_validated_model(data, handler)


class UserCreditsPatchModel(BaseModel):
    """Partial-update model used by the DB migration task."""
    plan_type: str | None = None
    ai: AiCreditsModel | None = None
    reporting: ReportingCreditsModel | None = None
    updated_at: str | None = None
