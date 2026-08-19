import logging

from pymongo import ReadPreference, database
from pymongo.collection import Collection as mongoCollection

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class RepositoryWatcher:
    """
    A class for watching changes in a MongoDB collection and logging them.

    This class provides methods to start and stop the watching process. It logs all changes to a separate collection.

    Attributes:
        connection_status (bool): The status of the connection to the MongoDB collection.
        collection (mongoCollection): The MongoDB collection to watch.
        collection_logs (mongoCollection): The MongoDB collection where logs are stored.

    Args:
        db_client (database.Database): The MongoDB client to use.
        collection_name (str): The name of the MongoDB collection to watch.
    """

    def __init__(
        self,
        db_client: database.Database,
        collection_name: str,
    ):
        """
        Constructs all the necessary attributes for the RepositoryWatcher object.

        Args:
            db_client (database.Database): The MongoDB client to use.
            collection_name (str): The name of the MongoDB collection to watch.
        """
        self.collection: mongoCollection = db_client.get_collection(
            collection_name,
            read_preference=ReadPreference.SECONDARY_PREFERRED,
        )
        self.connection_status = bool(self.collection.find_one({}))

        collection_log_name = f"{self.collection.name}_logs"
        self.collection_logs: mongoCollection = db_client.get_collection(
            collection_log_name,
            read_preference=ReadPreference.PRIMARY,
        )

    @raise_exception(
        "Failed to run process.",
        exception_logger=logger,
    )
    def run_process(self):
        """
        Runs the watching process.

        This method watches the MongoDB collection for changes and logs them to the logs collection.
        """
        logger.info(
            f"[ SHARED-INFRA ] [{self.collection.name} collection] Process started ..."
        )
        with self.collection.watch() as stream:
            for doc in stream:
                del doc["_id"]

                updatedFields = doc.get("updateDescription", {}).get("updatedFields")
                if isinstance(updatedFields, dict):
                    # keys = list(updatedFields.keys())
                    # if len(keys) == 1 and "metadata" in keys:
                    #     logger.info("Skipped logging. No new data.")
                    #     continue
                    doc["metadata"] = updatedFields.get("metadata")

                fullDocument = doc.get("fullDocument")
                if isinstance(fullDocument, dict):
                    doc["metadata"] = fullDocument.get("metadata")

                self.collection_logs.insert_one(doc)
                logger.info(
                    f"[ SHARED-INFRA ] [{self.collection.name} collection] Logs updated ..."
                )
        logger.warning(
            f"Process for collection [{self.collection.name}] exiting gracefully ..."
        )

    @raise_exception(
        "Failed to start process.",
        exception_logger=logger,
    )
    def start_process(self):
        """
        Starts the watching process.

        This method calls the run_process method to start watching the MongoDB collection for changes.
        """
        logger.info(
            f"[ SHARED-INFRA ] [{self.collection.name} collection] Start monitoring  ..."
        )
        self.run_process()

    @raise_exception(
        "Failed to stop process.",
        exception_logger=logger,
    )
    def stop_process(self):
        """
        Stops the watching process.

        This method is currently not implemented.
        """
        logger.info(
            f"[ SHARED-INFRA ] [{self.collection.name} collection] Kill monitoring  ..."
        )

    @raise_exception(
        "Failed to delete object.",
        exception_logger=logger,
    )
    def __del__(self):
        """
        Stops the watching process when the RepositoryWatcher object is deleted.

        This method is currently not implemented.
        """
        logger.info(
            f"[ SHARED-INFRA ] [{self.collection.name} collection] Stop monitoring  ..."
        )
