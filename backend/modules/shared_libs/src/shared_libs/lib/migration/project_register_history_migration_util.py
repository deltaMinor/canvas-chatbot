import logging
from collections.abc import Callable
from datetime import datetime
from typing import Any

from django.conf import settings

from shared_libs.domain import ProjectAssessmentService
from shared_libs.models.base_models import ProjectRegisterHistorySnapshotBaseModel
from shared_libs.models.database_models import (
    ProjectAssessmentModel,
    ProjectRegisterHistoryModel,
)

from .mongo_array_item_migration_util import MongoArrayItemMigrationUtil

TZINFO = settings.TZINFO
LEGACY_PROJECT_REGISTER_HISTORY_COLLECTION = "project_register_history"

logger = logging.getLogger(__name__)


class ProjectRegisterHistoryMigrationUtil(MongoArrayItemMigrationUtil):
    def __init__(
        self,
        database: Any,
        assessment_history_service: ProjectAssessmentService,
        user_info: dict | None = None,
        progress_callback: Callable[[dict], None] | None = None,
    ):
        super().__init__(
            database=database,
            source_collection_name=LEGACY_PROJECT_REGISTER_HISTORY_COLLECTION,
            user_info=user_info,
            progress_callback=progress_callback,
        )
        self.project_assessment_service = assessment_history_service

    def migrate_project(self, project_id: str) -> dict:
        summary = self.migrate_source_document(source_document_id=project_id)
        return self._map_document_summary(summary)

    def migrate_all_projects(self) -> dict:
        summary = self.migrate_all_source_documents()
        return self._map_collection_summary(summary)

    def get_source_items(
        self, source_doc: dict
    ) -> list[ProjectRegisterHistorySnapshotBaseModel]:
        legacy_model = ProjectRegisterHistoryModel(**source_doc)
        return list(legacy_model.history or [])

    def get_source_item_identity(
        self,
        source_document_id: str,
        source_item: ProjectRegisterHistorySnapshotBaseModel,
    ) -> dict | None:
        assessment_id = source_item.assessment_id or ""
        if not assessment_id:
            logger.warning(
                "Skipping legacy project register history item without assessment id.",
                extra={"project_id": source_document_id},
            )
            return None

        return {
            "assessment_id": assessment_id,
        }

    def upsert_target_item(
        self,
        source_document_id: str,
        source_item: ProjectRegisterHistorySnapshotBaseModel,
        source_item_identity: dict,
    ) -> None:
        migrated_model = ProjectAssessmentModel(
            **{
                **source_item.model_dump(),
                "project_id": source_document_id,
                "migration_source": LEGACY_PROJECT_REGISTER_HISTORY_COLLECTION,
                "migrated_at": datetime.now(TZINFO).isoformat(),
            }
        )

        self.project_assessment_service.update_one(
            {
                "project_id": source_document_id,
                "assessment_id": source_item_identity["assessment_id"],
            },
            payload=migrated_model.model_dump(),
            user_info=self.user_info,
            upsert=True,
        )

    @staticmethod
    def _map_document_summary(summary: dict) -> dict:
        return {
            "project_id": summary["project_id"],
            "legacy_collection_exists": summary["source_collection_exists"],
            "legacy_doc_found": summary["source_doc_found"],
            "legacy_history_count": summary["source_item_count"],
            "migrated_count": summary["migrated_count"],
            "skipped_count": summary["skipped_count"],
            "deleted_empty_legacy_doc": summary["deleted_empty_source_doc"],
        }

    def _map_collection_summary(self, summary: dict) -> dict:
        return {
            "legacy_collection_exists": summary["source_collection_exists"],
            "projects_scanned": summary["source_docs_scanned"],
            "legacy_docs_found": summary["source_docs_found"],
            "legacy_history_count": summary["source_item_count"],
            "migrated_count": summary["migrated_count"],
            "skipped_count": summary["skipped_count"],
            "deleted_empty_legacy_docs": summary["deleted_empty_source_docs"],
            "projects": [
                self._map_document_summary(document_summary)
                for document_summary in summary["source_documents"]
            ],
        }
