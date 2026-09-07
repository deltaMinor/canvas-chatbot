import logging
from collections.abc import Callable, Mapping
from typing import Any

from shared_libs.decorators import raise_exception
from shared_libs.infrastructure.producer.service import Producer

from .helper import RemoteFileRepositoryHelper

logger = logging.getLogger(__name__)


class RemoteFileRepository(RemoteFileRepositoryHelper):
    """
    A class for handling operations related to a remote file repository.

    This class extends the RemoteFileRepositoryHelper class and provides methods to get a value, find multiple files, insert a single file, and delete multiple files in a remote file repository.

    Attributes:
        producer (Producer): The producer used to interact with the remote file repository.
    """

    def __init__(
        self,
        producer: Producer,
    ):
        """
        Constructs all the necessary attributes for the RemoteFileRepository object.

        Args:
            producer (Producer): The producer that this repository will use.
        """
        self.producer = producer

    @raise_exception(
        "An error occurred while retrieving or setting the value.",
        exception_logger=logger,
    )
    def _get_value(
        self,
        task_type: str,
        task_body: dict,
        func: Callable,
    ) -> Any:
        """
        Gets a value from the remote file repository.

        Args:
            task_type (str): The type of the task.
            task_body (dict): The body of the task.
            func (Callable): The function to use to get the value.

        Returns:
            Any: The value from the remote file repository.
        """
        task_value = func(
            task_type=task_type,
            task_body=task_body,
        )
        return task_value

    @raise_exception(
        "Failed to retrieve latest files from remote database.",
        exception_logger=logger,
    )
    def find_multiple_files(
        self,
        query_dict: dict,
        **kwargs,
    ):
        """
        Finds multiple files in the remote file repository.

        Args:
            query_dict (dict): The query to use to find the files.
            **kwargs: Additional keyword arguments.

        Returns:
            list: The files found in the remote file repository.
        """
        return self.producer.get_task_values(
            task_type="find_multiple_files",
            task_body={
                **kwargs,
                "query_dict": query_dict,
            },
        )

    @raise_exception(
        "Failed to insert file in remote database.",
        exception_logger=logger,
    )
    def insert_single_file(
        self,
        query_dict: dict,
        decoded_file: str,
        user_info: dict,
        **kwargs,
    ):
        """
        Inserts a single file into the remote file repository.

        Args:
            query_dict (dict): The query to use to insert the file.
            decoded_file (str): The decoded file to insert.
            user_info (dict): The user information.
            **kwargs: Additional keyword arguments.

        Returns:
            dict: The result of the insert operation.
        """
        return self.producer.get_task_value(
            task_type="insert_single_file",
            task_body={
                **kwargs,
                "query_dict": query_dict,
                "decoded_file": decoded_file,
                "user_info": user_info,
            },
        )

    @raise_exception(
        "Failed to rename file in remote database.",
        exception_logger=logger,
    )
    def rename_file(
        self,
        query_dict: dict,
        filename: str,
        user_info: dict,
        **kwargs,
    ):
        """
        Renames a single file in the remote file repository.

        Args:
            query_dict (dict): The query to use to locate the file to rename.
            filename (str): The new filename to set.
            user_info (dict): The user information.
            **kwargs: Additional keyword arguments.

        Returns:
            dict: The result of the rename operation.
        """
        return self.producer.get_task_value(
            task_type="rename_single_file",
            task_body={
                **kwargs,
                "query_dict": query_dict,
                "filename": filename,
                "user_info": user_info,
            },
        )

    @raise_exception(
        "Failed to delete files in remote database.",
        exception_logger=logger,
    )
    def delete_multiple_files(
        self,
        query_dict: Mapping[str, Any],
        **kwargs,
    ):
        """
        Deletes multiple files from the remote file repository.

        Args:
            query_dict (Mapping[str, Any]): The query to use to delete the files.
            **kwargs: Additional keyword arguments.

        Returns:
            dict: The result of the delete operation.
        """
        return self.producer.get_task_value(
            task_type="delete_multiple_files",
            task_body={
                **kwargs,
                "query_dict": query_dict,
            },
        )
