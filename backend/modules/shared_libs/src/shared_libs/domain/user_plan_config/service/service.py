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

default_code_message_mapping = {
    404: "User plan config not found.",
    409: "User plan config conflict.",
}

logger = logging.getLogger(__name__)


class UserPlanConfigService(
    DomainRepositoryService,
    DomainRequestDataPrefilterService,
    DomainAuditLogService,
    DomainAuthorizationService,
):
    SCHEMA: str = schema_dict.get("user_plan_config", "1.0.0")

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

    @raise_exception("Failed to retrieve user plan config.", exception_logger=logger)
    def get_one(self, *args, **kwargs) -> Any:
        return super().get_one(*args, **kwargs)

    @raise_exception("Failed to retrieve user plan configs.", exception_logger=logger)
    def get_many(self, *args, **kwargs) -> Any:
        return super().get_many(*args, **kwargs)

    @raise_exception("Failed to update user plan config.", exception_logger=logger)
    def update_one(self, *args, **kwargs) -> Any:
        return super().update_one(*args, **kwargs)

    @raise_exception("Failed to delete user plan config.", exception_logger=logger)
    def delete_one(self, *args, **kwargs) -> Any:
        return super().delete_one(*args, **kwargs)

    @raise_exception("Failed to delete user plan configs.", exception_logger=logger)
    def delete_many(self, *args, **kwargs) -> Any:
        return super().delete_many(*args, **kwargs)

    def get_plan_spec(self, plan_type: str) -> dict | None:
        """Fetch the config doc and extract the spec for the given plan_type."""
        config = self.get_one({"schema_": self.SCHEMA})
        if not config:
            return None
        plans: list[dict] = config.get("plans", [])
        for plan in plans:
            if plan.get("plan_type") == plan_type:
                return plan
        return None
