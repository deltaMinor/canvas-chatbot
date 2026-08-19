import logging
from datetime import datetime

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.exceptions import DictionaryValueError
from shared_libs.models.base_models import DatabaseMetadataModel, MetadataModel
from shared_libs.types.enum import Metadata

logger = logging.getLogger(__name__)


class RepositoryHelper:
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

    @staticmethod
    @raise_exception(
        "Failed to get metadata field.",
        exception_logger=logger,
    )
    def get_new_metadata_field_model(
        timestamp: datetime,
        user_info: dict,
    ):
        metadata_dict = {
            "timestamp": timestamp,
            "user_id": user_info["user_id"],
            "username": user_info["username"],
        }
        return MetadataModel(**metadata_dict)

    @raise_exception(
        "Failed to update the modified list.",
        exception_logger=logger,
    )
    def _update_modified(
        self,
        timestamp: datetime,
        user_info: dict,
        metadata_model: "DatabaseMetadataModel",
    ):
        if not metadata_model.modified_on:
            raise DictionaryValueError(Metadata.modified_on.value)

        metadata_model.modified_on = self.get_new_metadata_field_model(
            timestamp=timestamp,
            user_info=user_info,
        )

    @raise_exception(
        "Failed to get new metadata dictionary.",
        exception_logger=logger,
    )
    def _get_database_metadata_model(
        self,
        timestamp: datetime,
        user_info: dict,
    ):
        metadata_field_model = self.get_new_metadata_field_model(
            timestamp=timestamp,
            user_info=user_info,
        )
        return DatabaseMetadataModel(
            created_on=metadata_field_model.model_dump(),
            modified_on=metadata_field_model.model_dump(),
        )
