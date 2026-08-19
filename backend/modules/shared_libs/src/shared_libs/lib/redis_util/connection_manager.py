import logging
import threading
from typing import Any

import redis

from shared_libs.lib.redis_util.config import RedisConfig

logger = logging.getLogger(__name__)


class RedisConnectionManager:
    """
    Centralized Redis connection manager for all services.

    This class provides a singleton pattern for Redis connections to reduce
    connection overhead and improve performance across all services in the
    TM Backend ecosystem.

    Key Features:
        - Singleton pattern for connection reuse
        - Automatic connection pooling
        - Connection health monitoring
        - Graceful error handling
        - Thread-safe operations
        - Multiple Redis instance support
        - Configurable connection parameters
        - Service-specific connection isolation
    """

    _instances: dict[str, "RedisConnectionManager"] = {}
    _lock = threading.Lock()

    def __new__(cls, service_name: str = "default") -> "RedisConnectionManager":
        """Create or return existing instance for a specific service."""
        with cls._lock:
            if service_name not in cls._instances:
                instance = super().__new__(cls)
                instance._service_name = service_name
                instance._redis_client: redis.Redis | None = None
                instance._initialized = False
                cls._instances[service_name] = instance
            return cls._instances[service_name]

    def __init__(self, service_name: str = "default"):
        """Initialize the Redis connection manager for a specific service."""
        if self._initialized:
            return

        self._service_name = service_name
        self._redis_client: redis.Redis | None = None
        self._initialized = True

        # Default connection configuration using RedisConfig
        self._connection_config = RedisConfig.get_connection_config(
            db=RedisConfig.get_service_db(service_name)
        )

    def configure(self, **kwargs) -> "RedisConnectionManager":
        """
        Configure Redis connection parameters.

        Args:
            **kwargs: Redis connection parameters to override defaults

        Returns:
            RedisConnectionManager: Self for method chaining
        """
        self._connection_config.update(kwargs)
        # Reset connection if it exists to use new config
        if self._redis_client is not None:
            self.reset_connection()
        return self

    def get_client(self) -> redis.Redis:
        """
        Get Redis client instance with connection pooling.

        Returns:
            redis.Redis: Configured Redis client instance

        Raises:
            redis.RedisError: If connection fails
        """
        if self._redis_client is None:
            try:
                self._redis_client = redis.Redis(**self._connection_config)
                # Test connection
                self._redis_client.ping()
                logger.info(
                    f"[ SHARED-LIB ] Redis connection established successfully for service: {self._service_name}"
                )
            except redis.RedisError as e:
                logger.error(
                    f"Failed to establish Redis connection for service {self._service_name}: {e}"
                )
                raise

        return self._redis_client

    def get_client_without_decode(self) -> redis.Redis:
        """
        Get Redis client instance without automatic string decoding.

        Returns:
            redis.Redis: Redis client without decode_responses

        Raises:
            redis.RedisError: If connection fails
        """
        config = self._connection_config.copy()
        config["decode_responses"] = False

        try:
            client = redis.Redis(**config)
            client.ping()
            return client
        except redis.RedisError as e:
            logger.error(
                f"Failed to establish Redis connection (no decode) for service {self._service_name}: {e}"
            )
            raise

    def get_client_with_custom_config(self, **config_overrides) -> redis.Redis:
        """
        Get Redis client with custom configuration overrides.

        Args:
            **config_overrides: Configuration parameters to override

        Returns:
            redis.Redis: Redis client with custom configuration

        Raises:
            redis.RedisError: If connection fails
        """
        config = self._connection_config.copy()
        config.update(config_overrides)

        try:
            client = redis.Redis(**config)
            client.ping()
            return client
        except redis.RedisError as e:
            logger.error(
                f"Failed to establish Redis connection with custom config for service {self._service_name}: {e}"
            )
            raise

    def is_healthy(self) -> bool:
        """
        Check if Redis connection is healthy.

        Returns:
            bool: True if connection is healthy, False otherwise
        """
        try:
            if self._redis_client is None:
                return False
            self._redis_client.ping()
            return True
        except redis.RedisError:
            return False

    def reset_connection(self):
        """
        Reset Redis connection (useful for error recovery).
        """
        if self._redis_client is not None:
            try:
                self._redis_client.close()
            except Exception as e:
                logger.warning(
                    f"Error closing Redis connection for service {self._service_name}: {e}"
                )
            finally:
                self._redis_client = None
                logger.info(
                    f"[ SHARED-LIB ] Redis connection reset for service: {self._service_name}"
                )

    def get_connection_info(self) -> dict[str, Any]:
        """
        Get Redis connection information.

        Returns:
            dict: Connection configuration and status
        """
        return {
            "service_name": self._service_name,
            "host": self._connection_config["host"],
            "port": self._connection_config["port"],
            "ssl_enabled": self._connection_config["ssl"],
            "is_healthy": self.is_healthy(),
            "has_client": self._redis_client is not None,
            "max_connections": self._connection_config.get("max_connections", 20),
        }

    def get_stats(self) -> dict[str, Any]:
        """
        Get Redis connection statistics.

        Returns:
            dict: Connection statistics
        """
        stats = self.get_connection_info()

        if self._redis_client and hasattr(self._redis_client, "connection_pool"):
            pool = self._redis_client.connection_pool
            stats.update(
                {
                    "pool_size": pool.max_connections,
                    "created_connections": pool.created_connections,
                    "available_connections": pool.available_connections,
                }
            )

        return stats

    @classmethod
    def get_all_instances(cls) -> dict[str, "RedisConnectionManager"]:
        """
        Get all Redis connection manager instances.

        Returns:
            dict: All instances keyed by service name
        """
        return cls._instances.copy()

    @classmethod
    def reset_all_connections(cls):
        """
        Reset all Redis connections across all services.
        """
        with cls._lock:
            for instance in cls._instances.values():
                instance.reset_connection()
            logger.info("[ SHARED-LIB ] All Redis connections reset")


# Convenience functions for easy access
def get_redis_manager(service_name: str = "default") -> RedisConnectionManager:
    """
    Get Redis connection manager for a specific service.

    Args:
        service_name (str): Name of the service requesting Redis connection

    Returns:
        RedisConnectionManager: Redis connection manager instance
    """
    return RedisConnectionManager(service_name)


def get_redis_client(service_name: str = "default") -> redis.Redis:
    """
    Get Redis client for a specific service.

    Args:
        service_name (str): Name of the service requesting Redis connection

    Returns:
        redis.Redis: Redis client instance
    """
    return get_redis_manager(service_name).get_client()
