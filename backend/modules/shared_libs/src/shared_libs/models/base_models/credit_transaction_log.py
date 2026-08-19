from typing import Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.models.model_validators import CreditTransactionLogBaseValidator

from .shared.shared.database import PatchBaseModel

__all__ = [
    "AiTransactionFields",
    "ReportingTransactionFields",
    "CreditTransactionLogBaseModel",
    "CreditTransactionLogPatchModel",
]


class AiTransactionFields(BaseModel):
    # Credit deltas (positive = credits added, negative = credits removed)
    st_delta: int = Field(default=0)
    mt_delta: int = Field(default=0)
    mc_delta: int = Field(default=0)
    lt_delta: int = Field(default=0)
    # Balances recorded immediately after this transaction
    st_balance_after: int = Field(default=0)
    mt_balance_after: int = Field(default=0)
    mc_balance_after: int = Field(default=0)
    lt_balance_after: int = Field(default=0)


class ReportingTransactionFields(BaseModel):
    reporting_delta: int = Field(default=0)
    reporting_balance_after: int = Field(default=0)


class CreditTransactionLogBaseModel(
    PatchBaseModel,
    CreditTransactionLogBaseValidator,
):
    transaction_id: str  # UUID shared with ai_invocation_log when triggered by LLM call
    user_id: str
    # "deduction" | "renewal" | "reload" | "init"
    transaction_type: str
    initiated_by: str  # user_id string or literal "system"
    ai: AiTransactionFields = Field(default_factory=AiTransactionFields)
    reporting: ReportingTransactionFields = Field(default_factory=ReportingTransactionFields)
    # Optional human-readable note (e.g. "auto-renewal", "admin adjustment")
    note: str | None = Field(default=None)
    transacted_at: str | None = Field(default=None)

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


class CreditTransactionLogPatchModel(BaseModel):
    """Partial-update model for selective field overwrites."""
    transaction_type: str | None = None
    initiated_by: str | None = None
    ai: AiTransactionFields | None = None
    reporting: ReportingTransactionFields | None = None
    note: str | None = None
    transacted_at: str | None = None
