"""
Redis utilities for TM Backend services.

This package provides centralized Redis configuration, connection management,
and utility functions for all services in the TM Backend ecosystem.

Key Components:
    - RedisConfig: Environment-based configuration management
    - RedisConnectionManager: Singleton connection manager with pooling
    - DistributedLock: Redis-based distributed locking mechanism
    - Convenience functions for easy access

"""

from .config import RedisConfig
from .connection_manager import (
    RedisConnectionManager,
    get_redis_client,
    get_redis_manager,
)
from .distributed_lock import DistributedLock

__all__ = [
    # Configuration
    "RedisConfig",
    # Connection Management
    "RedisConnectionManager",
    "get_redis_manager",
    "get_redis_client",
    # Utilities
    "DistributedLock",
]
