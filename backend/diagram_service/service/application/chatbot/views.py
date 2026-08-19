import logging

from main import celery_app
from rest_framework import status
from rest_framework.decorators import throttle_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from shared_libs.decorators import (
    raise_exception,
    verify_data_params,
    verify_files_getlist_params,
    verify_get_params,
)
from shared_libs.lib.nonblocking_api_view import NonBlockingAPIView
from shared_libs.templates.message_template import success

logger = logging.getLogger(__name__)


@throttle_classes([UserRateThrottle])
class ProjectChatHistoryAPIView(NonBlockingAPIView):
    """API View for managing the message history of a single chatbot
    conversation on a project diagram.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectChatbotApplicationService

        self.chatbot_service = ProjectChatbotApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving chat history.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id", "conversation_id"])
    def get(self, request: Request) -> Response:
        """
        Returns:
            Response: { chat_history: [ChatBubbleProps, ...], chat_state: int, chat_pending: bool, chat_special_inputs: [SpecialInput, ...] }
        """
        chat_data = self.chatbot_service.get_chat_data(data=request.GET)
        return Response(
            success(
                "Chat data retrieved successfully.",
                chat_data,
            ),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while updating chat data.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id", "conversation_id", "chat_history", "chat_state"])
    def patch(self, request: Request) -> Response:
        self.chatbot_service.update_chat_data(data=request.data)
        return Response(
            success("Chat history updated successfully.", {}),
            status=status.HTTP_200_OK,
        )
@throttle_classes([UserRateThrottle])
class ProjectConversationsAPIView(NonBlockingAPIView):
    """API View for listing and creating a project's chatbot conversations."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectChatbotApplicationService

        self.chatbot_service = ProjectChatbotApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while listing conversations.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id"])
    def get(self, request: Request) -> Response:
        """
        Returns:
            Response: { conversations: [{conversation_id, conversation_name, created_at, updated_at, message_count}, ...] }
        """
        result = self.chatbot_service.list_conversations(data=request.GET)
        return Response(
            success("Conversations retrieved successfully.", result),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while creating a new conversation.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def post(self, request: Request) -> Response:
        """
        Returns:
            Response: {conversation_id, conversation_name, created_at, updated_at, message_count, chat_history: [], chat_state: 0, chat_pending: False, chat_special_inputs: []}
        """
        result = self.chatbot_service.create_conversation(data=request.data)
        return Response(
            success("Conversation created successfully.", result),
            status=status.HTTP_201_CREATED,
        )


@throttle_classes([UserRateThrottle])
class ProjectConversationAPIView(NonBlockingAPIView):
    """API View for renaming or deleting a single chatbot conversation."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectChatbotApplicationService

        self.chatbot_service = ProjectChatbotApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while renaming the conversation.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id", "conversation_id", "conversation_name"])
    def patch(self, request: Request) -> Response:
        result = self.chatbot_service.rename_conversation(data=request.data)
        return Response(
            success("Conversation renamed successfully.", result),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while deleting the conversation.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id", "conversation_id"])
    def delete(self, request: Request) -> Response:
        result = self.chatbot_service.delete_conversation(data=request.data)
        return Response(
            success("Conversation deleted successfully.", result),
            status=status.HTTP_200_OK,
        )

@throttle_classes([UserRateThrottle])
class ProjectChatFileAPIView(NonBlockingAPIView):
    """API View for uploading/downloading chatbot message attachments."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectChatFileApplicationService

        self.chat_file_service = ProjectChatFileApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while uploading the attachment(s).",
        exception_logger=logger,
    )
    @verify_files_getlist_params(key_list=["file"])
    @verify_data_params(key_list=["project_id"])
    def post(self, request: Request) -> Response:
        attachments = self.chat_file_service.upload_files(
            data=request.data,
            files=request.FILES,
        )
        return Response(
            success("Chat attachment(s) uploaded successfully.", {"files": attachments}),
            status=status.HTTP_201_CREATED,
        )

    @raise_exception(
        "An error occurred while downloading the attachment.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id", "file_id"])
    def get(self, request: Request) -> Response:
        file_data = self.chat_file_service.get_file(data=request.GET)
        return Response(
            success("Chat attachment retrieved successfully.", file_data),
            status=status.HTTP_200_OK,
        )
