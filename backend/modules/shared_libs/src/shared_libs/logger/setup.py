import logging
import os
import sys

import colorlog

from .colors import log_colors

app_loggers = [
    "app_logger",
]
info_loggers = [
    "django.utils.autoreload",
]
warning_loggers = [
    "amqp",
    "bcdocs",
    "boto3",
    "botocore",
    "celery",
    "concurrent",
    "drf_yasg",
    "gunicorn",
    "kombu",
    "PIL",
    "pydot",
    "push_response",
    "pyasn1",
    "pymongo",
    "python_http_client",
    "redis",
    "urllib3",
]


def set_loggers_to_level(
    logger_names: list[str],
    level: str,
    stream_handler: "logging.StreamHandler",
):
    for logger_name in logger_names:
        logger = logging.getLogger(logger_name)
        logger.setLevel(level)
        # logger.propagate = False

        # =======================
        # Clear existing handlers
        # =======================
        for handler in list(logger.handlers):
            logger.removeHandler(handler)

        logger.addHandler(stream_handler)
        logger.propagate = False
        # logger.info(f"logger_name     : {logger_name}")

        # =====================
        # Create a file handler
        # =====================
        # file_formatter = colorlog.ColoredFormatter(
        #     fmt="[%(asctime)s %(levelname)-8s] %(message)s <%(name)s>",
        #     datefmt="%Y-%m-%d %H:%M:%S",
        #     style="%",
        # )
        # file_handler = logging.FileHandler("server.log")
        # file_handler.setFormatter(file_formatter)
        # logger.addHandler(file_handler)


def _resolve_logger_level(level: int | str | None) -> int | str:
    if level is not None:
        return level

    env_level = os.environ.get("APP_LOGGER_LEVEL")
    if env_level is not None:
        return env_level

    return logging.INFO


def setup_app_logger(level: int | str | None = None):
    app_logger_level = _resolve_logger_level(level)

    # =======================
    # Create a stream handler
    # =======================
    stream_formatter = colorlog.ColoredFormatter(
        fmt="[%(asctime)s %(log_color)s%(levelname)-8s%(reset)s] %(message)s <%(name)s>",
        datefmt="%Y-%m-%d %H:%M:%S",
        style="%",
        log_colors=log_colors,
    )
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(stream_formatter)

    # Configure root logger to handle all module-specific loggers
    root_logger = logging.getLogger()
    root_logger.setLevel(app_logger_level)
    root_logger.addHandler(stream_handler)
    root_logger.propagate = False

    set_loggers_to_level(
        app_loggers,
        app_logger_level,
        stream_handler,
    )

    set_loggers_to_level(
        info_loggers,
        logging.INFO,
        stream_handler,
    )

    set_loggers_to_level(
        warning_loggers,
        logging.WARNING,
        stream_handler,
    )
