import logging
from datetime import datetime
from typing import Any

from pymongo.results import DeleteResult, UpdateResult

from shared_libs.decorators import raise_exception
from shared_libs.infrastructure.repository_collection import RepositoryCollection
from shared_libs.lib_config import TZINFO
from shared_libs.models.base_models import (
    CollectionDeleteManyStrictModel,
    CollectionDeleteOneStrictModel,
    CollectionQueryStrictModel,
    CollectionUpdateOneStrictModel,
)

from .helper import RepositoryHelper

logger = logging.getLogger(__name__)


class Repository(RepositoryHelper):
    """
    A class used to interact with the database.

    This class provides methods to find, update and delete records in the database.

    Attributes:
        collection (RepositoryCollection | Collection): The collection to interact with.

    """

    def __init__(
        self,
        collection: "RepositoryCollection",
    ):
        """
        Constructs a new Repository instance.

        Args:
            collection (RepositoryCollection): The collection to interact with.
        """
        super().__init__()
        self.collection = collection

    @raise_exception(
        "An error occurred while finding a single record in database.",
        exception_logger=logger,
    )
    def find_single(self, **kwargs) -> Any | None:
        """
        Finds a single record in the database.

        Args:
            **kwargs: The query parameters.

        Returns:
            Any | None: The found record or None if no record was found.
        """
        return self.collection.find_one(
            **CollectionQueryStrictModel(**kwargs).model_dump(),
        )

    @raise_exception(
        "An error occurred while finding multiple records in database.",
        exception_logger=logger,
    )
    def find_multiple(self, **kwargs) -> list[Any]:
        """
        Finds multiple records in the database.

        Args:
            **kwargs: The query parameters.

        Returns:
            List[Any]: The found records.
        """
        cursor = self.collection.find(
            **CollectionQueryStrictModel(**kwargs).model_dump(),
        )
        return list(cursor)

    @raise_exception(
        "An error occurred while updating a single record in database.",
        exception_logger=logger,
    )
    def update_single(
        self,
        payload: dict,
        user_info: dict,
        **kwargs,
    ) -> UpdateResult:
        """
        Updates a single record in the database.

        Args:
            payload (dict): The data to be updated in the record.
            user_info (dict): Information about the user performing the update.
            **kwargs: Additional keyword arguments for the update operation.

        Keyword Args:
            operator (str): The MongoDB update operator to use (default is "$set").

        Returns:
            UpdateResult: The result of the update operation.

        Raises:
            Exception: If an error occurs during the update operation.
        """
        operator = kwargs.get("operator", "$set") or "$set"
        allow_metadata_created_on_update = kwargs.pop(
            "allow_metadata_created_on_update",
            False,
        )
        reserved_keys = ["_id"]
        _payload = {k: v for k, v in payload.items() if k not in reserved_keys}
        metadata_payload = _payload.pop("metadata", None)
        if (
            allow_metadata_created_on_update
            and isinstance(metadata_payload, dict)
            and "created_on" in metadata_payload
        ):
            _payload["metadata.created_on"] = metadata_payload["created_on"]

        timestamp = datetime.now(TZINFO)
        metadata_field_model = self.get_new_metadata_field_model(
            timestamp=timestamp,
            user_info=user_info,
        )

        if operator != "$set":
            res1 = self.collection.update_one(
                **CollectionUpdateOneStrictModel(
                    **kwargs,
                    update={
                        operator: _payload,
                        "$set": {
                            "metadata.modified_on": metadata_field_model.model_dump(),
                        },
                    },
                ).model_dump(),
            )
            return res1

        update = {
            "$set": {
                **_payload,
                "metadata.modified_on": metadata_field_model.model_dump(),
            },
        }
        if "metadata.created_on" not in _payload:
            update["$setOnInsert"] = {
                "metadata.created_on": metadata_field_model.model_dump(),
            }

        res1 = self.collection.update_one(
            **CollectionUpdateOneStrictModel(
                **kwargs,
                update=update,
            ).model_dump(),
        )
        return res1

    @raise_exception(
        "An error occurred while deleting single record in database.",
        exception_logger=logger,
    )
    def delete_single(self, **kwargs) -> DeleteResult:
        """Deletes a single record from the database.

        This method deletes a single record from the database based on the
        provided filter criteria. It ensures that the request is authenticated
        and authorized to perform the deletion. It raises an exception if the
        deletion fails.

        Args:
            **kwargs: Arbitrary keyword arguments containing the filter criteria
            and other options for the delete operation.

        Returns:
            DeleteResult: The result of the delete operation.

        Raises:
            Exception: If the deletion of the record fails.
        """
        return self.collection.delete_one(
            **CollectionDeleteOneStrictModel(**kwargs).model_dump(),
        )

    @raise_exception(
        "An error occurred while deleting multiple records in database.",
        exception_logger=logger,
    )
    def delete_multiple(self, **kwargs) -> DeleteResult:
        """
        Deletes multiple records from the database.

        This method deletes multiple records from the database that match the criteria specified in the kwargs.
        The kwargs should include a 'filter' parameter which is a dictionary specifying the deletion criteria.

        Args:
            **kwargs: Additional parameters. Must include a 'filter' parameter which is a dictionary specifying the deletion criteria.

        Returns:
            DeleteResult: The result of the delete operation, which includes the number of records deleted.
        """
        return self.collection.delete_many(
            **CollectionDeleteManyStrictModel(**kwargs).model_dump(),
        )
