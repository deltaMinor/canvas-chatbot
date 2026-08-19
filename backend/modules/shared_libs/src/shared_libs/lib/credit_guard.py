"""Credit guard classes for AI invocation gating and deduction.

Single LLM call
---------------
    guard = CreditGuard(celery_app)
    delta = guard.check_and_deduct_ai(user_id, initiated_by, now_iso, user_info)

Multi-step pipeline (accumulate tokens, deduct once on success)
----------------------------------------------------------------
    guard = CreditGuard(celery_app)
    guard.gate_check(user_id, now_iso, user_info)          # pre-flight only

    session = PipelineCreditSession(guard, user_id, initiated_by, user_info,
                                    operation_floor=3)

    # ... run each LLM step ...
    session.add_tokens(response.usage.total_tokens)

    # On success — deducts ceil(total_tokens / 1000), floored by operation_floor:
    session.flush(now_iso)
    # On failure — let session go out of scope; nothing is deducted.

Report generation deduction
----------------------------
    guard = CreditGuard(celery_app)
    guard.check_and_deduct_reporting(user_id, initiated_by, now_iso, user_info)
"""

import logging

from shared_libs.lib.renewable_credit import RenewableCreditUtil

__all__ = ["CreditGuard", "PipelineCreditSession", "check_and_deduct_ai_credit"]

logger = logging.getLogger(__name__)


class CreditGuard:
    """Manages credit gating, auto-renewal, and deduction for AI invocations.

    Instantiate once per Celery task using the task's celery_app, then reuse
    across multiple calls within the same task.
    """

    def __init__(self, celery_app):
        from shared_libs.domain import CreditTransactionLogService, UserCreditsService
        from shared_libs.infrastructure.producer.service import Producer
        from shared_libs.infrastructure.remote_repository.service import RemoteRepository
        from shared_libs.models.base_models import ProducerDataModel
        from shared_libs.producers.producer_data import (
            producer_data_credit_transaction_log,
            producer_data_user_credits,
        )

        self._user_credits_service = UserCreditsService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(**producer_data_user_credits),
                    celery_app=celery_app,
                )
            )
        )
        self._credit_log_service = CreditTransactionLogService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(**producer_data_credit_transaction_log),
                    celery_app=celery_app,
                )
            )
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def gate_check(self, user_id: str, now_iso: str, user_info: dict) -> dict:
        """Auto-renew and verify the user has at least 1 invocable credit.

        Use this at the start of a pipeline to fail fast without deducting yet.

        Returns the current credits dict (after any renewals applied).
        Raises ValueError if no credit record exists or credits are exhausted.
        """
        credits = self._fetch(user_id)
        credits = self._auto_renew(credits, now_iso, user_info)
        if not RenewableCreditUtil.can_invoke_ai(credits):
            raise ValueError(
                "Insufficient AI credits. Your credits will renew automatically — "
                "please wait and try again later."
            )
        return credits

    def check_and_deduct_ai(
        self,
        user_id: str,
        initiated_by: str,
        now_iso: str,
        user_info: dict,
        count: int = 1,
        transaction_id: str | None = None,
    ) -> dict:
        """Auto-renew, gate-check, and deduct `count` AI credits atomically.

        Returns the deduction transaction delta dict.
        Raises ValueError if credits are insufficient.
        """
        credits = self._fetch(user_id)
        credits = self._auto_renew(credits, now_iso, user_info)

        if not RenewableCreditUtil.can_invoke_ai(credits, count=count):
            raise ValueError(
                "Insufficient AI credits. Your credits will renew automatically — "
                "please wait and try again later."
            )

        credits, delta = RenewableCreditUtil.deduct_ai(
            credits,
            initiated_by=initiated_by,
            now_iso=now_iso,
            count=count,
            transaction_id=transaction_id,
        )
        self._persist(credits, delta, user_info, now_iso)

        logger.info(
            "[ CREDIT-GUARD ] Deducted %d AI credit(s) for user %s (txn=%s)",
            count,
            user_id,
            delta.get("transaction_id"),
        )
        return delta

    def check_and_deduct_reporting(
        self,
        user_id: str,
        initiated_by: str,
        now_iso: str,
        user_info: dict,
        transaction_id: str | None = None,
    ) -> dict:
        """Auto-renew, gate-check, and deduct 1 report generation credit atomically.

        Returns the deduction transaction delta dict.
        Raises ValueError if credits are insufficient.
        """
        credits = self._fetch(user_id)
        credits = self._auto_renew(credits, now_iso, user_info)

        if not RenewableCreditUtil.can_generate_report(credits):
            raise ValueError(
                "Insufficient report generation credits. "
                "Your credits will renew at the next billing cycle."
            )

        credits, delta = RenewableCreditUtil.deduct_reporting(
            credits,
            initiated_by=initiated_by,
            now_iso=now_iso,
            transaction_id=transaction_id,
        )
        self._persist(credits, delta, user_info, now_iso)

        logger.info(
            "[ CREDIT-GUARD ] Deducted 1 reporting credit for user %s (txn=%s)",
            user_id,
            delta.get("transaction_id"),
        )
        return delta

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _fetch(self, user_id: str) -> dict:
        credits = self._user_credits_service.get_one(
            {"user_id": user_id},
            raise_if_not_found=False,
        )
        if not credits:
            raise ValueError(
                f"No AI credit record found for user {user_id!r}. "
                "Run the 'Initialize User AI Data' admin tool to set up credits."
            )
        return credits

    def _auto_renew(self, credits: dict, now_iso: str, user_info: dict) -> dict:
        credits, renewal_deltas = RenewableCreditUtil.check_and_renew(credits, now_iso)
        for rdelta in renewal_deltas:
            self._persist(credits, rdelta, user_info, now_iso)
        return credits

    def _persist(self, credits: dict, delta: dict, user_info: dict, now_iso: str) -> None:
        user_id = credits.get("user_id", "")
        ai = credits.get("ai", {})
        rep = credits.get("reporting", {})
        self._user_credits_service.update_one(
            {"user_id": user_id},
            payload={
                "ai": {
                    "st_credits": ai.get("st_credits", 0),
                    "st_credits_max": ai.get("st_credits_max", 0),
                    "st_last_renewed_at": ai.get("st_last_renewed_at"),
                    "mt_credits": ai.get("mt_credits", 0),
                    "mt_credits_max": ai.get("mt_credits_max", 0),
                    "mt_last_renewed_at": ai.get("mt_last_renewed_at"),
                    "mc_credits": ai.get("mc_credits", 0),
                    "mc_credits_max": ai.get("mc_credits_max", 0),
                    "mc_last_renewed_at": ai.get("mc_last_renewed_at"),
                    "lt_credits": ai.get("lt_credits", 0),
                    "lt_credits_max": ai.get("lt_credits_max", 0),
                },
                "reporting": {
                    "reporting_credits": rep.get("reporting_credits", 0),
                    "reporting_credits_max": rep.get("reporting_credits_max", 0),
                    "reporting_last_renewed_at": rep.get("reporting_last_renewed_at"),
                },
                "updated_at": now_iso,
            },
            user_info=user_info,
        )
        self._credit_log_service.update_one(
            {"transaction_id": delta["transaction_id"]},
            payload=delta,
            user_info=user_info,
            upsert=True,
        )


class PipelineCreditSession:
    """Accumulates token usage across a multi-step pipeline, deducts once on success.

    Token→credit formula: max(operation_floor, ceil(total_tokens / 1_000)).
    No tokens accumulated, or flush() never called → no deduction (failed pipelines
    are free).
    """

    def __init__(
        self,
        guard: CreditGuard,
        user_id: str,
        initiated_by: str,
        user_info: dict,
        operation_floor: int = 1,
    ):
        self._guard = guard
        self._user_id = user_id
        self._initiated_by = initiated_by
        self._user_info = user_info
        self._operation_floor = max(1, operation_floor)
        self._total_tokens: int = 0

    def add_tokens(self, tokens: int) -> None:
        """Accumulate tokens from one successful LLM step."""
        if tokens > 0:
            self._total_tokens += tokens

    @property
    def total_tokens(self) -> int:
        return self._total_tokens

    def flush(self, now_iso: str) -> dict | None:
        """Deduct accumulated credits. Call only on pipeline success.

        Returns the deduction delta dict, or None if no tokens were recorded.
        """
        if self._total_tokens <= 0:
            return None

        count = max(
            self._operation_floor,
            RenewableCreditUtil.tokens_to_credits(self._total_tokens),
        )
        delta = self._guard.check_and_deduct_ai(
            user_id=self._user_id,
            initiated_by=self._initiated_by,
            now_iso=now_iso,
            user_info=self._user_info,
            count=count,
        )
        logger.info(
            "[ PIPELINE-SESSION ] %d tokens → %d credit(s) for user %s (txn=%s)",
            self._total_tokens,
            count,
            self._user_id,
            delta.get("transaction_id"),
        )
        return delta


# ---------------------------------------------------------------------------
# Backwards-compatible shim — kept until Task #10 migrates all LLM callers
# ---------------------------------------------------------------------------

def check_and_deduct_ai_credit(
    user_id: str,
    initiated_by: str,
    now_iso: str,
    celery_app,
    user_info: dict,
    transaction_id: str | None = None,
) -> dict:
    """Deprecated: use CreditGuard.check_and_deduct_ai() directly."""
    return CreditGuard(celery_app).check_and_deduct_ai(
        user_id=user_id,
        initiated_by=initiated_by,
        now_iso=now_iso,
        user_info=user_info,
        count=1,
        transaction_id=transaction_id,
    )
