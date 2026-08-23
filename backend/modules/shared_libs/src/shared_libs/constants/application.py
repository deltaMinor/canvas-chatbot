TIER_LEVEL_TO_PLAN_TYPE: dict[int, str] = {
    1: "community",
    2: "premium",
    3: "enterprise",
}

# Renewal window durations in seconds
ST_CREDITS_RENEWAL_SECONDS: int = 18000    # 5 hours
MT_CREDITS_RENEWAL_SECONDS: int = 604800   # 7 days
MC_CREDITS_RENEWAL_SECONDS: int = 2592000  # 30 days
REPORT_GEN_RENEWAL_SECONDS: int = 2592000  # 30 days

# Credit deduction: 1 credit per 1 000 tokens (ceil division)
TOKENS_PER_CREDIT: int = 1000

USER_CREDITS_BALANCE_UPDATE_PERMISSION = "user_credits.balance.update"
USER_CREDITS_REFRESH_CREATE_PERMISSION = "user_credits_refresh.create"
