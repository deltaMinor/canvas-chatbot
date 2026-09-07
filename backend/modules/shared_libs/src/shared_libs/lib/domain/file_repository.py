import logging
from typing import Any

from shared_libs.decorators import raise_exception
from shared_libs.infrastructure.file_repository.service import FileRepository
from shared_libs.infrastructure.remote_file_repository.service import (
    RemoteFileRepository,
)

logger = logging.getLogger(__name__)


class DomainFileRepositoryService:
    def __init__(self, repository: FileRepository | RemoteFileRepository):
        self.repository = repository

    @raise_exception(
        "Failed to retrieve many files.",
        exception_logger=logger,
    )
    def get_many_files(
        self,
        query_dict: dict,
        **kwargs,
    ) -> list[dict]:
        return self.repository.find_multiple_files(
            query_dict=query_dict,
            **kwargs,
        )

    @raise_exception(
        "Failed to retrieve one file.",
        exception_logger=logger,
    )
    def get_one_file(
        self,
        query_dict: dict,
        **kwargs,
    ) -> dict | None:
        files = self.repository.find_multiple_files(
            query_dict=query_dict,
            **kwargs,
        )
        return files[0] if files else None

    @raise_exception(
        "Failed to insert one file.",
        exception_logger=logger,
    )
    def insert_one_file(
        self,
        query_dict: dict,
        decoded_file: str,
        user_info: dict,
        **kwargs: Any,
    ):
        return self.repository.insert_single_file(
            query_dict=query_dict,
            decoded_file=decoded_file,
            user_info=user_info,
            **kwargs,
        )

    @raise_exception(
        "Failed to rename one file.",
        exception_logger=logger,
    )
    def rename_one_file(
        self,
        query_dict: dict,
        filename: str,
        user_info: dict,
        **kwargs: Any,
    ):
        return self.repository.rename_file(
            query_dict=query_dict,
            filename=filename,
            user_info=user_info,
            **kwargs,
        )

    @raise_exception(
        "Failed to delete many files.",
        exception_logger=logger,
    )
    def delete_many_files(
        self,
        query_dict: dict,
        **kwargs,
    ):
        return self.repository.delete_multiple_files(
            query_dict=query_dict,
            **kwargs,
        )
