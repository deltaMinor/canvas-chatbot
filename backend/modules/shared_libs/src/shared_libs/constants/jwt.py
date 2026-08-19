# JWT Configuration Constants

from datetime import timedelta

JWT_ALGO = "RS256"
JWT_ISS = "threatmirror"
JWT_TOKEN_TYPE = "Bearer"
JWT_AUD = "threatmirror-api"

# TTL values — all aligned to the 1-hour inactivity threshold so that
# a truly idle user is always forced to re-authenticate within that window.
ACCESS_TTL = timedelta(minutes=15)  # Short-lived access tokens (unchanged)
REFRESH_TTL = timedelta(hours=1)  # Default refresh tokens (was days=1)
REFRESH_TTL_LONG = timedelta(hours=8)  # "Remember me" refresh tokens (was days=7)

# HttpOnly cookie names for access and refresh tokens.
# These are set by the authentication service on login/refresh and
# cleared on logout.  They are never exposed to JavaScript.
ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"
