import logging
from typing import TYPE_CHECKING

from shared_libs.constants.database import RESERVED_DB_KEYS
from shared_libs.decorators import raise_exception
from shared_libs.models.base_models import (
    AuditLogModel,
    DomainRepositoryQueryModel,
    DomainRepositoryUpdateOneModel,
)

if TYPE_CHECKING:
    from shared_libs.lib.domain import DomainRepositoryService

logger = logging.getLogger(__name__)


class DatabaseLogTaskProcessor:
    def __init__(
        self,
        service: "DomainRepositoryService",
        targetKey: str,
    ):
        self.service = service
        self.targetKey = targetKey

    @raise_exception(
        "Failed to complete database log get_many task.",
        exception_logger=logger,
    )
    def get_many(
        self,
        body: dict,
        **kwargs,
    ):
        from .model_util.model_validation_util import ModelValidationUtil

        domain_query_model = DomainRepositoryQueryModel(**body)

        res = self.service.get_many(
            **domain_query_model.model_dump(),
        )

        if bool(domain_query_model.projection):
            return res

        # Patch model if required
        audit_log_models = [AuditLogModel(**_) for _ in res]

        def get_filter_func(
            model: "AuditLogModel",
        ):
            return {"logId": model.logId}

        validation_util = ModelValidationUtil(
            domain_service=self.service,
        )
        validation_util.process_models(
            models=audit_log_models,
            get_filter_func=get_filter_func,
        )

        return res

    @raise_exception(
        "Failed to complete database log update_one task.",
        exception_logger=logger,
    )
    def update_one(
        self,
        body: dict,
        **kwargs,
    ):
        domain_update_model = DomainRepositoryUpdateOneModel(**body)
        domain_update_model.payload = {
            k: v
            for k, v in domain_update_model.payload.items()
            if k.split(".")[0] in AuditLogModel.model_fields.keys()
            and k.split(".")[0] not in RESERVED_DB_KEYS
        }

        res = self.service.update_one(
            **domain_update_model.model_dump(),
        )
        return res
