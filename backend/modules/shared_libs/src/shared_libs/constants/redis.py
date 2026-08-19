REDIS_APP_PREFLIGHT_EXPIRY = 60 * 60 * 24 * 30
AWS_BEDROCK_CONNECTIVITY_TTL = 300  # seconds; configurable via AWS_CONNECTIVITY_CACHE_TTL env var
# Key pattern: aws:bedrock:connectivity:{hostname}:{pid}  (one entry per service instance)
