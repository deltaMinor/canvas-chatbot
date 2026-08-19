from django.urls import path

from .views import (
    IntentRXFileAPIView,
    IntentRXMessageAPIView,
    IntentRXProgressAPIView,
    IntentRXStartAPIView,
    IntentRXStatusAPIView,
    IntentRXStopAPIView,
)

urlpatterns = [
    path(
        "intentrx/start",
        IntentRXStartAPIView.as_view(),
    ),
    path(
        "intentrx/message",
        IntentRXMessageAPIView.as_view(),
    ),
    path(
        "intentrx/file",
        IntentRXFileAPIView.as_view(),
    ),
    path(
        "intentrx/progress",
        IntentRXProgressAPIView.as_view(),
    ),
    path(
        "intentrx/status",
        IntentRXStatusAPIView.as_view(),
    ),
    path(
        "intentrx/stop",
        IntentRXStopAPIView.as_view(),
    ),
]
