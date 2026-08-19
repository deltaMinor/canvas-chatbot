import json
import logging
from collections.abc import Callable
from typing import TYPE_CHECKING, Any

from shared_libs.decorators import raise_exception
from shared_libs.lib.redis_util import RedisConfig
from shared_libs.models.base_models import (
    CollectionDeleteMultipleModel,
    CollectionDeleteSingleModel,
    CollectionQueryModel,
    CollectionUpdateSingleModel,
)

from .helper import RemoteRepositoryHelper

if TYPE_CHECKING:
    from shared_libs.infrastructure.producer.service import Producer
    from shared_libs.infrastructure.redis_repository.service import RedisRepository
    from shared_libs.lib.generic_data_store import GenericDataStore

logger = logging.getLogger(__name__)


class RemoteRepository(RemoteRepositoryHelper):
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
        data_store: "GenericDataStore" = None,
    ):
        super().__init__(producer=producer)
        self.producer = producer
        self.redis_repository = redis_repository
        self.data_store = data_store

    @raise_exception(
        "An error occurred while retrieving or setting the value in Redis.",
        exception_logger=logger,
    )
    def _get_redis_value(
        self,
        task_type: str,
        task_body: dict,
        func: Callable,
    ) -> Any:
        """
        Retrieves the value from Redis if it exists, otherwise sets it.

        This function checks if the value exists in Redis. If it does, it returns the value. If it doesn't, it uses the
        provided function to retrieve the value, stores the value in Redis, and then returns the value.

        Args:
            task_type (str): The type of the task to be sent to the producer.
            task_body (dict): The body of the task.
            func (Callable): The function to retrieve the value if it doesn't exist in Redis.

        Returns:
            Any: The value retrieved from Redis or the remote database, or None if no value was found.

        Raises:
            Exception: If there is a failure in retrieving or setting the value in Redis.
        """
        task_name, _ = self.producer.get_task_attributes_from_mappings(task_type)
        name = f"{task_name}_{json.dumps(task_body)}"

        # Check if the item exists in Redis
        item = self.redis_repository.get_item_in_redis(
            name=name,
        )
        if item:
            logger.info(
                "[ SHARED-INFRA ] Returning cached value in redis repository ..."
            )
            return item

        # Get the value from the remote database
        task_value = func(
            task_type=task_type,
            task_body=task_body,
        )
        if task_value:
            logger.info("[ SHARED-INFRA ] Setting cached value in redis repository ...")
            self.redis_repository.set_item_in_redis(
                name=name,
                mapping=task_value,
                expiry=RedisConfig.DOC_EXPIRY,
            )
        return task_value

    @raise_exception(
        "An error occurred while finding a single record in remote database.",
        exception_logger=logger,
    )
    def find_single(
        self,
        task_type="find_single",
        **kwargs,
    ) -> Any:
        """
        Finds a single record in the remote database.

        This method sends a task to a producer to find a single record in the remote database that matches the criteria
        specified in the kwargs. The kwargs should include a 'filter' parameter which is a dictionary specifying the
        search criteria. If a matching record is found in the Redis cache, it is returned. Otherwise, the method retrieves
        the record from the remote database, stores it in the Redis cache, and then returns it.

        Args:
            task_type (str, optional): The type of the task to be sent to the producer. Defaults to "find_single".
            **kwargs: Additional parameters. Must include a 'filter' parameter which is a dictionary specifying the search criteria.

        Returns:
            Any: The record retrieved from the remote database or Redis cache, or None if no record was found.

        Raises:
            Exception: If there is a failure in finding the record in the remote database.
        """
        task_body = {
            **CollectionQueryModel(**kwargs).model_dump(),
        }
        if self.redis_repository:
            return self._get_redis_value(
                task_type=task_type,
                task_body=task_body,
                func=self.producer.get_task_value,
            )

        return self.producer.get_task_value(
            task_type=task_type,
            task_body=task_body,
        )

    @raise_exception(
        "An error occurred while finding multiple records in remote database.",
        exception_logger=logger,
    )
    def find_multiple(
        self,
        task_type="find_multiple",
        **kwargs,
    ) -> Any:
        """Finds multiple records in the remote database.

        This method sends a task to the Celery task queue to perform the find operation and retrieves the results.
        The criteria for the find operation are specified in the kwargs.

        Args:
            task_type (str, optional): The type of the task to be sent to the Celery task queue. Defaults to "find_multiple".
            **kwargs (Any): The criteria for the find operation.

        Returns:
            Any: The list of records that were found, or None if no records were found.

        Raises:
            Exception: If an error occurs while finding the records. The exception message includes the reason for the error.
        """
        task_body = {
            **CollectionQueryModel(**kwargs).model_dump(),
        }
        if self.redis_repository:
            return self._get_redis_value(
                task_type=task_type,
                task_body=task_body,
                func=self.producer.get_task_values,
            )

        return self.producer.get_task_values(
            task_type=task_type,
            task_body=task_body,
        )

    @raise_exception(
        "An error occurred while updating a single record in remote database.",
        exception_logger=logger,
    )
    def update_single(
        self,
        payload,
        user_info,
        **kwargs,
    ) -> Any:
        """Updates a single record in the remote database.

        This method sends a task to the Celery task queue to perform the update operation and retrieves the result.
        The new data for the record is provided in the 'payload'. Additional parameters for the update operation can be specified in the kwargs.

        Args:
            payload (Dict[str, Any]): The new data for the record.
            user_info (Dict[str, Any]): The user information.
            **kwargs (Any): Additional parameters for the update operation.

        Returns:
            Any: The result of the update operation, which includes the updated record or an error message.

        Raises:
            Exception: If an error occurs while updating the record. The exception message includes the reason for the error.
        """
        task_body = {
            **CollectionUpdateSingleModel(
                **kwargs,
                payload=payload,
                user_info=user_info,
            ).model_dump(),
        }
        return self.producer.get_task_value(
            task_type="update_single",
            task_body=task_body,
        )

    @raise_exception(
        "An error occurred while deleting single record in remote database.",
        exception_logger=logger,
    )
    def delete_single(self, **kwargs) -> Any:
        """Deletes a single record from the remote database.

        This method deletes a single record from the remote database based on the
        provided filter criteria. It ensures that the request is authenticated
        and authorized to perform the deletion. It raises an exception if the
        deletion fails.

        Args:
            **kwargs: Arbitrary keyword arguments containing the filter criteria
            and other options for the delete operation.

        Returns:
            Any: The result of the delete operation.

        Raises:
            Exception: If the deletion of the record fails.
        """
        task_body = {
            **CollectionDeleteSingleModel(**kwargs).model_dump(),
        }
        return self.producer.get_task_value(
            task_type="delete_single",
            task_body=task_body,
        )

    @raise_exception(
        "An error occurred while deleting multiple records in remote database.",
        exception_logger=logger,
    )
    def delete_multiple(self, **kwargs) -> Any:
        """Deletes multiple records in the remote database.

        This method sends a task to the Celery task queue to perform the delete operation.
        The criteria for the delete operation are specified in the kwargs.

        Args:
            **kwargs (Any): The criteria for the delete operation.

        Returns:
            Any: The result of the delete operation.

        Raises:
            Exception: If an error occurs while deleting the records. The exception message includes the reason for the error.
        """
        task_body = {
            **CollectionDeleteMultipleModel(**kwargs).model_dump(),
        }
        return self.producer.get_task_value(
            task_type="delete_multiple",
            task_body=task_body,
        )
