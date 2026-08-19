from django.urls import include, path

from .views import ProjectChatHistoryAPIView, ProjectChatFileAPIView, ProjectConversationAPIView, ProjectConversationsAPIView

urlpatterns = [
    path(
        "chat_history",
        ProjectChatHistoryAPIView.as_view(),
    ),
    path(
        "chat_history/file",
        ProjectChatFileAPIView.as_view(),
    ),
    path(
        "chat_history/conversations",
        ProjectConversationsAPIView.as_view(),
    ),
    path(
        "chat_history/conversation",
        ProjectConversationAPIView.as_view(),
    ),
    # IntentRX bridge
    path(
        "",
        include("service.application.chatbot.intentrx_bridge.urls"),
    ),
    # Topology run context
    path(
        "",
        include("service.application.chatbot.topology_run_context.urls"),
    ),
]
