import logging
from typing import TYPE_CHECKING, Any

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

default_code_message_mapping = {
    404: "User credits not found.",
    409: "User credits conflict.",
}

logger = logging.getLogger(__name__)


class UserCreditsService(
    DomainRepositoryService,
    DomainRequestDataPrefilterService,
    DomainAuditLogService,
    DomainAuthorizationService,
):
    def __init__(
        self,
        repository: "Repository | RemoteRepository",
        **kwargs,
    ):
        super().__init__(
            repository=repository,
            code_message_mapping=default_code_message_mapping,
        )
        self.repository = repository

    @raise_exception("Failed to retrieve user credits.", exception_logger=logger)
    def get_one(self, *args, **kwargs) -> Any:
        return super().get_one(*args, **kwargs)

    @raise_exception("Failed to retrieve multiple user credits.", exception_logger=logger)
    def get_many(self, *args, **kwargs) -> Any:
        return super().get_many(*args, **kwargs)

    @raise_exception("Failed to update user credits.", exception_logger=logger)
    def update_one(self, *args, **kwargs) -> Any:
        return super().update_one(*args, **kwargs)

    @raise_exception("Failed to delete user credits.", exception_logger=logger)
    def delete_one(self, *args, **kwargs) -> Any:
        return super().delete_one(*args, **kwargs)

    @raise_exception("Failed to delete multiple user credits.", exception_logger=logger)
    def delete_many(self, *args, **kwargs) -> Any:
        return super().delete_many(*args, **kwargs)
