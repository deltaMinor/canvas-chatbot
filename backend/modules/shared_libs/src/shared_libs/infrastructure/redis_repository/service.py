import json
import logging
import pickle
from typing import Any

import redis

from shared_libs import lib_config
from shared_libs.decorators import raise_exception, verify_params
from shared_libs.lib.redis_util import get_redis_client

from .helper import RedisRepositoryHelper

logger = logging.getLogger(__name__)


def safe_decode(value: Any) -> str:
    """
    Safely decode Redis values, handling both bytes and already-decoded strings.

    Args:
        value: Redis value that could be bytes or string

    Returns:
        str: Decoded string value
    """
    if isinstance(value, bytes):
        return value.decode()
    elif isinstance(value, str):
        return value
    else:
        return str(value)


class RedisRepository(RedisRepositoryHelper):
    """
    A class for handling operations related to a Redis repository.

    This class provides methods to get keys and retrieve matched objects in Redis. It uses a Redis client to interact with the Redis repository and has a default expiry time for keys.

    Attributes:
        redis_client (redis.Redis): The Redis client used to interact with the Redis repository.
        default_expiry (int): The default expiry time for keys in the Redis repository, in seconds.
    """

    def __init__(
        self,
        redis_client: redis.Redis = None,
        default_expiry: int = lib_config.REDIS_DEFAULT_EXPIRY,
        service_name: str = "default",
    ):
        """
        Constructs all the necessary attributes for the RedisRepository object.

        Args:
            redis_client (redis.Redis, optional): The Redis client that this repository will use to interact with the Redis repository.
                If None, uses the centralized Redis connection manager.
            default_expiry (int, optional): The default expiry time for keys in the Redis repository, in seconds. Defaults to lib_config.REDIS_DEFAULT_EXPIRY.
            service_name (str): Name of the service requesting Redis connection (used if redis_client is None).
        """
        if redis_client is not None:
            self.redis_client = redis_client
        else:
            self.redis_client = get_redis_client(service_name)
        self.default_expiry = default_expiry

    def _get_binary_redis_client(self) -> redis.Redis:
        """
        Get a Redis client configured for binary data (no decode_responses).
        This is needed for pickled data operations.

        Returns:
            redis.Redis: Redis client with decode_responses=False
        """
        # Create a new client with decode_responses=False for binary data
        from shared_libs.lib.redis_util import RedisConfig

        config = RedisConfig.get_connection_config()
        config["decode_responses"] = False  # Override for binary data

        return redis.Redis(**config)

    @raise_exception(
        "Failed to get redis keys.",
        exception_logger=logger,
    )
    def get_keys(
        self,
        pattern="*",
    ):
        """
        Gets keys from the Redis repository.

        Args:
            pattern (str, optional): The pattern to match keys. Defaults to "*".

        Returns:
            list: The keys from the Redis repository.
        """
        return self.redis_client.keys(
            pattern=pattern,
        )

    @raise_exception(
        "Failed to retrieve redis string by pattern match.",
        exception_logger=logger,
    )
    def get_pickled_object_by_pattern_match(
        self,
        pattern: str,
    ):
        matching_items = {}
        # Use binary Redis client for pickled data
        binary_client = self._get_binary_redis_client()

        for key in binary_client.scan_iter(match=pattern):
            pickled_data = binary_client.get(key)
            if pickled_data is None:
                continue

            try:
                matching_items[key] = pickle.loads(pickled_data)
            except (pickle.PickleError, Exception) as e:
                logger.warning(f"Failed to unpickle data for key {key}: {e}, skipping")
                continue

        return matching_items

    @raise_exception(
        "Failed to retrieve matched decoded dict in redis by pattern.",
        exception_logger=logger,
    )
    def get_redis_hash_by_pattern_match(
        self,
        pattern: str,
    ) -> dict:
        """
        Retrieves a dictionary of decoded dictionaries from Redis that match a given pattern.

        This method scans the Redis database for keys that match the specified pattern,
        retrieves the corresponding hash values, and decodes them into dictionaries.

        Args:
            pattern (str): The pattern to match keys in Redis.

        Returns:
            dict: A dictionary where each key is a Redis key that matches the pattern,
                and each value is a decoded dictionary of the hash values.

        Raises:
            Exception: If there is an error retrieving or decoding the data from Redis.
        """
        matching_items = {}
        for key in self.redis_client.scan_iter(match=pattern):
            res = self.redis_client.hgetall(key)
            matching_items[key] = {
                safe_decode(k): safe_decode(v) for k, v in res.items()
            }
        return matching_items

    @raise_exception(
        "Failed to retrieve matched decoded dict in redis.",
        exception_logger=logger,
    )
    def get_decoded_dict_in_redis(self, name: str) -> dict | None:
        """
        Retrieves a dictionary from Redis and decodes its keys and values.

        This method fetches all key-value pairs stored in a Redis hash with the given name.
        It then decodes the keys and values from bytes to strings.

        Args:
            name (str): The name of the Redis hash to retrieve.

        Returns:
            dict | None: A dictionary with decoded keys and values if the hash exists and is not empty,
                         otherwise None.

        Raises:
            Exception: If there is an error during the retrieval process.
        """
        res = self.redis_client.hgetall(
            name=name,
        )
        if not res or not len(res.keys()):
            return None
        return {safe_decode(k): safe_decode(v) for k, v in res.items()}

    @raise_exception(
        "Failed to retrieve matched json dict in redis.",
        exception_logger=logger,
    )
    @verify_params(key_list=["name"])
    def get_json_dict_in_redis(self, name: str) -> dict | None:
        """
        Retrieves a JSON dictionary from Redis based on the provided name.

        This method fetches all key-value pairs stored in a Redis hash with the given name.
        It then decodes the keys and values from bytes to strings and parses the JSON string
        stored under the key "json_string".

        Args:
            name (str): The name of the Redis hash to retrieve.

        Returns:
            dict | None: A dictionary with decoded keys and values, including the parsed JSON object
                         under the key "item" if the hash exists and is not empty, otherwise None.

        Raises:
            Exception: If there is an error during the retrieval process.
        """
        res = self.get_decoded_dict_in_redis(
            name=name,
        )
        if not res:
            return None
        res["item"] = json.loads(res.get("json_string", {}))
        return res

    @raise_exception(
        "Failed to retrieve matched items.",
        exception_logger=logger,
    )
    @verify_params(key_list=["name"])
    def get_item_in_redis(self, name: str) -> dict | None:
        """
        Retrieves items from Redis based on the provided name.

        This function uses the Redis client to fetch all items associated with the given name.
        It then decodes the JSON string and returns the items as a dictionary.

        Args:
            name (str): The name of the items to retrieve from Redis.

        Returns:
            dict | None: A dictionary of items retrieved from Redis. If no items are found, None is returned.

        Raises:
            Exception: If there is a failure in retrieving the items from Redis or if the decoding of the JSON string fails.
        """
        res = self.get_json_dict_in_redis(name=name)
        if not res:
            return None
        return res.get("item")

    @raise_exception(
        "Failed to set value for key in Redis.",
        exception_logger=logger,
    )
    @verify_params(key_list=["name", "mapping"])
    def set_item_in_redis(
        self,
        name: str,
        mapping: dict | list | None = None,
        expiry: int = 60,
        **kwargs,
    ) -> bool | None:
        """
        Sets an item in Redis with a specified expiry time.

        This function uses the Redis client to set a value for a given key (name) with a specified expiry time.
        The value to be set is a dictionary (mapping) which is converted to a JSON string before being stored in Redis.

        Args:
            name (str): The key for which the value is to be set in Redis.
            mapping (Dict[str, Any]): The value to be set in Redis. Must be a dictionary.
            expiry (int, optional): The expiry time for the key in seconds. Defaults to 60.
            **kwargs: Additional keyword arguments to be passed to the Redis client's hset method.

        Returns:
            bool | None: Returns True if the operation was successful, False if not. Returns None if an exception is raised.

        Raises:
            TypeError: If the value to be set in Redis is not a dictionary.
            Exception: If there is a failure in setting the value in Redis.
        """
        expiry = expiry or self.default_expiry
        if not isinstance(mapping, dict | list):
            raise TypeError("Redis value is not a dict or list.")

        # Set the value in Redis
        self.redis_client.hset(
            name=name,
            mapping={"json_string": json.dumps(mapping, default=str)},
        )
        self.redis_client.expire(
            name=name,
            time=expiry,
        )

        # Set additional fields in Redis. String values only.
        for item in kwargs.get("mapping_list", []):
            self.redis_client.hset(
                name=name,
                mapping=item,
            )

    @raise_exception(
        "Failed to delete items in Redis",
        exception_logger=logger,
    )
    @verify_params(key_list=["names"])
    def delete_item_in_redis(self, names: list[str]) -> None:
        """
        Deletes the specified items in Redis.

        Args:
            names (List[str]): A list of keys representing the items to be deleted from Redis.

        Raises:
            Exception: If there is a failure in deleting any of the items from Redis.
        """
        if not names or not len(names):
            return
        for name in names:
            self.redis_client.delete(name)

    @raise_exception(
        "Failed to set expiration for key in Redis",
        exception_logger=logger,
    )
    @verify_params(key_list=["redis_query_key"])
    def expire_item_in_redis(
        self,
        redis_query_key: str,
        expiry: int | None = None,
    ) -> bool:
        """
        Sets an expiration time for a specific key in Redis.

        This method sets an expiration time for the provided key in Redis. If an expiry time is
        provided, the key will expire after that many seconds. If no expiry time is provided,
        the default expiry time is used.

        Args:
            redis_query_key (str): The key for which to set the expiration time.
            expiry (int, optional): The number of seconds after which the key should expire.
                If not provided, the default expiry time is used.

        Returns:
            bool: True if the operation was successful, False otherwise.
        """
        expiry = expiry or self.default_expiry
        return self.redis_client.expire(redis_query_key, time=expiry)
