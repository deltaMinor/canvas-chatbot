from django.urls import include, path

from .views import (
    KbToscaAPIView,
    MasterDiagramTemplatesAPIView,
    ValidateToscaView,
)

urlpatterns = [
    # Health
    # path(
    #     "health",
    #     HealthAPIView.as_view(),
    # ),
    # Knowledge base
    path(
        "kb/tosca",
        KbToscaAPIView.as_view(),
    ),
    # Project diagram
    path(
        "",
        include("service.application.project_diagram.urls"),
    ),
    # Chatbot
    path(
        "",
        include("service.application.chatbot.urls"),
    ),
    # Templates
    path(
        "master_diagram_templates",
        MasterDiagramTemplatesAPIView.as_view(),
    ),
    # Validation
    path(
        "tosca/validate",
        ValidateToscaView.as_view(),
    ),
]
