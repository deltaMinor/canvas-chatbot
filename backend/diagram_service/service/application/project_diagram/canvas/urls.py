from django.urls import path

from .views import (
    ProjectDiagramCanvasAPIView,
    ProjectDiagramCanvasArchitectureGenerateAPIView,
    ProjectDiagramEdgeAPIView,
    ProjectDiagramNodeAPIView,
)

urlpatterns = [
    path(
        "canvas",
        ProjectDiagramCanvasAPIView.as_view(),
    ),
    path(
        "canvas/architecture/generate",
        ProjectDiagramCanvasArchitectureGenerateAPIView.as_view(),
    ),
    path(
        "canvas/edge",
        ProjectDiagramEdgeAPIView.as_view(),
    ),
    path(
        "canvas/node",
        ProjectDiagramNodeAPIView.as_view(),
    ),
]
