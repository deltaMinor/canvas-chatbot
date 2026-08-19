import logging
from abc import ABC, abstractmethod
from collections.abc import Callable
from typing import Any

from pymongo.errors import PyMongoError

from shared_libs.infrastructure.repository.service import Repository
from shared_libs.infrastructure.repository_collection import RepositoryCollection

logger = logging.getLogger(__name__)


class MongoArrayItemMigrationUtil(ABC):
    """Move embedded array items into their own collection documents safely.

    The migration is intentionally item-by-item: write the target document first,
    then remove only that migrated item from the source array. If the process is
    interrupted, rerunning it upserts the same target document and continues.
    """

    source_document_key = "project_id"
    source_array_key = "history"

    def __init__(
        self,
        database: Any,
        source_collection_name: str,
        user_info: dict | None = None,
        progress_callback: Callable[[dict], None] | None = None,
    ):
        self.database = database
        self.source_collection_name = source_collection_name
        self.user_info = user_info or {
            "user_id": "system",
            "username": "system",
        }
        self.progress_callback = progress_callback

    def emit_progress(self, progress: dict) -> None:
        if self.progress_callback is not None:
            self.progress_callback(progress)

    def source_collection_exists(self) -> bool:
        try:
            return self.source_collection_name in self.database.list_collection_names()
        except PyMongoError:
            logger.info(
                "Source collection unavailable; skipping migration.",
                extra={"source_collection": self.source_collection_name},
            )
            return False

    def get_source_repository(self) -> Repository | None:
        if not self.source_collection_exists():
            return None

        return Repository(
            collection=RepositoryCollection(
                database=self.database,
                name=self.source_collection_name,
            )
        )

    def migrate_source_document(self, source_document_id: str) -> dict:
        summary = self.get_empty_document_summary(source_document_id)
        source_repository = self.get_source_repository()
        if source_repository is None:
            return summary
        summary["source_collection_exists"] = True

        source_doc = source_repository.find_single(
            filter={self.source_document_key: source_document_id},
            projection={"_id": False},
        )
        if not source_doc:
            return summary
        summary["source_doc_found"] = True

        source_items = self.get_source_items(source_doc)
        summary["source_item_count"] = len(source_items)
        if not source_items:
            summary["deleted_empty_source_doc"] = self.delete_empty_source_doc(
                source_repository=source_repository,
                source_document_id=source_document_id,
            )
            return summary

        for source_item in source_items:
            if self.migrate_source_item(
                source_repository=source_repository,
                source_document_id=source_document_id,
                source_item=source_item,
            ):
                summary["migrated_count"] += 1
            else:
                summary["skipped_count"] += 1

        summary["deleted_empty_source_doc"] = self.delete_empty_source_doc(
            source_repository=source_repository,
            source_document_id=source_document_id,
        )
        return summary

    def migrate_all_source_documents(self) -> dict:
        summary = self.get_empty_collection_summary()
        source_repository = self.get_source_repository()
        if source_repository is None:
            self.emit_progress(
                {
                    "current": 0,
                    "total": 0,
                    "percentage": 100,
                    "message": "Source collection is unavailable; nothing to migrate.",
                }
            )
            return summary
        summary["source_collection_exists"] = True

        source_doc_refs = list(
            source_repository.find_multiple(
                filter={},
                projection={
                    "_id": False,
                    self.source_document_key: True,
                },
            )
            or []
        )
        total_source_docs = len(source_doc_refs)
        self.emit_progress(
            {
                "current": 0,
                "total": total_source_docs,
                "percentage": 0 if total_source_docs else 100,
                "message": (
                    "Starting migration."
                    if total_source_docs
                    else "No source documents remain to migrate."
                ),
            }
        )

        for index, source_doc_ref in enumerate(source_doc_refs, start=1):
            source_document_id = source_doc_ref.get(self.source_document_key)
            if not source_document_id:
                summary["skipped_count"] += 1
                self.emit_progress(
                    {
                        "current": index,
                        "total": total_source_docs,
                        "percentage": int(index * 100 / total_source_docs),
                        "message": "Skipped a source document without an identity.",
                    }
                )
                continue

            document_summary = self.migrate_source_document(
                source_document_id=source_document_id,
            )
            summary["source_docs_scanned"] += 1
            summary["source_docs_found"] += int(document_summary["source_doc_found"])
            summary["source_item_count"] += document_summary["source_item_count"]
            summary["migrated_count"] += document_summary["migrated_count"]
            summary["skipped_count"] += document_summary["skipped_count"]
            summary["deleted_empty_source_docs"] += int(
                document_summary["deleted_empty_source_doc"]
            )
            summary["source_documents"].append(document_summary)
            self.emit_progress(
                {
                    "current": index,
                    "total": total_source_docs,
                    "percentage": int(index * 100 / total_source_docs),
                    "message": (
                        f"Migrated {index} of {total_source_docs} source documents."
                    ),
                }
            )

        return summary

    def get_empty_document_summary(self, source_document_id: str) -> dict:
        return {
            self.source_document_key: source_document_id,
            "source_collection_exists": False,
            "source_doc_found": False,
            "source_item_count": 0,
            "migrated_count": 0,
            "skipped_count": 0,
            "deleted_empty_source_doc": False,
        }

    def get_empty_collection_summary(self) -> dict:
        return {
            "source_collection_exists": False,
            "source_docs_scanned": 0,
            "source_docs_found": 0,
            "source_item_count": 0,
            "migrated_count": 0,
            "skipped_count": 0,
            "deleted_empty_source_docs": 0,
            "source_documents": [],
        }

    def get_source_items(self, source_doc: dict) -> list[Any]:
        source_items = source_doc.get(self.source_array_key) or []
        return list(source_items)

    def delete_empty_source_doc(
        self,
        source_repository: Repository,
        source_document_id: str,
    ) -> bool:
        # Clean up source docs that are effectively empty even if legacy shape is
        # inconsistent (missing/null history field).
        delete_result = source_repository.delete_single(
            filter={
                "$and": [
                    {self.source_document_key: source_document_id},
                    {
                        "$or": [
                            {self.source_array_key: {"$size": 0}},
                            {self.source_array_key: []},
                            {self.source_array_key: None},
                            {self.source_array_key: {"$exists": False}},
                        ]
                    },
                ]
            }
        )
        return bool(delete_result.deleted_count)

    def migrate_source_item(
        self,
        source_repository: Repository,
        source_document_id: str,
        source_item: Any,
    ) -> bool:
        source_item_identity = self.get_source_item_identity(
            source_document_id=source_document_id,
            source_item=source_item,
        )
        if not source_item_identity:
            return False

        self.upsert_target_item(
            source_document_id=source_document_id,
            source_item=source_item,
            source_item_identity=source_item_identity,
        )
        source_repository.update_single(
            filter={self.source_document_key: source_document_id},
            payload={
                self.source_array_key: source_item_identity,
            },
            user_info=self.user_info,
            operator="$pull",
        )
        return True

    @abstractmethod
    def get_source_item_identity(
        self,
        source_document_id: str,
        source_item: Any,
    ) -> dict | None:
        """Return the minimal source-array identity used for the `$pull`."""

    @abstractmethod
    def upsert_target_item(
        self,
        source_document_id: str,
        source_item: Any,
        source_item_identity: dict,
    ) -> None:
        """Persist the target document before the source item is removed."""
