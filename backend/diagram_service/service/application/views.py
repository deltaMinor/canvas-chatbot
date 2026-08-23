import logging

from main import celery_app
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
class KbToscaAPIView(NonBlockingAPIView):
    """Handles the API view for retrieving Kb TOSCA.

    This class provides the API endpoint for retrieving Kb TOSCA. It uses the
    KbToscaApplicationService to retrieve Kb TOSCA.

    Attributes:
        kb_tosca_service (KbToscaApplicationService): The service used to retrieve Kb TOSCA.

    Methods:
        get: Retrieves Kb TOSCA and returns a response.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import KbToscaApplicationService

        self.kb_tosca_service = KbToscaApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving kb TOSCA.",
        exception_logger=logger,
    )
    def get(
        self,
        request: Request,
    ):
        """Retrieves Kb TOSCA and returns a response.

        This method retrieves kb TOSCA using the KbToscaApplicationService and returns a response
        with the retrieved Kb TOSCA.

        Args:
            request (Request): The request.

        Returns:
            Response: A response containing the retrieved Kb TOSCA and a success message.
        """
        kb_tosca_model = self.kb_tosca_service.get_kb_tosca_model(
        )
        return Response(
            success(
                "Kb TOSCA is retrieved successfully.",
                {"kb_tosca": kb_tosca_model.model_dump()},
            ),
            status=status.HTTP_200_OK,
        )


class MasterDiagramTemplatesAPIView(NonBlockingAPIView):
    """Handles the API view for retrieving master diagram templates.

    This class provides the API endpoint for retrieving master diagram templates. It uses the
    MasterADTemplateApplicationService to retrieve the templates.

    Attributes:
        master_diagram_template_service (MasterADTemplateApplicationService): The service used to
        retrieve master diagram templates.

    Methods:
        get: Retrieves master diagram templates and returns a response.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import MasterADTemplateApplicationService

        self.master_ad_template_service = MasterADTemplateApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving master diagram templates.",
        exception_logger=logger,
    )
    def get(self, request: Request):
        """Retrieves master diagram templates and returns a response.

        This method retrieves master diagram templates using the MasterADTemplateApplicationService
        and returns a response with the retrieved templates.

        Args:
            request (Request): The request.

        Returns:
            Response: A response containing the retrieved master diagram templates and a success
            message.
        """
        master_diagram_template_models = (
            self.master_ad_template_service.get_master_diagram_template_models(
            )
        )
        return Response(
            success(
                "Master diagram templates are retrieved successfully.",
                {
                    "master_diagram_templates": [
                        _.model_dump() for _ in master_diagram_template_models
                    ]
                },
            ),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class ValidateToscaView(NonBlockingAPIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .project_diagram.services import ProjectADApplicationService

        self.project_ad_service = ProjectADApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while validating tosca of diagram",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def post(
        self,
        request: Request,
    ):
        """
        Generate a new TOSCA report for each canvas view in the diagram specified in the request.
        The report will describe which relationships WARN or FAIL, and the reasons for each outcome.

        Args:
            request (Request): The request object containing the diagram data to be validated.

        Raises:
            Exception: If an error occurs during validation of the diagram

        Returns:
            Response: A response object with a success message and the newly updated diagram with warnings.
        """

        payload = self.project_ad_service.update_tosca_report(
            data=request.data,
        )
        return Response(
            success("TOSCA report has been successfully generated", payload),
            status=status.HTTP_201_CREATED,
        )
