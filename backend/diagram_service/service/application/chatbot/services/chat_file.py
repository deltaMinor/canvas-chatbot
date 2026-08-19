import logging
import uuid
from datetime import datetime

from django.conf import settings
from django.core.files.uploadedfile import UploadedFile
from django.utils.datastructures import MultiValueDict

from service.application.project_diagram.files.services import (
    ProjectADFileApplicationService,
)
from shared_libs.constants.chatbot import CHATBOT_FILE_TYPE
from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import BadRequest, NotFound
from shared_libs.lib.file_manager import FileManager
from shared_libs.models.base_models import AuditLogModel
from shared_libs.types.auditLog import AuditLogAction, AuditLogTargetKey

TZINFO = settings.TZINFO
logger = logging.getLogger(__name__)

user_info = {"user_id": "admin_user_id", "username": "admin_username"}

class ProjectChatFileApplicationService(ProjectADFileApplicationService):

    @raise_exception("Failed to upload chat attachment(s).", exception_logger=logger)
    def upload_files(self, data: dict, files: MultiValueDict) -> list[dict]:
        project_id: str = data["project_id"]
        uploaded: list[UploadedFile] = files.getlist("file")
        if not uploaded:
            raise BadRequest("No file(s) provided.")

        attachments: list[dict] = []
        for f in uploaded:
            decoded_file = FileManager.get_decoded_file(file=f)
            if not decoded_file:
                logger.warning("Chat attachment %s is empty.", f.name)
                continue

            file_id = f"file_{uuid.uuid4()}"
            content_type = f.content_type or "application/octet-stream"

            self.insert_one_file(
                query_dict={
                    "project_id": project_id,
                    "filename": f.name,
                    "file_id": file_id,
                    "file_type": CHATBOT_FILE_TYPE,
                    "content_type": content_type,
                },
                decoded_file=decoded_file,
                user_info=user_info,
            )
            self.write_audit_log(
                audit_log_service=self.db_log_ad_service,
                audit_log_model=AuditLogModel(
                    action=AuditLogAction.create.value,
                    fieldChanges={
                        "identifiers": {"project_id": project_id},
                        "value": {"file_id": file_id, "filename": f.name},
                    },
                    targetKey=AuditLogTargetKey.project_ad_file.value,
                    user_id="admin_user_id",
                    username="admin_username",
                    timestamp=datetime.now(TZINFO),
                ),
            )

            attachments.append(
                {"file_id": file_id, "file_name": f.name, "content_type": content_type}
            )

        return attachments

    @raise_exception("Failed to retrieve chat attachment.", exception_logger=logger)
    def get_file(self, data: dict) -> dict:
        project_id: str = data["project_id"]
        file_id: str = data["file_id"]

        file = self.get_one_file(
            {
                "project_id": project_id,
                "file_id": file_id,
                "file_type": CHATBOT_FILE_TYPE,
            },
        )
        if not file:
            raise NotFound(f"No chat attachment found for file_id {file_id}.")

        return {
            "file_id": file["file_id"],
            "file_name": file["filename"],
            "content_type": file.get("content_type") or "application/octet-stream",
            "data": file["data"],
        }
