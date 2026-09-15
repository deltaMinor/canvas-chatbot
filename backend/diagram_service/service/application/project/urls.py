from django.urls import path

from .mock_user_views import MockUserQuotaAPIView, MockUsersAPIView
from .views import ProjectAPIView

urlpatterns = [
    path(
        "project",
        ProjectAPIView.as_view(),
    ),
    # Mock multi-user simulation (see mock_users.py for details).
    path(
        "mock_users",
        MockUsersAPIView.as_view(),
    ),
    path(
        "mock_users/<str:user_id>/quota",
        MockUserQuotaAPIView.as_view(),
    ),
]
