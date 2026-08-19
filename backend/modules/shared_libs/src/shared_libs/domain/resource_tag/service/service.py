import logging
from typing import TYPE_CHECKING, Any

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import Conflict
from shared_libs.lib.domain import (
    DomainAuditLogService,
    DomainAuthorizationService,
    DomainRepositoryService,
    DomainRequestDataPrefilterService,
    DomainResourceTagAuthorizationService,
)
from shared_libs.models.database_models import ResourceTagModel

if TYPE_CHECKING:
    from shared_libs.infrastructure.remote_repository.service import RemoteRepository
    from shared_libs.infrastructure.repository.service import Repository

default_code_message_mapping = {
    404: "Resource tag not found.",
    409: "Resource tag conflict.",
}

logger = logging.getLogger(__name__)


class ResourceTagService(
    DomainRepositoryService,
    DomainRequestDataPrefilterService,
    DomainAuditLogService,
    DomainAuthorizationService,
    DomainResourceTagAuthorizationService,
):
    """Service for managing resource tag entities.

    This service provides methods to interact with resource tag entities,
    supporting retrieval from either a data store or a repository. It extends
    the DomainRepositoryService to leverage common domain repository operations.

    Attributes:
        repository (Repository | RemoteRepository): The repository instance for data access.
    """

    def __init__(
        self,
        repository: "Repository | RemoteRepository",
    ):
        """Initializes the ResourceTagService.

        Args:
            repository (Repository | RemoteRepository): The repository instance for data access.
        """
        super().__init__(
            repository=repository,
            code_message_mapping=default_code_message_mapping,
        )
        self.repository = repository

    @raise_exception(
        "Failed to check duplicate tag name.",
        exception_logger=logger,
    )
    def check_duplicate_name(self, tag_name: str):
        """
        Checks if a resource tag with the given name already exists.

        This method retrieves all the resource tags and checks if any of them has the same name as the given tag_name.
        If a duplicate is found, it raises a BadRequest exception.

        Args:
            tag_name (str): The name of the resource tag to check.

        Raises:
            BadRequest: If a resource tag with the same name already exists.
        """
        db_resource_tags = self.get_many()
        resource_tag_models = [ResourceTagModel(**_) for _ in db_resource_tags]
        if tag_name in [_.tag_name for _ in resource_tag_models]:
            raise Conflict(default_code_message_mapping[409])

    @raise_exception(
        "Failed to get one document from domain.",
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
