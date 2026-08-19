import logging

from gridfs import GridOut

from shared_libs.decorators import raise_exception, verify_params
from shared_libs.exceptions.api_exceptions import InternalServerError
from shared_libs.infrastructure.file_repository_collection import (
    FileRepositoryCollection,
)
from shared_libs.types.enum import MetadataField

logger = logging.getLogger(__name__)


class RemoteFileRepositoryDirectHelper:
    """
    A helper class for handling operations related to a file repository.

    This class provides methods to format files, check if a file exists, get the latest file, delete the oldest file, get files, and check if a file exists with a limit on the number of versions.

    Attributes:
        collection (FileRepositoryCollection): The collection of files in the repository.
    """

    def __init__(self, collection: FileRepositoryCollection):
        """
        Constructs all the necessary attributes for the FileRepositoryHelper object.

        Args:
            collection (FileRepositoryCollection): The collection of files that this helper will use.
        """
        self.collection = collection

    @staticmethod
    @raise_exception(
        "Failed to get format file.",
        exception_logger=logger,
    )
    def get_formatted_file(
        file: GridOut,
        project_id: str | None = None,
    ) -> dict:
        """
        Formats a file.

        Args:
            file (GridOut): The file to format.
            project_id (Optional[str]): The project ID. Defaults to None.

        Returns:
            dict: The formatted file.
        """
        ALLOWED_KEYS = [
            "chunkSize",
            "filename",
            "length",
            "metadata",
            "uploadDate",
            #
            "file_id",
            "project_id",
            "timestamp",
        ]
        _file: dict = file.__dict__["_file"]
        formatted_file = {k: v for k, v in _file.items() if k in ALLOWED_KEYS}
        return formatted_file

    @staticmethod
    @raise_exception(
        "Failed to get format files.",
        exception_logger=logger,
    )
    def get_formatted_files(
        files: list[GridOut],
    ) -> list[dict]:
        """
        Formats multiple files.

        Args:
            files (List[GridOut]): The files to format.

        Returns:
            List[dict]: The formatted files.
        """
        return [
            RemoteFileRepositoryDirectHelper.get_formatted_file(
                file=file,
            )
            for file in files
        ]

    @raise_exception(
        "Failed to validate if file exists.",
        exception_logger=logger,
    )
    @verify_params(key_list=["query_dict"])
    def is_file_exist(
        self,
        query_dict: dict,
        **kwargs,
    ):
        """
        Checks if a file exists.

        Args:
            query_dict (dict): The query to use to check if the file exists.
            **kwargs: Additional keyword arguments.

        Returns:
            bool: True if the file exists, False otherwise.
        """
        return self.collection.exists(query_dict)

    @raise_exception(
        "Failed to get latest file.",
        exception_logger=logger,
    )
    @verify_params(key_list=["filename"])
    def get_latest_file(
        self,
        filename: str,
        **kwargs,
    ):
        """
        Gets the latest file.

        Args:
            filename (str): The name of the file.
            **kwargs: Additional keyword arguments.

        Returns:
            GridOut: The latest file.
        """
        return self.collection.get_last_version(
            filename=filename,
            **kwargs,
        )

    @raise_exception(
        "Failed to delete oldest files.",
        exception_logger=logger,
    )
    @verify_params(key_list=["query_dict"])
    def delete_oldest_file(
        self,
        query_dict: dict,
        **kwargs,
    ):
        """
        Deletes the oldest file.

        Args:
            query_dict (dict): The query to use to delete the oldest file.
            **kwargs: Additional keyword arguments.
        """
        project_id = query_dict.get("project_id")
        filename = query_dict.get("filename")
        if project_id is None or filename is None:
            raise InternalServerError("project_id or filename is undefined.")

        id_to_delete = self.collection.get_version(
            filename=filename,
            project_id=project_id,
            version=0,
        )._id
        self.collection.delete(
            file_id=id_to_delete,
        )

    @raise_exception(
        "Failed to get file.",
        exception_logger=logger,
    )
    @verify_params(key_list=["query_dict"])
    def get_files(
        self,
        query_dict: dict,
    ):
        """
        Gets files.

        Args:
            query_dict (dict): The query to use to get the files.

        Returns:
            list: The files.
        """
        res_files_cursor = self.collection.find(query_dict).sort("uploadDate", -1)
        return list(res_files_cursor)

    @raise_exception(
        "Failed to retrieve file count.",
        exception_logger=logger,
    )
    def get_file_count(
        self,
        query_dict: dict,
        filename: str,
        MAX_FILE_VERSIONS: int | None = 1,
        **kwargs,
    ):
        """
        Checks if a file exists with a limit on the number of versions.

        If the number of versions of the file equals the maximum number of versions, the oldest version of the file is deleted.

        Args:
            query_dict (Mapping[str, Any]): The query to use to check if the file exists.
            filename (str): The name of the file.
            MAX_FILE_VERSIONS (Optional[int]): The maximum number of versions of the file. Defaults to 1.
            **kwargs: Additional keyword arguments.

        Returns:
            int: The number of versions of the file after checking and possibly deleting the oldest version.
        """
        file_count = 0
        if self.is_file_exist(query_dict):
            res_files = self.get_files(query_dict)
            file_count = len(res_files)
            logger.info(
                f"[ SHARED-INFRA ] Existing file versions in storage: {file_count}"
            )

            if file_count == MAX_FILE_VERSIONS:
                self.delete_oldest_file(query_dict)
                file_count -= 1
                logger.warning(
                    f"The oldest version of file <{filename}> to be overwritten."
                )
        return file_count

    @raise_exception(
        "Failed to retrieve metadata field.",
        exception_logger=logger,
    )
    def get_metadata_field(self, timestamp, user_info):
        return {
            MetadataField.timestamp.value: timestamp,
            MetadataField.user_id.value: user_info["user_id"],
            MetadataField.username.value: user_info["username"],
        }
