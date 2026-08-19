"""Shared utility for renewable credit management.

Handles auto-renewal, deduction (exhaust renewable first / lt_credits fallback),
can-invoke checks, and transaction delta construction for all credit types.

Document structure expected by all methods
------------------------------------------
{
    "user_id": "...",
    "plan_type": "...",
    "ai": {
        "st_credits": int, "st_credits_max": int, "st_last_renewed_at": str|None,
        "mt_credits": int, "mt_credits_max": int, "mt_last_renewed_at": str|None,
        "mc_credits": int, "mc_credits_max": int, "mc_last_renewed_at": str|None,
        "lt_credits": int, "lt_credits_max": int,
    },
    "reporting": {
        "reporting_credits": int, "reporting_credits_max": int,
        "reporting_last_renewed_at": str|None,
    },
    "created_at": str|None, "updated_at": str|None,
}
"""

import math
import uuid
from datetime import datetime, timezone

from shared_libs.constants.application import (
    MT_CREDITS_RENEWAL_SECONDS,
    ST_CREDITS_RENEWAL_SECONDS,
    TOKENS_PER_CREDIT,
)

__all__ = ["RenewableCreditUtil"]

_UNLIMITED = -1


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parse(ts: str | None) -> datetime | None:
    if not ts:
        return None
    dt = datetime.fromisoformat(ts)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _elapsed_seconds(since: str | None, now: datetime) -> float:
    parsed = _parse(since)
    if parsed is None:
        return float("inf")
    return (now - parsed).total_seconds()


def _ai(c: dict) -> dict:
    return c.get("ai", {})


def _reporting(c: dict) -> dict:
    return c.get("reporting", {})


class RenewableCreditUtil:
    """Stateless helper for user credit operations.

    All methods accept and return plain dicts matching UserCreditsBaseModel fields.
    Callers are responsible for persisting the returned dict and logging transactions.
    """

    # ------------------------------------------------------------------
    # Token → credit conversion
    # ------------------------------------------------------------------

    @staticmethod
    def tokens_to_credits(tokens: int) -> int:
        """Convert a token count to an integer credit cost.

        Formula: ceil(tokens / 1000) — i.e. the next-highest multiple of 1 000
        divided by 1 000.

        Examples:
            1 000 tokens → 1 credit
            1 001 tokens → 2 credits
            10 100 tokens → 11 credits

        Zero or negative token counts return 0.
        """
        if tokens <= 0:
            return 0
        return math.ceil(tokens / TOKENS_PER_CREDIT)

    # ------------------------------------------------------------------
    # Auto-renewal
    # ------------------------------------------------------------------

    @staticmethod
    def check_and_renew(credits: dict, now_iso: str) -> tuple[dict, list[dict]]:
        """Check all renewable windows and renew where elapsed.

        Returns:
            (updated_credits_dict, list_of_transaction_delta_dicts)
        """
        now = _parse(now_iso)
        deltas: list[dict] = []
        c = dict(credits)
        ai = dict(_ai(c))

        # Short-term: every 5 hours
        if ai.get("st_credits_max", 0) != _UNLIMITED:
            elapsed = _elapsed_seconds(ai.get("st_last_renewed_at"), now)
            if elapsed >= ST_CREDITS_RENEWAL_SECONDS and ai.get("st_credits_max", 0) > 0:
                st_delta = ai["st_credits_max"] - ai.get("st_credits", 0)
                if st_delta > 0:
                    ai["st_credits"] = ai["st_credits_max"]
                # Always reset the clock so the countdown never stalls at "now"
                # when credits are already at max.
                ai["st_last_renewed_at"] = now_iso
                c["ai"] = ai
                deltas.append(
                    RenewableCreditUtil._make_delta(
                        user_id=c["user_id"],
                        transaction_type="renewal",
                        initiated_by="system",
                        st_delta=st_delta,
                        mt_delta=0,
                        mc_delta=0,
                        lt_delta=0,
                        reporting_delta=0,
                        credits=c,
                        now_iso=now_iso,
                    )
                )

        # Medium-term: every 7 days
        if ai.get("mt_credits_max", 0) != _UNLIMITED:
            elapsed = _elapsed_seconds(ai.get("mt_last_renewed_at"), now)
            if elapsed >= MT_CREDITS_RENEWAL_SECONDS and ai.get("mt_credits_max", 0) > 0:
                mt_delta = ai["mt_credits_max"] - ai.get("mt_credits", 0)
                if mt_delta > 0:
                    ai["mt_credits"] = ai["mt_credits_max"]
                ai["mt_last_renewed_at"] = now_iso
                c["ai"] = ai
                deltas.append(
                    RenewableCreditUtil._make_delta(
                        user_id=c["user_id"],
                        transaction_type="renewal",
                        initiated_by="system",
                        st_delta=0,
                        mt_delta=mt_delta,
                        mc_delta=0,
                        lt_delta=0,
                        reporting_delta=0,
                        credits=c,
                        now_iso=now_iso,
                    )
                )

        c["ai"] = ai
        return c, deltas

    @staticmethod
    def check_and_renew_billing_cycle(
        credits: dict,
        now_iso: str,
        next_billing_date: str | None,
    ) -> tuple[dict, list[dict]]:
        """Renew mc_credits and reporting credits if the billing cycle has rolled over.

        Call this alongside check_and_renew when user billing dates are available.
        """
        if not next_billing_date:
            return credits, []

        now = _parse(now_iso)
        next_bill = _parse(next_billing_date)
        if next_bill is None or now < next_bill:
            return credits, []

        c = dict(credits)
        ai = dict(_ai(c))
        rep = dict(_reporting(c))
        deltas: list[dict] = []

        mc_delta = ai.get("mc_credits_max", 0) - ai.get("mc_credits", 0)
        rg_delta = rep.get("reporting_credits_max", 0) - rep.get("reporting_credits", 0)

        if mc_delta > 0:
            ai["mc_credits"] = ai.get("mc_credits_max", 0)
        if rg_delta > 0:
            rep["reporting_credits"] = rep.get("reporting_credits_max", 0)
        # Always reset clocks when the billing cycle rolls over.
        ai["mc_last_renewed_at"] = now_iso
        rep["reporting_last_renewed_at"] = now_iso
        c["ai"] = ai
        c["reporting"] = rep
        deltas.append(
            RenewableCreditUtil._make_delta(
                user_id=c["user_id"],
                transaction_type="renewal",
                initiated_by="system",
                st_delta=0,
                mt_delta=0,
                mc_delta=mc_delta,
                lt_delta=0,
                reporting_delta=rg_delta,
                credits=c,
                now_iso=now_iso,
            )
        )

        return c, deltas

    # ------------------------------------------------------------------
    # AI invocation gate
    # ------------------------------------------------------------------

    @staticmethod
    def can_invoke_ai(credits: dict, count: int = 1) -> bool:
        """Return True if the user has sufficient credits for `count` AI credits.

        Each renewable tier (st, mt, mc) must provide `count` credits; any shortfall
        from a depleted or partially-depleted tier falls on lt_credits.
        """
        ai = _ai(credits)
        st = ai.get("st_credits", 0)
        mt = ai.get("mt_credits", 0)
        mc = ai.get("mc_credits", 0)
        lt = ai.get("lt_credits", 0)

        if lt == _UNLIMITED:
            return True

        def _shortfall(bal: int) -> int:
            if bal == _UNLIMITED:
                return 0
            return max(0, count - bal)

        total_shortfall = _shortfall(st) + _shortfall(mt) + _shortfall(mc)
        if total_shortfall == 0:
            return True
        return lt >= total_shortfall

    @staticmethod
    def can_generate_report(credits: dict) -> bool:
        """Return True if the user has at least 1 report generation credit."""
        rep = _reporting(credits)
        rc = rep.get("reporting_credits", 0)
        ai = _ai(credits)
        lt = ai.get("lt_credits", 0)
        if rep.get("reporting_credits_max", 0) == _UNLIMITED or rc == _UNLIMITED:
            return True
        return rc > 0 or lt == _UNLIMITED or lt > 0

    # ------------------------------------------------------------------
    # Deduction
    # ------------------------------------------------------------------

    @staticmethod
    def deduct_ai(
        credits: dict,
        initiated_by: str,
        now_iso: str,
        count: int = 1,
        transaction_id: str | None = None,
    ) -> tuple[dict, dict]:
        """Deduct `count` credits across renewable tiers; lt_credits covers any shortfall.

        Each renewable tier (st, mt, mc) contributes up to `count` credits.
        Any tier that cannot fully contribute has its shortfall absorbed by lt_credits.

        Returns:
            (updated_credits_dict, transaction_delta_dict)

        Raises:
            ValueError: if count < 1 or credits are insufficient.
        """
        if count < 1:
            raise ValueError("count must be at least 1.")
        if not RenewableCreditUtil.can_invoke_ai(credits, count=count):
            raise ValueError("Insufficient credits to invoke AI.")

        if transaction_id is None:
            transaction_id = str(uuid.uuid4())

        c = dict(credits)
        ai = dict(_ai(c))

        def _tier_deduct(bal: int) -> tuple[int, int]:
            """Returns (delta, covered). delta ≤ 0, covered ≥ 0."""
            if bal == _UNLIMITED:
                return 0, count
            if bal <= 0:
                return 0, 0
            actual = min(bal, count)
            return -actual, actual

        st_delta, st_covered = _tier_deduct(ai.get("st_credits", 0))
        mt_delta, mt_covered = _tier_deduct(ai.get("mt_credits", 0))
        mc_delta, mc_covered = _tier_deduct(ai.get("mc_credits", 0))

        # lt absorbs the total shortfall across all three tiers
        total_covered = st_covered + mt_covered + mc_covered
        lt_delta = total_covered - (3 * count)  # negative = deduct from lt

        ai["st_credits"] = max(0, ai.get("st_credits", 0) + st_delta)
        ai["mt_credits"] = max(0, ai.get("mt_credits", 0) + mt_delta)
        ai["mc_credits"] = max(0, ai.get("mc_credits", 0) + mc_delta)

        lt = ai.get("lt_credits", 0)
        if lt_delta < 0 and lt != _UNLIMITED:
            ai["lt_credits"] = max(0, lt + lt_delta)

        c["ai"] = ai

        delta = RenewableCreditUtil._make_delta(
            user_id=c["user_id"],
            transaction_type="deduction",
            initiated_by=initiated_by,
            st_delta=st_delta,
            mt_delta=mt_delta,
            mc_delta=mc_delta,
            lt_delta=lt_delta if ai.get("lt_credits", 0) != _UNLIMITED else 0,
            reporting_delta=0,
            credits=c,
            now_iso=now_iso,
            transaction_id=transaction_id,
        )

        return c, delta

    @staticmethod
    def deduct_reporting(
        credits: dict,
        initiated_by: str,
        now_iso: str,
        transaction_id: str | None = None,
    ) -> tuple[dict, dict]:
        """Deduct 1 reporting credit.

        Falls back to lt_credits when reporting_credits is exhausted.

        Raises:
            ValueError: if both reporting_credits and lt_credits are exhausted.
        """
        rep = _reporting(credits)
        rc = rep.get("reporting_credits", 0)
        max_rc = rep.get("reporting_credits_max", 0)
        ai = _ai(credits)
        lt = ai.get("lt_credits", 0)

        if max_rc == _UNLIMITED or rc == _UNLIMITED:
            return credits, {}

        if rc <= 0 and lt != _UNLIMITED and lt <= 0:
            raise ValueError("Insufficient report generation credits.")

        if transaction_id is None:
            transaction_id = str(uuid.uuid4())

        c = dict(credits)
        ai = dict(ai)
        rep = dict(rep)

        if rc > 0:
            rep["reporting_credits"] = rc - 1
            rg_delta = -1
            lt_delta = 0
        else:
            lt_delta = -1
            rg_delta = 0
            if lt != _UNLIMITED:
                ai["lt_credits"] = max(0, lt - 1)
            c["ai"] = ai

        c["reporting"] = rep

        delta = RenewableCreditUtil._make_delta(
            user_id=c["user_id"],
            transaction_type="deduction",
            initiated_by=initiated_by,
            st_delta=0,
            mt_delta=0,
            mc_delta=0,
            lt_delta=lt_delta,
            reporting_delta=rg_delta,
            credits=c,
            now_iso=now_iso,
            transaction_id=transaction_id,
        )
        return c, delta

    # ------------------------------------------------------------------
    # Reload (manual adjustment or admin grant)
    # ------------------------------------------------------------------

    @staticmethod
    def reload(
        credits: dict,
        initiated_by: str,
        now_iso: str,
        st_delta: int = 0,
        mt_delta: int = 0,
        mc_delta: int = 0,
        lt_delta: int = 0,
        reporting_delta: int = 0,
        transaction_id: str | None = None,
    ) -> tuple[dict, dict]:
        """Apply arbitrary credit deltas (reload/admin adjustment).

        Positive delta = add credits. Negative delta = remove credits.
        Guards: balances never go below 0 or accidentally hit -1 (sentinel).
        """
        if transaction_id is None:
            transaction_id = str(uuid.uuid4())

        c = dict(credits)
        ai = dict(_ai(c))
        rep = dict(_reporting(c))

        def _apply(current: int, delta: int) -> int:
            if current == _UNLIMITED:
                return current
            result = current + delta
            if result < 0:
                return 0
            # Sentinel -1 is reserved — skip it if we'd land exactly on it
            if result == _UNLIMITED:
                return 0 if delta < 0 else 2
            return result

        ai["st_credits"] = _apply(ai.get("st_credits", 0), st_delta)
        ai["mt_credits"] = _apply(ai.get("mt_credits", 0), mt_delta)
        ai["mc_credits"] = _apply(ai.get("mc_credits", 0), mc_delta)
        ai["lt_credits"] = _apply(ai.get("lt_credits", 0), lt_delta)
        rep["reporting_credits"] = _apply(rep.get("reporting_credits", 0), reporting_delta)

        c["ai"] = ai
        c["reporting"] = rep

        delta = RenewableCreditUtil._make_delta(
            user_id=c["user_id"],
            transaction_type="reload",
            initiated_by=initiated_by,
            st_delta=st_delta,
            mt_delta=mt_delta,
            mc_delta=mc_delta,
            lt_delta=lt_delta,
            reporting_delta=reporting_delta,
            credits=c,
            now_iso=now_iso,
            transaction_id=transaction_id,
        )
        return c, delta

    # ------------------------------------------------------------------
    # Init helper
    # ------------------------------------------------------------------

    @staticmethod
    def init_credits(
        user_id: str,
        plan_type: str,
        st_max: int,
        mt_max: int,
        mc_max: int,
        lt_max: int,
        reporting_max: int,
        now_iso: str,
    ) -> tuple[dict, dict]:
        """Build a fresh UserCreditsBaseModel dict and its init transaction delta."""
        transaction_id = str(uuid.uuid4())
        credits: dict = {
            "user_id": user_id,
            "plan_type": plan_type,
            "ai": {
                "st_credits": st_max,
                "st_credits_max": st_max,
                "st_last_renewed_at": now_iso,
                "mt_credits": mt_max,
                "mt_credits_max": mt_max,
                "mt_last_renewed_at": now_iso,
                "mc_credits": mc_max,
                "mc_credits_max": mc_max,
                "mc_last_renewed_at": now_iso,
                "lt_credits": lt_max,
                "lt_credits_max": lt_max,
            },
            "reporting": {
                "reporting_credits": reporting_max,
                "reporting_credits_max": reporting_max,
                "reporting_last_renewed_at": now_iso,
            },
            "created_at": now_iso,
            "updated_at": now_iso,
        }
        delta = RenewableCreditUtil._make_delta(
            user_id=user_id,
            transaction_type="init",
            initiated_by="system",
            st_delta=st_max,
            mt_delta=mt_max,
            mc_delta=mc_max,
            lt_delta=lt_max,
            reporting_delta=reporting_max,
            credits=credits,
            now_iso=now_iso,
            transaction_id=transaction_id,
        )
        return credits, delta

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _make_delta(
        user_id: str,
        transaction_type: str,
        initiated_by: str,
        st_delta: int,
        mt_delta: int,
        mc_delta: int,
        lt_delta: int,
        reporting_delta: int,
        credits: dict,
        now_iso: str,
        transaction_id: str | None = None,
    ) -> dict:
        ai = _ai(credits)
        rep = _reporting(credits)
        return {
            "transaction_id": transaction_id or str(uuid.uuid4()),
            "user_id": user_id,
            "transaction_type": transaction_type,
            "initiated_by": initiated_by,
            "ai": {
                "st_delta": st_delta,
                "mt_delta": mt_delta,
                "mc_delta": mc_delta,
                "lt_delta": lt_delta,
                "st_balance_after": ai.get("st_credits", 0),
                "mt_balance_after": ai.get("mt_credits", 0),
                "mc_balance_after": ai.get("mc_credits", 0),
                "lt_balance_after": ai.get("lt_credits", 0),
            },
            "reporting": {
                "reporting_delta": reporting_delta,
                "reporting_balance_after": rep.get("reporting_credits", 0),
            },
            "transacted_at": now_iso,
        }
