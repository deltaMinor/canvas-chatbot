import logging

from shared_libs.infrastructure.file_repository.service import FileRepository
from shared_libs.infrastructure.file_repository_collection import (
    FileRepositoryCollection,
)
from shared_libs.infrastructure.producer.service import Producer

logger = logging.getLogger(__name__)


class RemoteFileRepositoryDirect(FileRepository):
    def __init__(
        self,
        producer: Producer,
    ):
        """
        Initializes a new instance of the RemoteRepository class.

        Args:
            producer (Producer): The producer used to send tasks to the task queue.
            redis_repository (RedisRepository, optional): The Redis repository used for caching. Defaults to None.
        """
        from shared_libs.infrastructure.database_client.local_client import tm_db_client

        self.collection = FileRepositoryCollection(
            database=tm_db_client,
            collection=producer.producer_data_model.task_collection_name,
        )
        super().__init__(collection=self.collection)
