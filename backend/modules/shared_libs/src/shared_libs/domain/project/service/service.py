import logging
from typing import TYPE_CHECKING, Any

from shared_libs.decorators import raise_exception
from shared_libs.lib.domain import (
    DomainAuditLogService,
    DomainAuthorizationService,
    DomainProjectAuthorizationService,
    DomainRepositoryService,
    DomainRequestDataPrefilterService,
)

if TYPE_CHECKING:
    from shared_libs.infrastructure.remote_repository.service import RemoteRepository
    from shared_libs.infrastructure.repository.service import Repository

default_code_message_mapping = {
    404: "Project not found.",
    409: "Project conflict.",
}

logger = logging.getLogger(__name__)


class ProjectService(
    DomainRepositoryService,
    DomainRequestDataPrefilterService,
    DomainAuditLogService,
    DomainAuthorizationService,
    DomainProjectAuthorizationService,
):
    """Service for managing project entities.

    This service provides methods to interact with project entities,
    supporting retrieval from either a data store or a repository. It extends
    the DomainRepositoryService to leverage common domain repository operations.

    Attributes:
        repository (Repository | RemoteRepository): The repository instance for data access.
    """

    def __init__(
        self,
        repository: "Repository | RemoteRepository",
    ):
        """Initializes the ProjectService.

        Args:
            repository (Repository | RemoteRepository): The repository instance for data access.
        """
        super().__init__(
            repository=repository,
            code_message_mapping=default_code_message_mapping,
        )
        self.repository = repository

    @raise_exception(
        "Failed to retrieve one document from domain.",
        exception_logger=logger,
    )
    def get_one(
        self,
        *args,
        **kwargs,
    ) -> Any:
        return super().get_one(
            *args,
            **kwargs,
        )

    @raise_exception(
        "Failed to get multiple document from domain.",
        exception_logger=logger,
    )
    def get_many(
        self,
        *args,
        **kwargs,
    ) -> Any:
        return super().get_many(
            *args,
            **kwargs,
        )

    @raise_exception(
        "Failed to update one document from domain.",
        exception_logger=logger,
    )
    def update_one(
        self,
        *args,
        **kwargs,
    ) -> Any:
        return super().update_one(
            *args,
            **kwargs,
        )

    @raise_exception(
        "Failed to delete one document from domain.",
        exception_logger=logger,
    )
    def delete_one(
        self,
        *args,
        **kwargs,
    ) -> Any:
        return super().delete_one(
            *args,
            **kwargs,
        )

    @raise_exception(
        "Failed to delete multiple document from domain.",
        exception_logger=logger,
    )
    def delete_many(
        self,
        *args,
        **kwargs,
    ) -> Any:
        return super().delete_many(
            *args,
            **kwargs,
        )
