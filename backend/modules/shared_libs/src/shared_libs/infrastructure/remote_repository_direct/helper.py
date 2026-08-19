import logging
from datetime import datetime

from shared_libs.decorators import raise_exception, verify_params
from shared_libs.exceptions.exceptions import DictionaryValueError
from shared_libs.lib_config import TZINFO
from shared_libs.models.base_models import DatabaseMetadataModel, MetadataModel
from shared_libs.types.enum import Metadata

logger = logging.getLogger(__name__)


class RemoteRepositoryDirectHelper:
    """
    A helper class for handling operations related to a repository.

    This class provides methods to get and update metadata models for a repository.

    Attributes:
        pop_dict (dict): A dictionary used to pop the '_id' field from a document.
        timestamp (datetime): The current timestamp.
        user_info (dict): Information about the user.

    Raises:
        Exception: If getting or updating the metadata model fails.
    """

    pop_dict = {"_id": 0}

    @raise_exception(
        "Failed to get metadata field.",
        exception_logger=logger,
    )
    def _get_new_metadata_field_model(
        self,
    ):
        """
        Gets the metadata field model.

        Returns:
            MetadataModel: The metadata field model.
        """
        metadata_dict = {
            "timestamp": self.timestamp,
            "user_id": self.user_info["user_id"],
            "username": self.user_info["username"],
        }
        return MetadataModel(**metadata_dict)

    @raise_exception(
        "Failed to update the modified list.",
        exception_logger=logger,
    )
    @verify_params()
    def _update_modified(
        self,
        db_metadata_model: "DatabaseMetadataModel",
    ):
        """
        Updates the modified list of a database metadata model.

        Args:
            db_metadata_model (DatabaseMetadataModel): The database metadata model to update.

        Raises:
            DictionaryValueError: If the 'modified_on' field is not present in the database metadata model.
        """
        if not db_metadata_model.modified_on:
            raise DictionaryValueError(Metadata.modified_on.value)

        db_metadata_model.modified_on = self._get_new_metadata_field_model()

    @raise_exception(
        "Failed to get metadata dictionary.",
        exception_logger=logger,
    )
    def _get_database_metadata_model(
        self,
    ):
        """
        Gets the database metadata model.

        Returns:
            DatabaseMetadataModel: The database metadata model.
        """
        metadata_field_model = self._get_new_metadata_field_model()
        return DatabaseMetadataModel(
            created_on=metadata_field_model.model_dump(),
            modified_on=metadata_field_model.model_dump(),
        )

    @raise_exception(
        "An error occurred while updating the metadata.",
        exception_logger=logger,
    )
    @verify_params(key_list=["payload", "user_info"])
    def get_metadata_model(
        self,
        payload,
        user_info,
    ):
        """
        Gets the metadata model for a given payload and user information.

        Args:
            payload (dict): The payload to get the metadata model for.
            user_info (dict): The user information.

        Returns:
            DatabaseMetadataModel: The metadata model.
        """
        self.timestamp = datetime.now(TZINFO)
        self.user_info = user_info

        metadata = payload.get("metadata")
        if metadata is None:
            metadata_model = self._get_database_metadata_model()
            return metadata_model

        metadata_model = DatabaseMetadataModel(**metadata)
        self._update_modified(metadata_model)
        return metadata_model
