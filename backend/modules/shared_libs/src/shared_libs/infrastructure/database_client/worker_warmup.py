import importlib
import logging
import os

from celery import Celery

from shared_libs.infrastructure.database_client.database_client_manager import (
    DatabaseClientManager,
)

logger = logging.getLogger(__name__)


def warm_worker_mongo_connection(
    client_module_path: str,
    sender: Celery | None = None,
) -> None:
    worker_name = getattr(sender, "hostname", None) or getattr(
        sender, "name", "unknown"
    )
    database_username = os.environ.get("DB_USERNAME")
    database_password = os.environ.get("DB_PASSWORD")

    if not database_username or not database_password:
        logger.info(
            "[ SHARED-INFRA ] Skipping Mongo warmup for worker %s: database credentials are not configured.",
            worker_name,
        )
        return

    try:
        client_module = importlib.import_module(client_module_path)
    except ImportError:
        logger.info(
            "[ SHARED-INFRA ] Skipping Mongo warmup for worker %s: module %s not found.",
            worker_name,
            client_module_path,
        )
        return
    except Exception as exc:
        logger.warning(
            "Skipping Mongo warmup for worker %s: failed to import %s (%s).",
            worker_name,
            client_module_path,
            exc,
        )
        return

    database_client_manager = getattr(client_module, "database_client_manager", None)
    if not isinstance(database_client_manager, DatabaseClientManager):
        logger.info(
            "[ SHARED-INFRA ] Skipping Mongo warmup for worker %s: %s has no DatabaseClientManager.",
            worker_name,
            client_module_path,
        )
        return

    logger.info(
        "[ SHARED-INFRA ] Warming Mongo connection for worker %s via %s.",
        worker_name,
        client_module_path,
    )
    try:
        _ = database_client_manager.database_client
    except Exception as exc:
        logger.warning(
            "Skipping Mongo warmup for worker %s: failed to warm connection via %s (%s).",
            worker_name,
            client_module_path,
            exc,
        )
        return
    logger.info(
        "[ SHARED-INFRA ] Mongo connection warmed for worker %s via %s.",
        worker_name,
        client_module_path,
    )
