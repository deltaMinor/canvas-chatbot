from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from shared_libs.domain import DatabaseLogService
    from shared_libs.models.base_models import AuditLogModel
    from shared_libs.producers.authentication_producer import AuthenticationProducer


class DomainAuditLogService:
    audit_log_collection_name: str | None = None

    def write_audit_log(
        self,
        audit_log_service: "DatabaseLogService",
        audit_log_model: "AuditLogModel",
        collection_name: str | None = None,
    ):
        target_collection_name = collection_name or self.audit_log_collection_name
        if not target_collection_name:
            raise ValueError("Audit log collection name is not configured.")

        return audit_log_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info = {"user_id": "admin_user_id", "username": "admin_username"},
            upsert=True,
            collection_name=target_collection_name,
        )
