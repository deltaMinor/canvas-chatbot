import logging
import uuid
from datetime import datetime

from gridfs import GridOut

from shared_libs.decorators import raise_exception
from shared_libs.infrastructure.file_repository_collection import (
    FileRepositoryCollection,
)
from shared_libs.lib.file_manager import FileManager
from shared_libs.lib_config import TZINFO

from .helper import FileRepositoryHelper

logger = logging.getLogger(__name__)


class FileRepository(FileRepositoryHelper):
    """
    A class for handling operations related to a file repository.

    This class extends the FileRepositoryHelper class and provides methods to find a single file, find multiple files, insert a single file, and delete multiple files.

    Attributes:
        collection (FileRepositoryCollection): The collection of files in the repository.
        MAX_FILE_VERSIONS (int): The maximum number of versions of a file.
    """

    MAX_FILE_VERSIONS = 1

    def __init__(
        self,
        collection: FileRepositoryCollection,
    ):
        """
        Constructs all the necessary attributes for the FileRepository object.

        Args:
            collection (FileRepositoryCollection): The collection of files that this repository will use.
        """
        super().__init__(collection=collection)
        self.collection = collection

    @raise_exception(
        "Failed to patch file fields.",
        exception_logger=logger,
    )
    def patch_file_fields(
        self,
        file: dict,
    ):
        patchKeys = []
        if not file.get("file_id"):
            file["file_id"] = f"file_{uuid.uuid4()}"
            patchKeys.append("file_id")

        # Insert the file into the collection
        if len(patchKeys):
            self.collection.put(**file)
        return

    @raise_exception(
        "Failed to retrieve latest file from database.",
        exception_logger=logger,
    )
    def find_single_file(
        self,
        query_dict: dict,
        raise_if_not_found=True,
        **kwargs,
    ) -> dict | None:
        """Finds a single file from the database.

        This method retrieves the latest file from the database based on the
        provided query dictionary. It ensures that the request is authenticated
        and authorized to access the file. It raises an exception if the
        retrieval fails.

        Args:
            query_dict (dict): The query dictionary to find the file.
            raise_if_not_found (bool, optional): Whether to raise an exception
            if the file is not found. Defaults to True.
            **kwargs: Additional keyword arguments for the find operation.

        Returns:
            dict | None: A dictionary containing the formatted file if found,
            otherwise None.

        Raises:
            Exception: If the retrieval of the file fails.
        """
        grid_out_cursor = self.collection.find(
            query_dict,
        )
        files = grid_out_cursor.to_list()
        if not len(files):
            return None

        file = files[0]
        return self.get_formatted_file(file=file)

    @raise_exception(
        "Failed to retrieve latest files from database.",
        exception_logger=logger,
    )
    def find_multiple_files(
        self,
        query_dict: dict,
        **kwargs,
    ) -> list[dict]:
        """Finds a single file from the database.

        This method retrieves the latest file from the database based on the
        provided query dictionary. It ensures that the request is authenticated
        and authorized to access the file. It raises an exception if the
        retrieval fails.

        Args:
            query_dict (dict): The query dictionary to find the file.
            raise_if_not_found (bool, optional): Whether to raise an exception
            if the file is not found. Defaults to True.
            **kwargs: Additional keyword arguments for the find operation.

        Returns:
            dict | None: A dictionary containing the formatted file if found,
            otherwise None.

        Raises:
            Exception: If the retrieval of the file fails.
        """
        grid_out_cursor = self.collection.find(
            query_dict,
        )
        files = grid_out_cursor.to_list()
        files = [self.get_formatted_file(file=file) for file in files]
        return files

    @raise_exception(
        "Failed to insert single file.",
        exception_logger=logger,
    )
    def insert_single_file(
        self,
        query_dict: dict,
        decoded_file: str,
        user_info: dict,
        **kwargs,
    ) -> dict:
        """
        Insert a single file into the database.

        Args:
            query_dict (dict): Dictionary containing query parameters, including the filename.
            decoded_file (str): The decoded file content as a string.
            user_info (dict): Dictionary containing user information.
            **kwargs: Additional keyword arguments, such as MAX_FILE_VERSIONS.

        Returns:
            dict: A dictionary containing the ID of the inserted file.

        Raises:
            Exception: If the file insertion fails.
        """
        # Extract filename from query_dict
        filename = query_dict["filename"]
        file_id = query_dict["file_id"]
        content_type = query_dict.get("content_type", "")
        file_type = query_dict.get("file_type", "")
        project_id = query_dict.get("project_id", "")
        source = query_dict.get("source", "")

        # Get the current file count and increment it
        file_count = self.get_file_count(
            query_dict=query_dict,
            filename=filename,
            MAX_FILE_VERSIONS=kwargs.get(
                "MAX_FILE_VERSIONS",
                self.MAX_FILE_VERSIONS,
            ),
        )
        file_count += 1
        logger.info(f"[ SHARED-INFRA ] Total file versions in storage: {file_count}")

        # Check if the file count has reached the maximum allowed versions
        if file_count >= self.MAX_FILE_VERSIONS:
            logger.warning(
                "File has reached the maximum versions allowable. On subsequent uploads, the oldest version will be overwritten."
            )

        # Prepare file data and metadata for insertion
        timestamp = datetime.now(TZINFO)
        file_bytes = FileManager.get_file_bytes(decoded_file=decoded_file)
        metadata_field = self.get_metadata_field(timestamp, user_info)
        collection_put_body = {
            "project_id": project_id,
            "file_id": file_id,
            "file_type": file_type,
            "content_type": content_type,
            "source": source,
            #
            "data": file_bytes,
            "filename": filename,
            "timestamp": timestamp,
            "metadata": {
                "created_on": metadata_field,
                "modified_on": metadata_field,
                "project_id": project_id,
            },
        }

        # Insert the file into the collection and return the file ID
        _id = self.collection.put(**collection_put_body)
        return {"_id": str(_id)}

    @raise_exception(
        "Failed to delete files in database.",
        exception_logger=logger,
    )
    def delete_multiple_files(
        self,
        query_dict: dict,
        **kwargs,
    ):
        """
        Deletes multiple files from the repository.

        This method finds all files that match the provided query and deletes them from the repository.

        Args:
            query_dict (dict): The query to use to find the files to delete.
            **kwargs: Additional keyword arguments.
        """
        for _ in self.collection.find(filter=query_dict):
            grid_out: GridOut = _
            file_id = grid_out._id
            self.collection.delete(
                file_id=file_id,
                **kwargs,
            )
