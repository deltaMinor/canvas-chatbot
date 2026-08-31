from django.urls import path

from .views import (
    ProjectDiagramCactiFilesAPIView,
    ProjectDiagramImageFilesAPIView,
    ProjectDiagramJSONFilesAPIView,
    ProjectDiagramModuleFilesAPIView,
    ProjectDiagramPDFDocumentFileDownloadAPIView,
    ProjectDiagramPDFDocumentFilesAPIView,
    ProjectDiagramTerraformFilesAPIView,
    ProjectDiagramXMLFilesAPIView,
)

urlpatterns = [
    path(
        "files/cacti",
        ProjectDiagramCactiFilesAPIView.as_view(),
    ),
    path(
        "files/diagram",
        ProjectDiagramJSONFilesAPIView.as_view(),
    ),
    path(
        "files/module",
        ProjectDiagramModuleFilesAPIView.as_view(),
    ),
    path(
        "files/image",
        ProjectDiagramImageFilesAPIView.as_view(),
    ),
    path(
        "files/terraform",
        ProjectDiagramTerraformFilesAPIView.as_view(),
    ),
    path(
        "files/xml",
        ProjectDiagramXMLFilesAPIView.as_view(),
    ),
    path(
        "files/pdf",
        ProjectDiagramPDFDocumentFilesAPIView.as_view(),
    ),
    path(
        "files/pdf/download",
        ProjectDiagramPDFDocumentFileDownloadAPIView.as_view(),
    ),
]
