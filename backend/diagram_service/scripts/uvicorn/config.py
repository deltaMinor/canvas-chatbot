import os
import sys
from pathlib import Path

from dotenv import load_dotenv

from shared_libs.logger.custom_logging import get_custom_logging

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env", override=False)


def _to_int(env, default):
    try:
        return int(os.environ.get(env, str(default)))
    except (TypeError, ValueError):
        return int(default)


def _get_log_level():
    return os.environ.get(
        "APP_LOGGER_LEVEL", os.environ.get("UVICORN_LOG_LEVEL", "INFO")
    )


DJANGO_SERVICE_PORT = os.environ.get("DJANGO_SERVICE_AD_PORT_EXPOSED", "8006")

UVICORN_INNER_APP = os.environ.get("UVICORN_INNER_APP", "main.asgi:application")
UVICORN_APP = os.environ.get("UVICORN_APP", "scripts.uvicorn.server:create_application")
UVICORN_HOST = os.environ.get("UVICORN_HOST", "0.0.0.0")
UVICORN_PORT = _to_int("UVICORN_PORT", DJANGO_SERVICE_PORT)
UVICORN_WORKERS = (
    1 if sys.platform == "win32" else max(1, _to_int("UVICORN_WORKERS", 1))
)
UVICORN_THREAD_POOL_WORKERS = max(1, _to_int("UVICORN_THREAD_POOL_WORKERS", 32))
UVICORN_TIMEOUT_KEEP_ALIVE = _to_int("UVICORN_TIMEOUT_KEEP_ALIVE", 5)
UVICORN_TIMEOUT_GRACEFUL_SHUTDOWN = _to_int("UVICORN_TIMEOUT_GRACEFUL_SHUTDOWN", 30)
UVICORN_LOG_LEVEL = _get_log_level().lower()

CUSTOM_LOGGING = get_custom_logging(_get_log_level().upper())
