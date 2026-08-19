import base64

from shared_libs.infrastructure.file_repository.service import FileRepository
from shared_libs.infrastructure.remote_file_repository.service import (
    RemoteFileRepository,
)
from shared_libs.lib.domain import (
    DomainAuditLogService,
    DomainFileRepositoryService,
    DomainProjectAuthorizationService,
)


class ProjectADFileService(
    DomainFileRepositoryService,
    DomainAuditLogService,
    DomainProjectAuthorizationService,
):
    """Service for unified architecture diagram source files."""

    def __init__(
        self,
        repository: FileRepository | RemoteFileRepository,
    ):
        super().__init__(repository=repository)
        self.repository = repository

    @staticmethod
    def get_project_ad_file_data(file: dict) -> str:
        data = file.get("data") or ""
        try:
            return base64.b64decode(data).decode("utf-8")
        except Exception:
            return data
