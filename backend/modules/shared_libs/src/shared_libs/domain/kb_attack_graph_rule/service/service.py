import logging
from typing import TYPE_CHECKING, Any

from shared_libs.constants.schema import schema_dict
from shared_libs.decorators import raise_exception
from shared_libs.lib.domain import DomainRepositoryService
from shared_libs.types.logger import AppLoggerName

if TYPE_CHECKING:
    from shared_libs.infrastructure.remote_repository.service import RemoteRepository
    from shared_libs.infrastructure.repository.service import Repository
    from shared_libs.lib.generic_data_store import GenericDataStore

default_code_message_mapping = {
    404: "Attack Graph Rule not found.",
    409: "Attack Graph Rule conflict.",
}

logger = logging.getLogger(AppLoggerName.domain_kb_attack_graph_rule.value)


class KbAttackGraphRuleService(DomainRepositoryService):
    # The desc need to change probably
    """Service for managing Attack Graph Rule entities.

    This service provides methods to interact with Attack Graph Rule entities,
    supporting retrieval from either a data store or a repository. It extends
    the DomainRepositoryService to leverage common domain repository operations.

    Attributes:
        SCHEMA (dict): The schema definition for Attack Graph Rule entities.
        repository (Repository | RemoteRepository): The repository instance for data access.
        data_store (GenericDataStore, optional): An optional data store for Attack Graph Rule retrieval.
    """

    SCHEMA = schema_dict["kb_attack_graph_rule"]

    def __init__(
        self,
        repository: "Repository | RemoteRepository",
        data_store: "GenericDataStore" = None,
    ):
        """Initializes the AttackGraphRule.

        Args:
            repository (Repository | RemoteRepository): The repository instance for data access.
            data_store (GenericDataStore, optional): An optional data store for Attack Graph Rule retrieval.
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
