from django.urls import include, path

from .views import (
    ProjectDiagramAPIView,
    ProjectDiagramLogsAPIView,
    ProjectDiagramNodeLogsAPIView,
)

urlpatterns = [
    # Root
    path(
        "project_diagram",
        ProjectDiagramAPIView.as_view(),
    ),
    # Files
    path(
        "project_diagram/",
        include("service.application.project_diagram.files.urls"),
    ),
    # Canvas
    path(
        "project_diagram/",
        include("service.application.project_diagram.canvas.urls"),
    ),
    # Logs
    path(
        "project_diagram/logs",
        ProjectDiagramLogsAPIView.as_view(),
    ),
    path(
        "project_diagram/logs/edge",
        ProjectDiagramNodeLogsAPIView.as_view(),
    ),
    path(
        "project_diagram/logs/node",
        ProjectDiagramNodeLogsAPIView.as_view(),
    ),
]
