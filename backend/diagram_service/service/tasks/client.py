import logging

from django.conf import settings

from shared_libs.infrastructure.database_client.database_client_manager import (
    DatabaseClientManager,
)

DB_NAME = settings.DB_NAME
DB_URL = settings.DB_URL
logger = logging.getLogger(__name__)

# =======================
# Database Client Manager
# =======================
database_client_manager = DatabaseClientManager(
    DB_URL=DB_URL,
    DB_NAME=DB_NAME,
)

# tm_collection_names = database_client_manager.collection_names
# tm_db_server_client = database_client_manager.server_client
# tm_repository_watcher_classes = database_client_manager.repository_watcher_classes
tm_db_client = database_client_manager.database_client
