import logging

from shared_libs import lib_config

from .database_client_manager import DatabaseClientManager

DB_URL_LOCAL = "mongodb://localhost:27017"
DB_NAME = lib_config.DB_NAME

logger = logging.getLogger(__name__)


try:
    database_client_manager = DatabaseClientManager(
        DB_URL=DB_URL_LOCAL,
        DB_NAME=DB_NAME,
    )
except Exception:
    logger.error(
        f"Failed to initialise database_client_manager with DB_URL ({DB_URL_LOCAL}), DB_NAME ({DB_NAME})."
    )
    raise

# tm_collection_names = database_client_manager.collection_names
# tm_db_server_client = database_client_manager.server_client
# tm_repository_watcher_classes = database_client_manager.repository_watcher_classes
tm_db_client = database_client_manager.database_client
