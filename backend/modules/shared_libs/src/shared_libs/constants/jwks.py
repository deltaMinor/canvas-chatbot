# JWKS Redis Configuration
JWKS_REDIS_KEY = "jwks:current"
# 1 hour TTL for security (keys should be rotated regularly)
JWKS_TTL_SECONDS = 3600

# JWKS Key Configuration
JWKS_SERVICE_ID = "auth-service"
JWKS_KEY_VERSION = "v1"
JWKS_KEY_ALGORITHM = "RS256"
JWKS_KEY_TYPE = "RSA"
JWKS_KEY_USE = "sig"

# JWKS Structure Validation
JWKS_REQUIRED_FIELDS = ["kty", "kid", "alg", "use", "n", "e"]
JWKS_TOP_LEVEL_FIELDS = ["jwks"]

# JWKS Response Fields
JWKS_RESPONSE_FIELDS = [
    "jwks",
    "key_id",
    "algorithm",
    "key_type",
    "use",
    "generated_at",
    "ttl_seconds",
]
