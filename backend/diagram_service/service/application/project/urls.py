from django.urls import path

from .views import ProjectAPIView

urlpatterns = [
    path(
        "project",
        ProjectAPIView.as_view(),
    ),
]
