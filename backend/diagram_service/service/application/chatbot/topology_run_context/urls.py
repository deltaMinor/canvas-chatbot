from django.urls import path

from .views import TopologyRunContextAPIView

urlpatterns = [
    path(
        "topology_run_context",
        TopologyRunContextAPIView.as_view(),
    ),
]
