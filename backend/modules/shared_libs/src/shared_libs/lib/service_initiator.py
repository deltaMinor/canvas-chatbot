"""
Service initialization and dependency injection for shared libraries.

This module provides the ServiceInitiator class which handles the creation and
configuration of various services including authentication, resource management,
and Redis connections. It serves as a central point for dependency injection
and service lifecycle management.
"""

import logging
from typing import TYPE_CHECKING

from celery import Celery

from shared_libs.decorators import raise_exception
from shared_libs.domain import ResourceTagService, UserPermissionDocService
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.infrastructure.redis_repository.service import RedisRepository
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.lib.redis_util import RedisConfig
from shared_libs.lib.resource_tag_manager import ResourceTagManager
from shared_libs.models.base_models import ProducerDataModel
from shared_libs.producers.authentication_producer import AuthenticationProducer
from shared_libs.producers.producer_data import (
    producer_data_authentication,
    producer_data_resource_tag,
    producer_data_user_permission_doc,
)

if TYPE_CHECKING:
    import redis

    from shared_libs.lib.generic_data_store import GenericDataStore

logger = logging.getLogger(__name__)


class ServiceInitiator:
    """
    Central service initializer for dependency injection and service management.

    This class handles the creation and configuration of various services
    including authentication producers, resource tag managers, and Redis
    connections. It provides a unified interface for service initialization
    across different parts of the application.

    Attributes:
        celery_app (Celery): Celery application instance for task execution
        user_permission_doc_store (GenericDataStore): Data store for user permission documents
        redis_client (redis.Redis): Redis client for caching and data operations
        REDIS_TOKEN_EXPIRY (int): Token expiry time in seconds from RedisConfig
    """

    def __init__(
        self,
        celery_app: Celery,
        redis_client: "redis.Redis",
        user_permission_doc_store: "GenericDataStore",
    ):
        """
        Initialize the ServiceInitiator.

        Args:
            celery_app (Celery): Celery application instance for task execution
            redis_client (redis.Redis): Redis client for caching and data operations
            user_permission_doc_store (GenericDataStore): Data store for user permission documents
            settings (LazySettings): Django settings instance (used for compatibility)
            service_name (str, optional): Name of the service for Redis connection
                isolation. Defaults to "default".
        """
        self.celery_app = celery_app
        self.redis_client = redis_client
        self.user_permission_doc_store = user_permission_doc_store
        self.REDIS_TOKEN_EXPIRY = RedisConfig.TOKEN_EXPIRY

    @property
    @raise_exception(
        "Failed to initialize auth producer.",
        exception_logger=logger,
    )
    def auth_producer(self):
        """
        Get the authentication producer instance.

        Creates and returns an AuthenticationProducer instance with all required
        dependencies including producers, services, and Redis repositories.

        Returns:
            AuthenticationProducer: Configured authentication producer instance

        Raises:
            Exception: If authentication producer initialization fails
        """
        return self.get_auth_producer_instance()

    @raise_exception(
        "Failed to initialize auth producer.",
        exception_logger=logger,
    )
    def get_auth_producer_instance(self):
        """
        Create and configure an AuthenticationProducer instance.

        Initializes all required services and dependencies for the authentication
        producer including:
        - Producer for authentication tasks
        - ResourceTagService for resource management
        - UserPermissionDocService for permission handling
        - ResourceTagManager for resource tag operations
        - Redis repositories for caching

        Returns:
            AuthenticationProducer: Fully configured authentication producer instance

        Raises:
            Exception: If any service initialization fails
        """
        producer = Producer(
            producer_data_model=ProducerDataModel(
                **producer_data_authentication,
            ),
            celery_app=self.celery_app,
        )

        resource_tag_service = ResourceTagService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_resource_tag,
                    ),
                    celery_app=self.celery_app,
                ),
            ),
        )

        redis_repository = RedisRepository(
            redis_client=self.redis_client,
        )
        resource_tag_manager = ResourceTagManager(
            resource_tag_service=resource_tag_service,
            redis_repository=redis_repository,
        )

        user_permission_doc_service = UserPermissionDocService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_user_permission_doc,
                    ),
                    celery_app=self.celery_app,
                ),
            ),
            data_store=self.user_permission_doc_store,
        )

        auth_producer = AuthenticationProducer(
            producer=producer,
            resource_tag_manager=resource_tag_manager,
            user_permission_doc_service=user_permission_doc_service,
            redis_repository=redis_repository,
        )
        return auth_producer
