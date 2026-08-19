import logging

from rest_framework import status
from rest_framework.decorators import throttle_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from shared_libs.decorators import raise_exception, verify_data_params
from shared_libs.lib.nonblocking_api_view import NonBlockingAPIView
from shared_libs.templates.message_template import success

logger = logging.getLogger(__name__)


@throttle_classes([UserRateThrottle])
class IntentRXStartAPIView(NonBlockingAPIView):
    """Starts a new IntentRX subprocess for a chatbot session.

    POST body: { session_id: str, app?: "onto" | "intent" | "topology", project_id?: str }
    Returns: { panels: {title: str | null, text: str}[], ended: bool } --
    `panels` is IntentRX's startup output, one entry per rendered panel
    in print order.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .service import IntentRXApplicationService

        self.intentrx_service = IntentRXApplicationService()

    @raise_exception(
        "An error occurred while starting IntentRX.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["session_id"])
    def post(self, request: Request) -> Response:
        result = self.intentrx_service.start(data=request.data)
        return Response(
            success("IntentRX started.", result),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class IntentRXMessageAPIView(NonBlockingAPIView):
    """Sends one line of user input to a running IntentRX subprocess.

    POST body: { session_id: str, text: str, project_id?: str }
    Returns: { panels: {title: str | null, text: str}[], ended: bool } --
    `ended` is true once IntentRX has exited.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .service import IntentRXApplicationService

        self.intentrx_service = IntentRXApplicationService()

    @raise_exception(
        "An error occurred while messaging IntentRX.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["session_id", "text"])
    def post(self, request: Request) -> Response:
        result = self.intentrx_service.send_message(data=request.data)
        return Response(
            success("IntentRX message processed.", result),
            status=status.HTTP_200_OK,
        )

@throttle_classes([UserRateThrottle])
class IntentRXFileAPIView(NonBlockingAPIView):
 
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .service import IntentRXApplicationService
 
        self.intentrx_service = IntentRXApplicationService()
 
    @raise_exception(
        "An error occurred while reading the file.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["path"])
    def post(self, request: Request) -> Response:
        result = self.intentrx_service.read_file(data=request.data)
        return Response(
            success("File read.", result),
            status=status.HTTP_200_OK,
        )

@throttle_classes([UserRateThrottle])
class IntentRXStatusAPIView(NonBlockingAPIView):
    """Reports whether a session id is still an actively running IntentRX
    subprocess, and whether it is currently busy processing a turn.

    POST body: { session_id: str }
    Returns: { running: bool, busy: bool }
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .service import IntentRXApplicationService

        self.intentrx_service = IntentRXApplicationService()

    @raise_exception(
        "An error occurred while checking IntentRX status.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["session_id"])
    def post(self, request: Request) -> Response:
        result = self.intentrx_service.status(data=request.data)
        return Response(
            success("IntentRX status read.", result),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class IntentRXStopAPIView(NonBlockingAPIView):
    """Force-stops a session's IntentRX subprocess, e.g. when the
    conversation it belongs to is deleted while IntentRX is still running.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .service import IntentRXApplicationService

        self.intentrx_service = IntentRXApplicationService()

    @raise_exception(
        "An error occurred while stopping IntentRX.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["session_id"])
    def post(self, request: Request) -> Response:
        result = self.intentrx_service.stop(data=request.data)
        return Response(
            success("IntentRX stopped.", result),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class IntentRXProgressAPIView(NonBlockingAPIView):
    """Reports the latest line IntentRX has printed for the turn currently
    in flight, so the chatbot can update a progress indicator while a slow
    `intentrx/start` or `intentrx/message` call is still blocked.
 
    POST body: { session_id: str }
    Returns: { text: str } -- "" if nothing has been printed yet.
    """
 
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .service import IntentRXApplicationService
 
        self.intentrx_service = IntentRXApplicationService()
 
    @raise_exception(
        "An error occurred while reading IntentRX progress.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["session_id"])
    def post(self, request: Request) -> Response:
        result = self.intentrx_service.progress(data=request.data)
        return Response(
            success("IntentRX progress read.", result),
            status=status.HTTP_200_OK,
        )
