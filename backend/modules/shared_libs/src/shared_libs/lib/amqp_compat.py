"""Compatibility helpers for third-party AMQP runtime issues."""

import logging

logger = logging.getLogger(__name__)


def patch_amqp_logger_alias() -> None:
    """Patch amqp 5.3.1 logger-name typo before Celery opens connections."""
    try:
        import amqp.channel
        import amqp.connection
    except ImportError:
        logger.debug("amqp package not available; skipping AMQP logger alias patch.")
        return

    for module in (amqp.connection, amqp.channel):
        if hasattr(module, "AMQP_LOGGER") and not hasattr(module, "AMQP_logger"):
            module.AMQP_logger = module.AMQP_LOGGER

    if hasattr(amqp.connection, "AMQP_HEARTBEAT_LOGGER") and not hasattr(
        amqp.connection,
        "AMQP_HEARTBEAT_logger",
    ):
        amqp.connection.AMQP_HEARTBEAT_logger = amqp.connection.AMQP_HEARTBEAT_LOGGER
