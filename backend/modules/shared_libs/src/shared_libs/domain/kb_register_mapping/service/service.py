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
    404: "KB register mapping not found.",
    409: "KB register mapping conflict.",
}

logger = logging.getLogger(__name__)


class KbRegisterMappingService(
    DomainRepositoryService,
    DomainRequestDataPrefilterService,
    DomainAuditLogService,
    DomainAuthorizationService,
):
    """Service for managing KB Register Mapping entities.

    This service provides methods to interact with KB Register Mapping entities,
    supporting retrieval from either a data store or a repository. It extends
    the DomainRepositoryService to leverage common domain repository operations.

    Attributes:
        SCHEMA (dict): The schema definition for KB Register Mapping entities.
        repository (Repository | RemoteRepository): The repository instance for data access.
        data_store (GenericDataStore, optional): An optional data store for KB Register Mapping retrieval.
    """

    SCHEMA = schema_dict["kb_register_mapping"]

    def __init__(
        self,
        repository: "Repository | RemoteRepository",
        data_store: "GenericDataStore" = None,
    ):
        """Initializes the KbRegisterMappingService.

        Args:
            repository (Repository | RemoteRepository): The repository instance for data access.
            data_store (GenericDataStore, optional): An optional data store for KB Register Mapping retrieval.
        """
        super().__init__(
            repository=repository,
            code_message_mapping=default_code_message_mapping,
        )
        self.repository = repository
        self.data_store = data_store

    @raise_exception(
        "Failed to retrieve register mapping dict",
        exception_logger=logger,
    )
    def get_register_mapping_dict(self) -> dict:
        """Retrieve the register mapping dictionary.

        This method retrieves the register mapping list from the repository,
        processes it, and returns a dictionary with riskScenarioId as keys
        and their corresponding knowledge bases as values.

        Returns:
            dict: The register mapping dictionary.

        Raises:
            Exception: If the register mapping list is not found.
        """
        # Retrieve the register mapping list from the repository
        db_register_mapping: dict = self.get_one(
            {"schema_": self.SCHEMA},
            raise_if_not_found=True,
        )
        register_mapping_list = db_register_mapping.get("register_mapping", [])

        # Initialize an empty dictionary to store the register mappings
        register_mapping_dict = {}

        # Process each object in the register mapping list
        for obj in register_mapping_list:
            riskScenarioId = obj["riskScenarioId"]
            register_mapping_dict[riskScenarioId] = {"ATT&CK": []}

            # Process each knowledge base in the object
            knowledgeBases = obj["knowledgeBases"]
            for kb in knowledgeBases:
                if kb["source"] == "ATT&CK":
                    register_mapping_dict[riskScenarioId]["ATT&CK"] = kb["id"]

        return register_mapping_dict

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
