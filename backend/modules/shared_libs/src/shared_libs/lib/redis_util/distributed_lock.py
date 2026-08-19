import logging
import time
import uuid

import redis

from shared_libs.lib.redis_util.connection_manager import get_redis_client

logger = logging.getLogger(__name__)


class DistributedLock:
    """
    Redis-based distributed lock implementation for preventing race conditions.

    This class provides a distributed locking mechanism using Redis to ensure
    that only one process can execute critical sections at a time across
    multiple services and instances.

    Key Features:
        - Atomic lock acquisition with expiration
        - Automatic lock release on expiration
        - Lock extension for long-running operations
        - Deadlock prevention with unique lock identifiers
        - Comprehensive error handling and logging

    Security Features:
        - Unique lock identifiers prevent accidental releases
        - Automatic expiration prevents deadlocks
        - Atomic operations ensure consistency
        - Graceful handling of Redis connection issues
    """

    def __init__(
        self,
        redis_client: redis.Redis = None,
        lock_key: str = "",
        timeout: int = 30,
        service_name: str = "default",
    ):
        """
        Initialize the distributed lock.

        Args:
            redis_client (redis.Redis, optional): Redis client instance. If None, uses the centralized Redis connection manager.
            lock_key (str): Redis key for the lock
            timeout (int): Lock timeout in seconds (default: 30)
            service_name (str): Name of the service requesting Redis connection (used if redis_client is None).
        """
        if redis_client is not None:
            self.redis_client = redis_client
        else:
            self.redis_client = get_redis_client(service_name)
        self.lock_key = lock_key
        self.timeout = timeout
        self.lock_identifier = str(uuid.uuid4())
        self.acquired = False

    def acquire(self, blocking: bool = True, blocking_timeout: float = 10.0) -> bool:
        """
        Acquire the distributed lock.

        Args:
            blocking (bool): Whether to block until lock is acquired
            blocking_timeout (float): Maximum time to wait for lock acquisition

        Returns:
            bool: True if lock was acquired, False otherwise
        """
        try:
            if blocking:
                return self._acquire_blocking(blocking_timeout)
            else:
                return self._acquire_non_blocking()

        except redis.RedisError as e:
            logger.error(f"Redis error during lock acquisition: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during lock acquisition: {e}")
            return False

    def _acquire_blocking(self, blocking_timeout: float) -> bool:
        """
        Acquire lock with blocking behavior.

        Args:
            blocking_timeout (float): Maximum time to wait

        Returns:
            bool: True if lock was acquired, False otherwise
        """
        start_time = time.time()

        while time.time() - start_time < blocking_timeout:
            if self._acquire_non_blocking():
                return True

            # Wait before retrying
            time.sleep(0.1)

        logger.warning(
            f"Failed to acquire lock {self.lock_key} within {blocking_timeout}s"
        )
        return False

    def _acquire_non_blocking(self) -> bool:
        """
        Attempt to acquire lock without blocking.

        Returns:
            bool: True if lock was acquired, False otherwise
        """
        # Use SET with NX and EX for atomic lock acquisition
        result = self.redis_client.set(
            self.lock_key,
            self.lock_identifier,
            nx=True,  # Only set if key doesn't exist
            ex=self.timeout,  # Set expiration
        )

        if result:
            self.acquired = True
            logger.info(f"[ SHARED-LIB ] Distributed lock acquired: {self.lock_key}")
            return True

        return False

    def release(self) -> bool:
        """
        Release the distributed lock.

        Returns:
            bool: True if lock was released, False otherwise
        """
        if not self.acquired:
            logger.warning(
                f"Attempted to release lock {self.lock_key} that was not acquired"
            )
            return False

        try:
            # Use Lua script for atomic lock release
            lua_script = """
            if redis.call("GET", KEYS[1]) == ARGV[1] then
                return redis.call("DEL", KEYS[1])
            else
                return 0
            end
            """

            result = self.redis_client.eval(
                lua_script, 1, self.lock_key, self.lock_identifier
            )

            if result:
                self.acquired = False
                logger.info(
                    f"[ SHARED-LIB ] Distributed lock released: {self.lock_key}"
                )
                return True
            else:
                logger.warning(
                    f"Failed to release lock {self.lock_key} - not owned by this process"
                )
                return False

        except redis.RedisError as e:
            logger.error(f"Redis error during lock release: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during lock release: {e}")
            return False

    def extend(self, additional_time: int = None) -> bool:
        """
        Extend the lock expiration time.

        Args:
            additional_time (int): Additional time in seconds (defaults to timeout)

        Returns:
            bool: True if lock was extended, False otherwise
        """
        if not self.acquired:
            logger.warning(
                f"Attempted to extend lock {self.lock_key} that was not acquired"
            )
            return False

        if additional_time is None:
            additional_time = self.timeout

        try:
            # Use Lua script for atomic lock extension
            lua_script = """
            if redis.call("GET", KEYS[1]) == ARGV[1] then
                return redis.call("EXPIRE", KEYS[1], ARGV[2])
            else
                return 0
            end
            """

            result = self.redis_client.eval(
                lua_script, 1, self.lock_key, self.lock_identifier, additional_time
            )

            if result:
                logger.info(
                    f"[ SHARED-LIB ] Distributed lock extended: {self.lock_key} (+{additional_time}s)"
                )
                return True
            else:
                logger.warning(
                    f"Failed to extend lock {self.lock_key} - not owned by this process"
                )
                return False

        except redis.RedisError as e:
            logger.error(f"Redis error during lock extension: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during lock extension: {e}")
            return False

    def is_acquired(self) -> bool:
        """
        Check if the lock is currently acquired by this instance.

        Returns:
            bool: True if lock is acquired, False otherwise
        """
        return self.acquired

    def __enter__(self):
        """Context manager entry."""
        if not self.acquire():
            raise RuntimeError(f"Failed to acquire distributed lock: {self.lock_key}")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.release()

    def __del__(self):
        """Destructor to ensure lock is released."""
        if self.acquired:
            logger.warning(
                f"Distributed lock {self.lock_key} was not properly released"
            )
            self.release()
