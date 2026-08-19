import logging
from typing import Any

from bson import ObjectId
from pydantic import BaseModel
from pymongo.results import DeleteResult, UpdateResult

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import Conflict, NotFound
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.infrastructure.remote_repository_direct.service import (
    RemoteRepositoryDirect,
)
from shared_libs.infrastructure.repository.service import Repository
from shared_libs.models.base_models import (
    CollectionDeleteMultipleModel,
    CollectionQueryModel,
    CollectionUpdateSingleModel,
    ParamDictModel,
)

default_projection = None

logger = logging.getLogger(__name__)


class DomainRepositoryService:
    """Service for handling domain repository operations.

    This service provides methods to interact with domain repository data
    stored in various types of repositories.

    Attributes:
        repository (Repository | RemoteRepository | RemoteRepositoryDirect): The repository instance.
        name (str): The name of the repository or queue.
    """

    name = ""

    def __init__(
        self,
        repository: "Repository | RemoteRepository | RemoteRepositoryDirect",
        code_message_mapping=None,
    ):
        if code_message_mapping is None:
            code_message_mapping = {}
        self.repository = repository
        self.code_message_mapping: dict = code_message_mapping
        if isinstance(repository, Repository):
            self.name = f"{repository.collection.name} collection"
        if isinstance(repository, RemoteRepository):
            self.name = f"{repository.producer.producer_data_model.task_queue} queue"
        if isinstance(repository, RemoteRepositoryDirect):
            self.name = f"{repository.collection.name} collection"

    @raise_exception(
        "Failed to create param dict model.",
        exception_logger=logger,
    )
    def get_param_dict_models(
        self,
        filter_key: str,
        data_list: list[tuple[str, BaseModel]],
    ) -> list["ParamDictModel"]:
        """
        Generates a list of ParamDictModel instances from the provided data.

        This method takes a list of tuples, where each tuple contains an ID and a BaseModel instance. It generates a list of ParamDictModel instances, where each instance contains a filter dict and a payload dict. The filter dict contains the provided filter key and the ID, and the payload dict contains the dumped model data.

        Args:
            filter_key (str): The key to be used in the filter dict.
            data_list (List[Tuple[str, BaseModel]]): The list of tuples, where each tuple contains an ID and a BaseModel instance.

        Returns:
            List[ParamDictModel]: The list of ParamDictModel instances generated from the provided data.

        Raises:
            Exception: If an error occurred while generating the ParamDictModel instances.
        """
        param_dict_list = []
        for id, model in data_list:
            param_dict_list.append(
                {
                    "filter": {
                        filter_key: id,
                    },
                    "payload": model.model_dump(),
                }
            )
        return [ParamDictModel(**param_dict) for param_dict in param_dict_list]

    def _serialize_object_ids(
        self,
        value: Any,
    ) -> Any:
        """
        Recursively convert Mongo ObjectId values into strings for read responses.
        """
        if isinstance(value, ObjectId):
            return str(value)
        if isinstance(value, dict):
            return {
                key: self._serialize_object_ids(item) for key, item in value.items()
            }
        if isinstance(value, list):
            return [self._serialize_object_ids(item) for item in value]
        return value

    @raise_exception(
        "Failed to retrieve one document from database.",
        exception_logger=logger,
    )
    def get_one(
        self,
        filter=None,
        raise_if_not_found=False,
        raise_if_found=False,
        *args,
        **kwargs,
    ) -> Any:
        """
        Retrieve a single document from the repository based on the provided filter.
        This method attempts to find a single document matching the specified filter.
        It supports custom projections, error handling for not found or already existing resources,
        and allows for additional query customization via kwargs.
        Args:
            filter (Any, optional): The filter criteria to locate the document. If not provided,
                the first positional argument is used if available. Defaults to None.
            raise_if_not_found (bool, optional): If True, raises a NotFound exception when no document is found.
                Defaults to False.
            raise_if_found (bool, optional): If True, raises a Conflict exception when a document is found.
                Defaults to False.
            code_message_mapping (dict, optional): A mapping of HTTP status codes to custom error messages.
                Used for exception messages. Defaults to {}.
            *args: Additional positional arguments.
            **kwargs: Additional keyword arguments, including:
                - projection (dict, optional): Fields to include or exclude in the result.
                - override_projection (bool, optional): If True, replaces the default projection with the provided one.
        Returns:
            Any: The found document, or None if not found and `raise_if_not_found` is False.
        Raises:
            NotFound: If `raise_if_not_found` is True and no document is found.
            Conflict: If `raise_if_found` is True and a document is found.
        """
        logger.info(f"[ SHARED-LIB ] [{self.name}] Retrieving a single document ...")

        filter = filter or (args[0] if len(args) else None)

        new_projection = kwargs.get("projection", {})
        override_projection = kwargs.get("override_projection", False)
        if override_projection:
            projection = {
                **new_projection,
            }
        elif default_projection is None and not new_projection:
            projection = None
        else:
            projection = {
                **(default_projection or {}),
                **new_projection,
            }
        kwargs.update({"projection": projection})

        out = self.repository.find_single(
            **CollectionQueryModel(
                **kwargs,
                filter=filter,
            ).model_dump(),
        )

        if raise_if_not_found and out is None:
            message = self.code_message_mapping.get(
                404,
                "Resource not found.",
            )
            raise NotFound(message)
        if raise_if_found and out is not None:
            message = self.code_message_mapping.get(
                409,
                "Existing resource found.",
            )
            raise Conflict("Existing resource found.")

        return self._serialize_object_ids(out)

    @raise_exception(
        "Failed to retrieve multiple documents.",
        exception_logger=logger,
    )
    def get_many(
        self,
        filter=None,
        raise_if_not_found=False,
        raise_if_found=False,
        code_message_mapping=None,
        *args,
        **kwargs,
    ) -> list[Any] | None:
        """
        Retrieve multiple documents from the repository based on the provided filter and options.
        Args:
            filter (Any, optional): The filter criteria to apply when retrieving documents. Defaults to None.
            raise_if_not_found (bool, optional): If True, raises a NotFound exception when no documents are found. Defaults to False.
            raise_if_found (bool, optional): If True, raises a Conflict exception when documents are found. Defaults to False.
            code_message_mapping (dict, optional): A mapping of HTTP status codes to custom error messages. Defaults to {}.
            *args: Additional positional arguments. The first argument is used as the filter if `filter` is not provided.
            **kwargs: Additional keyword arguments. Can include:
                - projection (dict): Fields to include or exclude in the result.
                - override_projection (bool): If True, overrides the default projection with the provided one.
        Returns:
            List[Any] | None: A list of documents matching the filter, or None if no documents are found.
        Raises:
            NotFound: If `raise_if_not_found` is True and no documents are found.
            Conflict: If `raise_if_found` is True and documents are found.
        """
        if code_message_mapping is None:
            code_message_mapping = {}
        logger.info(f"[ SHARED-LIB ] [{self.name}] Retrieving multiple documents ...")

        filter = filter or (args[0] if len(args) else None)

        new_projection = kwargs.get("projection", {})
        override_projection = kwargs.get("override_projection", False)
        if override_projection:
            projection = {
                **new_projection,
            }
        elif default_projection is None and not new_projection:
            projection = None
        else:
            projection = {
                **(default_projection or {}),
                **new_projection,
            }
        kwargs.update({"projection": projection})

        out = self.repository.find_multiple(
            **CollectionQueryModel(
                **kwargs,
                filter=filter,
            ).model_dump(),
        )

        if raise_if_not_found and out is None:
            message = self.code_message_mapping.get(
                404,
                "Resource not found.",
            )
            raise NotFound(message)
        if raise_if_found and out is not None:
            message = self.code_message_mapping.get(
                409,
                "Existing resource found.",
            )
            raise Conflict("Existing resource found.")

        return self._serialize_object_ids(out)

    @raise_exception(
        "Failed to update one document.",
        exception_logger=logger,
    )
    def update_one(
        self,
        filter: dict[str, Any],
        payload: dict[str, Any],
        user_info: dict[str, Any],
        **kwargs: Any,
    ) -> UpdateResult:
        """
        Updates a single document in the collection based on the provided filter and payload.

        This method updates a single document in the underlying repository.

        Args:
            filter (Dict[str, Any]): A dictionary specifying the criteria to find the document to update.
            payload (Dict[str, Any]): A dictionary containing the fields and values to update in the document.
            user_info (Dict[str, Any]): Information about the user performing the update.
            **kwargs (Any): Additional keyword arguments for the update operation.

        Returns:
            UpdateResult: The result of the update operation, as returned by the underlying repository.

        Raises:
            Exception: If the update operation fails.
        """
        logger.info(f"[ SHARED-LIB ] [{self.name}] Updating a single document ...")

        return self.repository.update_single(
            **CollectionUpdateSingleModel(
                **kwargs,
                filter=filter,
                payload=payload,
                user_info=user_info,
            ).model_dump(),
        )

    @raise_exception(
        "Failed to delete one document.",
        exception_logger=logger,
    )
    def delete_one(
        self,
        filter,
        **kwargs,
    ) -> DeleteResult:
        """Deletes a single document from the collection.

        This method deletes a single document from the collection based on the
        provided filter. It ensures that the request is authenticated and
        authorized to perform the deletion. It raises an exception if the
        deletion fails.

        Args:
            filter (dict): The filter criteria to find the document to be deleted.
            **kwargs: Additional keyword arguments for the delete operation.

        Returns:
            DeleteResult: The result of the delete operation.

        Raises:
            Exception: If the deletion of the document fails.
        """
        logger.info(f"[ SHARED-LIB ] [{self.name}] Deleting one document ...")

        return self.repository.delete_single(
            **CollectionDeleteMultipleModel(
                **kwargs,
                filter=filter,
            ).model_dump(),
        )

    @raise_exception(
        "Failed to delete multiple documents.",
        exception_logger=logger,
    )
    def delete_many(
        self,
        filter,
        **kwargs,
    ) -> DeleteResult:
        """
        Deletes multiple documents from the database that match a specified filter.

        This method deletes multiple documents from the database that match the criteria specified by the 'filter' parameter.
        Additional parameters for the deletion operation can be specified in the kwargs.

        Args:
            filter (dict): A dictionary specifying the deletion criteria. Each key-value pair in the dictionary specifies a field and its value that the documents to be deleted should match.
            **kwargs: Additional parameters for the deletion operation. These can include options like 'collation' and 'session'.

        Returns:
            DeleteResult: The result of the delete operation, which includes the number of documents deleted. This object has two attributes: 'deleted_count', which gives the number of deleted documents, and 'acknowledged', which indicates whether the delete operation was acknowledged by the server.

        Raises:
            Exception: If an error occurs while trying to delete multiple documents.
        """
        logger.info(f"[ SHARED-LIB ] [{self.name}] Deleting multiple document ...")

        return self.repository.delete_multiple(
            **CollectionDeleteMultipleModel(
                **kwargs,
                filter=filter,
            ).model_dump(),
        )
