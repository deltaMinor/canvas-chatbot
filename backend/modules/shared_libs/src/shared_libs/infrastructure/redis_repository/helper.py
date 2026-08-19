import redis

from shared_libs.lib.redis_util import get_redis_client


class RedisRepositoryHelper:
    """
    A helper service class for handling operations related to a Redis repository.

    This class provides a base for classes that need to interact with a Redis repository.
    It holds a reference to a Redis client that can be used to perform operations on the
    Redis repository. Uses the centralized Redis connection manager for better resource management.

    Attributes:
        redis_client (redis.Redis): The Redis client used to interact with the Redis repository.

    Note:
        This class currently does not have any methods.
        Methods should be added as needed in the future.
    """

    def __init__(
        self,
        redis_client: redis.Redis = None,
        service_name: str = "default",
    ):
        """
        Constructs all the necessary attributes for the RedisRepositoryHelper object.

        Args:
            redis_client (redis.Redis, optional): The Redis client that this service will use to interact with the Redis repository.
                If None, uses the centralized Redis connection manager.
            service_name (str): Name of the service requesting Redis connection (used if redis_client is None).
        """
        if redis_client is not None:
            self.redis_client = redis_client
        else:
            self.redis_client = get_redis_client(service_name)
