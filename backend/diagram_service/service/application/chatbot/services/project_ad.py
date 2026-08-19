import logging
import uuid
from datetime import datetime, timezone

from celery import Celery
from django.conf import settings

from shared_libs.decorators import raise_exception
from shared_libs.domain import ProjectADService
from shared_libs.exceptions.api_exceptions import NotFound
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.models.base_models import (
    AuditLogModel,
    ChatBubblePropsBaseModel,
    ConversationBaseModel,
    SpecialInputBaseModel,
)
from shared_libs.models.database_models import ProjectADModel
from shared_libs.producers.producer_data import (
    producer_data_database_log_ad,
    producer_data_project_ad,
)
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.models.base_models import ProducerDataModel
from shared_libs.types.auditLog import AuditLogAction, AuditLogTargetKey
from shared_libs.types.enum import Collection

TZINFO = settings.TZINFO
logger = logging.getLogger(__name__)

user_info = {"user_id": "admin_user_id", "username": "admin_username"}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class ProjectChatbotApplicationService(ProjectADService):

    def __init__(self, celery_app: Celery, *args, **kwargs):
        super().__init__(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_project_ad,
                    ),
                    celery_app=celery_app,
                ),
            ),
        )
        self.db_log_ad_service = ProjectADService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_database_log_ad,
                    ),
                    celery_app=celery_app,
                ),
            ),
        )

    def _get_conversations(self, project_id: str) -> list[dict]:
        db_project_ad = self.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=user_info,
        )
        project_ad_model = ProjectADModel(**db_project_ad)
        return [conv.model_dump() for conv in (project_ad_model.conversations or [])]

    def _save_conversations(self, project_id: str, conversations: list[dict]) -> dict:
        return self.update_one(
            {"project_id": project_id},
            payload={"conversations": conversations},
            user_info=user_info,
        )

    @staticmethod
    def _find_conversation(conversations: list[dict], conversation_id: str) -> dict | None:
        return next(
            (conv for conv in conversations if conv.get("conversation_id") == conversation_id),
            None,
        )

    @staticmethod
    def _conversation_summary(conversation: dict) -> dict:
        history = conversation.get("chat_history") or []
        return {
            "conversation_id": conversation["conversation_id"],
            "conversation_name": conversation.get("conversation_name") or "",
            "created_at": conversation["created_at"],
            "updated_at": history[-1]["timestamp"] if history else conversation["created_at"],
            "message_count": len(history)
        }

    def _write_audit_log(self, action: str, project_id: str, conversation_id: str | None, value: dict) -> None:
        identifiers = {"project_id": project_id}
        if conversation_id is not None:
            identifiers["conversation_id"] = conversation_id

        audit_log_model = AuditLogModel(
            action=action,
            fieldChanges={"identifiers": identifiers, "value": value},
            targetKey=AuditLogTargetKey.project_ad_chat_history.value,
            user_id="admin_user_id",
            username="admin_username",
            timestamp=datetime.now(TZINFO),
        )
        self.db_log_ad_service.update_one(
            {"logId": audit_log_model.logId},
            payload={**audit_log_model.model_dump()},
            user_info=user_info,
            upsert=True,
            collection_name=Collection.project_ad_chat_history_log.value,
        )

    @raise_exception(
        "Failed to list conversations.",
        exception_logger=logger,
    )
    def list_conversations(self, data: dict) -> dict:
        """Returns every conversation currently open on the project."""
        project_id: str = data["project_id"]
        conversations = self._get_conversations(project_id)
        return {
            "conversations": [self._conversation_summary(conv) for conv in conversations],
        }

    @raise_exception(
        "Failed to create a new conversation.",
        exception_logger=logger,
    )
    def create_conversation(self, data: dict) -> dict:
        """Starts a brand new, empty conversation on the project and
        returns its summary."""
        project_id: str = data["project_id"]
        conversation_name: str = data.get("conversation_name") or ""
        conversations = self._get_conversations(project_id)

        now = _now_iso()
        new_conversation = ConversationBaseModel(
            conversation_id=f"conv_{uuid.uuid4()}",
            conversation_name=conversation_name,
            created_at=now,
        ).model_dump()
        conversations.append(new_conversation)
        self._save_conversations(project_id, conversations)
        self._write_audit_log(
            AuditLogAction.create.value,
            project_id,
            new_conversation["conversation_id"],
            {},
        )
        return {**new_conversation, "updated_at": now, "message_count": 0}

    @raise_exception(
        "Failed to delete conversation.",
        exception_logger=logger,
    )
    def delete_conversation(self, data: dict) -> dict:
        """Permanently removes one conversation."""
        project_id: str = data["project_id"]
        conversation_id: str = data["conversation_id"]
        conversations = self._get_conversations(project_id)

        remaining = [
            conv for conv in conversations if conv.get("conversation_id") != conversation_id
        ]
        if len(remaining) == len(conversations):
            raise NotFound(f"No conversation found for conversation_id {conversation_id}.")

        self._save_conversations(project_id, remaining)
        self._write_audit_log(AuditLogAction.delete.value, project_id, conversation_id, {})
        return {"conversation_id": conversation_id}

    @raise_exception(
        "Failed to rename conversation.",
        exception_logger=logger,
    )
    def rename_conversation(self, data: dict) -> dict:
        """Renames a single conversation. Does not touch any other
        conversation, and does not affect its chat history/state."""
        project_id: str = data["project_id"]
        conversation_id: str = data["conversation_id"]
        conversation_name: str = data.get("conversation_name") or ""

        conversations = self._get_conversations(project_id)
        conversation = self._find_conversation(conversations, conversation_id)
        if conversation is None:
            raise NotFound(f"No conversation found for conversation_id {conversation_id}.")

        conversation["conversation_name"] = conversation_name
        self._save_conversations(project_id, conversations)
        self._write_audit_log(
            AuditLogAction.update.value,
            project_id,
            conversation_id,
            {"conversation_name": conversation_name},
        )
        return {"conversation_id": conversation_id, "conversation_name": conversation_name}

    @raise_exception(
        "Failed to retrieve chat history.",
        exception_logger=logger,
    )
    def get_chat_data(self, data: dict) -> dict:
        """Returns the ``chat_history``, ``chat_state``, ``chat_pending``,
        and ``chat_special_inputs`` stored for a single conversation.
        """
        project_id: str = data["project_id"]
        conversation_id: str = data["conversation_id"]

        conversations = self._get_conversations(project_id)
        conversation = self._find_conversation(conversations, conversation_id)
        if conversation is None:
            return {
                "chat_history": [],
                "chat_state": 0,
                "chat_pending": False,
                "chat_special_inputs": [],
            }
        return {
            "chat_history": conversation.get("chat_history") or [],
            "chat_state": conversation.get("chat_state") or 0,
            "chat_pending": bool(conversation.get("chat_pending")),
            "chat_special_inputs": conversation.get("chat_special_inputs") or [],
        }

    @raise_exception(
        "Failed to update chat data.",
        exception_logger=logger,
    )
    def update_chat_data(self, data: dict) -> list[dict]:
        project_id: str = data["project_id"]
        conversation_id: str = data["conversation_id"]
        raw_messages: list[dict] = data["chat_history"]
        chat_state: int = data["chat_state"]

        chat_pending: bool = bool(data.get("chat_pending", False))
        raw_special_inputs: list[dict] = data.get("chat_special_inputs", [])

        validated_messages = [
            ChatBubblePropsBaseModel(**msg).model_dump() for msg in raw_messages
        ]
        validated_special_inputs = [
            SpecialInputBaseModel(**inp).model_dump() for inp in raw_special_inputs
        ]

        conversations = self._get_conversations(project_id)
        conversation = self._find_conversation(conversations, conversation_id)
        if conversation is None:
            conversation = {"conversation_id": conversation_id, "created_at": _now_iso()}
            conversations.append(conversation)

        conversation.update(
            {
                "chat_history": validated_messages,
                "chat_state": chat_state,
                "chat_pending": chat_pending,
                "chat_special_inputs": validated_special_inputs,
            }
        )

        res1 = self._save_conversations(project_id, conversations)
        self._write_audit_log(
            AuditLogAction.update.value,
            project_id,
            conversation_id,
            {
                "chat_history": validated_messages,
                "chat_state": chat_state,
                "chat_pending": chat_pending,
                "chat_special_inputs": validated_special_inputs,
            },
        )
        return [res1]
