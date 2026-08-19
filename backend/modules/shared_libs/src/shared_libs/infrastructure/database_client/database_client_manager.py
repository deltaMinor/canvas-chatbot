import logging
from functools import cached_property
from urllib.parse import urlsplit, urlunsplit

from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ServerSelectionTimeoutError

from shared_libs.decorators import raise_exception
from shared_libs.infrastructure.repository_watcher import RepositoryWatcher

SERVER_SELECTION_TIMEOUT_MS = 10000
CONNECT_TIMEOUT_MS = 5000

logger = logging.getLogger(__name__)


def redact_database_url(url: str) -> str:
    if not url:
        return url

    try:
        parsed_url = urlsplit(url)
    except ValueError:
        return "<invalid database url>"

    if not parsed_url.username:
        return url

    hostname = parsed_url.hostname or ""
    port = f":{parsed_url.port}" if parsed_url.port else ""
    netloc = f"{parsed_url.username}:***@{hostname}{port}"
    return urlunsplit(
        (
            parsed_url.scheme,
            netloc,
            parsed_url.path,
            parsed_url.query,
            parsed_url.fragment,
        )
    )


class DatabaseClientManager:
    def __init__(
        self,
        DB_URL: str,
        DB_NAME: str,
    ):
        self.DB_URL = DB_URL
        self.DB_NAME = DB_NAME

    @cached_property
    def server_client(self) -> MongoClient:
        return self.get_server_client()

    @cached_property
    def database_client(self) -> Database:
        return self.get_database_client()

    @cached_property
    def collection_names(self) -> list[str]:
        return self.get_collection_names()

    @property
    def repository_watcher_classes(self) -> list[RepositoryWatcher]:
        return self.get_repository_watcher_classes()

    @raise_exception(
        "Failed to retrieve server client.",
        exception_logger=logger,
    )
    def get_server_client(self) -> MongoClient:
        logger.info("[ SHARED-INFRA ] Attempting database server connection ...")
        logger.info(
            "[ SHARED-INFRA ] Database url : %s", redact_database_url(self.DB_URL)
        )

        mongoClient = MongoClient(
            self.DB_URL,
            fsync=True,
            connectTimeoutMS=CONNECT_TIMEOUT_MS,
            serverSelectionTimeoutMS=SERVER_SELECTION_TIMEOUT_MS,
        )
        if not mongoClient:
            raise Exception("Failed to initialize mongoClient.")

        try:
            mongoClient.admin.command("ping")
        except ServerSelectionTimeoutError:
            logger.error(
                "Database server selection timed out. For DocumentDB, verify the "
                "calling workload can reach the cluster endpoint on TCP 27017 "
                "from its VPC subnets/security group, and that the TLS CA file in "
                "the MongoDB URL exists in the container."
            )
            raise

        logger.info("[ SHARED-INFRA ] Database server connection is alive.")

        # Get a list of all database names from the MongoDB server.
        # db_list = mongoClient.list_database_names()
        # logger.info(f"Databases : {db_list}")

        return mongoClient

    @raise_exception(
        "Failed to retrieve database client.",
        exception_logger=logger,
    )
    def get_database_client(self) -> Database:
        logger.info("[ SHARED-INFRA ] Attempting database connection ...")
        logger.info(f"[ SHARED-INFRA ] Database name : {self.DB_NAME}")

        # Get a client for the specified database
        database_client = self.server_client[self.DB_NAME]
        logger.info("[ SHARED-INFRA ] Database connection is alive.")

        return database_client

    @raise_exception(
        "Failed to retrieve collection names.",
        exception_logger=logger,
    )
    def get_collection_names(self):
        # Get a list of all collection names in the database
        all_collection_names = self.database_client.list_collection_names()
        collection_names = [n for n in all_collection_names if "_log" not in n]
        logger.info(f"[ SHARED-INFRA ] Collections: {collection_names}")
        return collection_names

    @raise_exception(
        "Failed to retrieve repository watcher classes.",
        exception_logger=logger,
    )
    def get_repository_watcher_classes(self) -> list[RepositoryWatcher]:
        repository_watcher_classes = []
        for collection_name in self.collection_names:
            repository_watcher_classes.append(
                RepositoryWatcher(
                    db_client=self.database_client,
                    collection_name=collection_name,
                )
            )
        return repository_watcher_classes
