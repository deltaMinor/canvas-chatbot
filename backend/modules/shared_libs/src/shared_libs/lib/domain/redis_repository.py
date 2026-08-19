import logging
from typing import Any

from shared_libs.decorators import raise_exception, verify_params
from shared_libs.infrastructure.redis_repository.service import RedisRepository

logger = logging.getLogger(__name__)


class DomainRedisRepositoryService:
    """
    Service class for interacting with Redis via a RedisRepository.

    This class provides a service layer for interacting with Redis. It uses an instance of RedisRepository to perform
    operations on Redis. The class provides methods for setting and getting items in Redis.

    Attributes:
        redis_repository (RedisRepository): An instance of RedisRepository used for interacting with Redis.
    """

    def __init__(self, redis_repository: RedisRepository):
        """
        Initializes an instance of the DomainRedisRepositoryService.

        Args:
            redis_repository (RedisRepository): An instance of RedisRepository used for interacting with Redis.
        """
        self.redis_repository = redis_repository

    @raise_exception(
        "Failed to retrieve hash dictionary from Redis.",
        exception_logger=logger,
    )
    def get_decoded_hash_dict(
        self,
        name: str,
        **kwargs,
    ) -> Any | None:
        """
        Retrieves a hash dictionary from Redis based on the provided name.

        This method fetches all key-value pairs stored in a Redis hash with the given name.
        It decodes the keys and values from bytes to strings.

        Args:
            name (str): The name of the Redis hash to retrieve.
            **kwargs: Additional keyword arguments to be passed to the Redis repository's get_decoded_dict_in_redis method.

        Returns:
            Any | None: A dictionary with decoded keys and values if the hash exists and is not empty,
                        otherwise None.

        Raises:
            Exception: If there is an error during the retrieval process.
        """
        return self.redis_repository.get_decoded_dict_in_redis(
            name=name,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while attempting to retrieve an item from Redis.",
        exception_logger=logger,
    )
    @verify_params(key_list=["name"])
    def get_item(
        self,
        name: str,
        **kwargs,
    ) -> Any | None:
        """
        Retrieves an item from Redis based on the provided name.

        This function is called by the AuthenticationConsumer. It uses the Redis repository to fetch an item associated
        with the given name.

        Args:
            name (str): The name of the item to retrieve from Redis.
            **kwargs: Additional keyword arguments to be passed to the Redis repository's get_item_in_redis method.

        Returns:
            Any | None: The item retrieved from Redis. If no item is found, None is returned.

        Raises:
            Exception: If there is a failure in retrieving the item from Redis.
        """
        return self.redis_repository.get_item_in_redis(
            name=name,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while attempting to set item in Redis.",
        exception_logger=logger,
    )
    @verify_params(key_list=["name", "mapping"])
    def set_item(
        self,
        name: str,
        mapping: dict,
        expiry: int = 60,
        **kwargs,
    ) -> bool | None:
        """
        Sets an item in Redis with a specified expiry time.

        This function is called by the AuthenticationProducer. It uses the Redis repository to set a value for a given key
        (name) with a specified expiry time. The value to be set is a dictionary (mapping).

        Args:
            name (str): The key for which the value is to be set in Redis.
            mapping (Dict[str, Any]): The value to be set in Redis. Must be a dictionary.
            expiry (int, optional): The expiry time for the key in seconds. Defaults to 60.
            **kwargs: Additional keyword arguments to be passed to the Redis repository's set_item_in_redis method.

        Returns:
            bool | None: Returns True if the operation was successful, False if not. Returns None if an exception is raised.

        Raises:
            Exception: If there is a failure in setting the value in Redis.
        """
        expiry = expiry or self.redis_repository.default_expiry
        return self.redis_repository.set_item_in_redis(
            name=name,
            mapping=mapping,
            expiry=expiry,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while deleting items from Redis.",
        exception_logger=logger,
    )
    @verify_params(key_list=["patterns"])
    def delete_items(
        self,
        patterns: list[str],
        mapping: dict,
    ) -> None:
        """
        Deletes items from Redis that match the given patterns.

        Args:
            patterns (List[str]): A list of patterns. Each pattern is used to match keys in Redis.

        Returns:
            Dict[str, int]: A dictionary where each key is a pattern used for deletion and the corresponding value is the number of items that were deleted for that pattern.

        Raises:
            Exception: If there is an error in deleting items from Redis.
        """
        for pattern in patterns:
            keys: list[bytes] = self.redis_repository.get_keys(pattern=pattern)
            names = [key.decode("utf-8") for key in keys]
            names_to_delete = []
            for name in names:
                item = self.redis_repository.get_object_dict_in_redis(name=name)
                if not item:
                    logger.warning(f"redis item <{name}> not found.")
                    continue
                match_count = len(
                    [key for key, value in mapping.items() if item.get(key) == value]
                )
                if match_count == len(mapping.keys()):
                    names_to_delete.append(name)
        self.redis_repository.delete_item_in_redis(
            names=names_to_delete,
        )
