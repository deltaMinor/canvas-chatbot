from .colors import log_colors


def get_custom_logging(
    level: str,
):
    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "simple": {
                "()": "colorlog.ColoredFormatter",
                "format": "[%(asctime)s %(log_color)s%(levelname)-8s%(reset)s] %(message)s <%(name)s>",
                "datefmt": "%Y-%m-%d %H:%M:%S",
                "style": "%",
                "log_colors": log_colors,
            },
        },
        "filters": {
            # Heartbeat/polling endpoints are hit every few seconds and would
            # otherwise dominate the access log — drop just those requests.
            "suppress_polling_paths": {
                "()": "shared_libs.logger.filters.SuppressPathAccessFilter",
                "suppressed_substrings": ["/heartbeat"],
            },
        },
        "handlers": {
            "console": {
                "level": level,
                "class": "logging.StreamHandler",
                "formatter": "simple",
                "stream": "ext://sys.stdout",
            },
            # "file": {
            #     "level": level,
            #     "class": "logging.FileHandler",
            #     "filename": "server.log",
            #     "formatter": "simple_white",
            # },
        },
        "root": {
            "handlers": ["console"],
            "level": level,
        },
        "loggers": {
            "django": {
                "level": level,
                "handlers": ["console"],
                "propagate": False,
            },
            # Django's technical 404 debug page probes attributes (e.g. `.name`)
            # that plain URLResolver objects don't have, which it logs at DEBUG
            # with a full traceback on every 404 — not an actual problem.
            "django.template": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "django.utils.autoreload": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            # Suppress verbose DEBUG output from the OpenAI SDK and its
            # underlying httpx HTTP client (request/response body dumps).
            "openai": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            "httpx": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "httpcore": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "sentence_transformers": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "PIL": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "service.lib.jwks": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "engine_libs.utils": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "engine_libs.lib.bases": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "shared_libs.lib.authentication_service": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "register_libs.lib.bases": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            # Suppress verbose DEBUG/INFO output from the shared_libs domain layer
            # (repository read/write logs emitted on every request).
            "shared_libs.lib.domain": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "shared_libs.infrastructure": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "shared_libs.lib.health_status": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "shared_libs.middleware": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "shared_libs.lib.redis_util": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn.access": {
                "level": level,
                "handlers": ["console"],
                "filters": ["suppress_polling_paths"],
                "propagate": False,
            },
        },
    }
