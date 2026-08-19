import logging
from typing import TYPE_CHECKING, Any

from shared_libs.constants.schema import schema_dict
from shared_libs.decorators import raise_exception
from shared_libs.lib.domain import (
    DomainAuditLogService,
    DomainAuthorizationService,
    DomainRepositoryService,
    DomainRequestDataPrefilterService,
)

if TYPE_CHECKING:
    from shared_libs.infrastructure.remote_repository.service import RemoteRepository
    from shared_libs.infrastructure.repository.service import Repository
    from shared_libs.lib.generic_data_store import GenericDataStore

default_code_message_mapping = {
    404: "KB question-to-model not found.",
    409: "KB question-to-model conflict.",
}

logger = logging.getLogger(__name__)


class KbQuestionToModelService(
    DomainRepositoryService,
    DomainRequestDataPrefilterService,
    DomainAuditLogService,
    DomainAuthorizationService,
):
    """Service for managing KB Question to Model entities.

    This service provides methods to interact with KB Question to Model entities,
    supporting retrieval from either a data store or a repository. It extends
    the DomainRepositoryService to leverage common domain repository operations.

    Attributes:
        SCHEMA (dict): The schema definition for KB Question to Model entities.
        repository (Repository | RemoteRepository): The repository instance for data access.
        data_store (GenericDataStore, optional): An optional data store for KB Question to Model retrieval.
    """

    SCHEMA = schema_dict["kb_question_to_model"]

    def __init__(
        self,
        repository: "Repository | RemoteRepository",
        data_store: "GenericDataStore" = None,
    ):
        """Initializes the KbQuestionToModelService.

        Args:
            repository (Repository | RemoteRepository): The repository instance for data access.
            data_store (GenericDataStore, optional): An optional data store for KB Question to Model retrieval.
        """
        super().__init__(
            repository=repository,
            code_message_mapping=default_code_message_mapping,
        )
        self.repository = repository
        self.data_store = data_store

    @raise_exception(
        "Failed to retrieve one document from domain.",
        exception_logger=logger,
    )
    def get_one(
        self,
        *args,
        **kwargs,
    ) -> Any:
        if self.data_store:
            return self.data_store.get_one(
                *args,
                **kwargs,
            )
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
        if self.data_store:
            return self.data_store.get_many(
                *args,
                **kwargs,
            )
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
