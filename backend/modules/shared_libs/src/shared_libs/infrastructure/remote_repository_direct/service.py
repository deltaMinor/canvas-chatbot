import logging
from typing import TYPE_CHECKING

from shared_libs.infrastructure.repository.service import (
    Repository,
    RepositoryCollection,
)

if TYPE_CHECKING:
    from shared_libs.infrastructure.producer.service import Producer
    from shared_libs.infrastructure.redis_repository.service import RedisRepository

logger = logging.getLogger(__name__)


class RemoteRepositoryDirect(Repository):
    """
    Handles remote database operations.

    This class provides methods for performing operations on a remote database, such as finding, updating, and deleting records.
    It uses a producer to send tasks to a task queue, and a Redis repository for caching.

    Attributes:
        producer (Producer): The producer used to send tasks to the task queue.
        redis_repository (RedisRepository): The Redis repository used for caching.
    """

    def __init__(
        self,
        producer: "Producer",
        redis_repository: "RedisRepository" = None,
    ):
        """
        Initializes a new instance of the RemoteRepository class.

        Args:
            producer (Producer): The producer used to send tasks to the task queue.
            redis_repository (RedisRepository, optional): The Redis repository used for caching. Defaults to None.
        """
        from shared_libs.infrastructure.database_client.local_client import tm_db_client

        self.collection = RepositoryCollection(
            database=tm_db_client,
            name=producer.producer_data_model.task_collection_name,
        )
        super().__init__(collection=self.collection)
