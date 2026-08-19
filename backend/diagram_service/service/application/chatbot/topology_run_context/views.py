import logging

from main import celery_app
from rest_framework import status
from rest_framework.decorators import throttle_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from shared_libs.decorators import raise_exception, verify_data_params, verify_get_params
from shared_libs.lib.nonblocking_api_view import NonBlockingAPIView
from shared_libs.templates.message_template import success

logger = logging.getLogger(__name__)


@throttle_classes([UserRateThrottle])
class TopologyRunContextAPIView(NonBlockingAPIView):
    """API View for recording and listing TopologyGenerator run contexts,
    scoped to a single chatbot conversation.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .service import TopologyRunContextApplicationService

        self.topology_run_context_service = TopologyRunContextApplicationService(
            celery_app=celery_app,
        )

    @raise_exception(
        "An error occurred while listing topology run contexts.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id", "conversation_id"])
    def get(self, request: Request) -> Response:
        """
        Returns:
            Response: { runs: [{conversation_id, run_id, address, created_at}, ...] }
        """
        result = self.topology_run_context_service.list_runs(data=request.GET)
        return Response(
            success("Topology run contexts retrieved successfully.", result),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while recording the topology run context.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id", "conversation_id", "run_id", "address"])
    def post(self, request: Request) -> Response:
        """
        Returns:
            Response: {conversation_id, run_id, address, created_at}
        """
        result = self.topology_run_context_service.record_run(data=request.data)
        return Response(
            success("Topology run context recorded successfully.", result),
            status=status.HTTP_201_CREATED,
        )

    @raise_exception(
        "An error occurred while deleting the topology run context.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id", "conversation_id", "run_id"])
    def delete(self, request: Request) -> Response:
        """
        Returns:
            Response: {conversation_id, run_id}
        """
        result = self.topology_run_context_service.delete_run(data=request.data)
        return Response(
            success("Topology run context deleted successfully.", result),
            status=status.HTTP_200_OK,
        )
