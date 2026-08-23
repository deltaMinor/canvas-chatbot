import logging

from main import celery_app
from rest_framework import status
from rest_framework.decorators import throttle_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from shared_libs.decorators import (
    raise_exception,
    verify_data_params,
    verify_get_params,
)
from shared_libs.lib.nonblocking_api_view import NonBlockingAPIView
from shared_libs.templates.message_template import success

logger = logging.getLogger(__name__)


@throttle_classes([UserRateThrottle])
class ProjectDiagramAPIView(NonBlockingAPIView):
    """
    API View for handling requests related to the Project Diagram.

    This view handles GET, POST, PUT, and DELETE requests for the Project Diagram. It uses the
    ProjectADApplicationService to perform the necessary operations. The view is throttled on a
    per-user basis to prevent abuse.

    Attributes:
        project_ad_service (ProjectADApplicationService): The service used for performing operations
        related to the Project Diagram.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADApplicationService

        self.project_ad_service = ProjectADApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving project diagram.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id"])
    def get(
        self,
        request: Request,
    ):
        """
        Retrieves the architecture diagram (AD) associated with a specific project.

        This method handles GET requests to retrieve the architecture diagram for a project. It
        requires authentication and the right permission. The project ID should be
        provided in the request parameters under the key 'project_id'.

        Args:
            request (Request): The request object containing the parameters from the client.

        Raises:
            Exception: If an error occurs while retrieving the architecture diagram.

        Returns:
            Response: A response object containing the status and data for the client.
        """
        project_ad = self.project_ad_service.get_project_ad(
            data=request.GET,
        )
        return Response(
            success(
                "Project diagram is retrieved successfully.",
                {"project_diagram": project_ad},
            ),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while updating the canvas.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def patch(
        self,
        request: Request,
    ):
        """
        Updates the architecture diagram (AD) of a project.

        This method requires authentication and the 'project_diagram.update' permission. It updates
        the AD of a project based on the provided data, which should include the project ID and the
        new canvas. The method returns a success response with the updated AD.

        Args:
            request (Request): The request object containing the data for the update.

        Raises:
            Exception: If an error occurs while updating the canvas.

        Returns:
            Response: A response object with a success message and the updated AD.
        """
        retval = self.project_ad_service.update_project_ad(
            data=request.data,
            reserved_keys=["project_id", "metadata", "topology_run_context"],
        )
        return Response(
            success(
                "Canvas in one project is updated successfully.",
                retval,
            ),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while creating new architecture diagram.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def post(self, request: Request):
        """
        Creates a new blank architecture diagram (AD) for a project.

        This method requires authentication and the 'project_diagram.create' permission. It creates
        a new blank AD for a project based on the provided data, which should include the project
        ID. The method returns a success response with the newly created AD.

        Args:
            request (Request): The request object containing the data for the creation.

        Raises:
            Exception: If an error occurs while creating the new architecture diagram.

        Returns:
            Response: A response object with a success message and the newly created AD.
        """
        payload = self.project_ad_service.initialize_blank_canvas(
            data=request.data,
        )
        return Response(
            success(
                "Blank canvas successfully generated.",
                payload,
            ),
            status=status.HTTP_201_CREATED,
        )


@throttle_classes([UserRateThrottle])
class ProjectDiagramLogsAPIView(NonBlockingAPIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADApplicationService

        self.project_ad_service = ProjectADApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving project diagram logs.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id"])
    def get(
        self,
        request: Request,
    ):
        project_diagram_logs = self.project_ad_service.get_project_diagram_logs(
            data=request.GET,
        )
        return Response(
            success(
                "Project diagram logs are retrieved successfully.",
                {"logs": project_diagram_logs},
            ),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class ProjectDiagramNodeLogsAPIView(NonBlockingAPIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADApplicationService

        self.project_ad_service = ProjectADApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving project diagram node logs.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id", "node_id"])
    def get(
        self,
        request: Request,
    ):
        project_diagram_logs = self.project_ad_service.get_project_diagram_node_logs(
            data=request.GET,
        )
        return Response(
            success(
                "Project diagram node logs are retrieved successfully.",
                {"logs": project_diagram_logs},
            ),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class ProjectDiagramGenerateFromXMLAPIView(NonBlockingAPIView):
    """
    API View for creating a new architecture diagram (AD) for a project from XML files.

    This view handles POST requests and uses the ProjectADApplicationService to perform the
    necessary operations. The view is throttled on a per-user basis to prevent abuse.

    Attributes:
        project_ad_service (ProjectADApplicationService): The service used for performing
        operations related to the Project Architecture Diagram
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADApplicationService

        self.project_ad_service = ProjectADApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while initializing diagram canvas list from files.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id", "selected_xml_file_id"])
    def post(
        self,
        request: Request,
    ):
        """Initializes the architecture canvas list from XML files.

        This method initializes the architecture canvas list from the provided
        XML files. It ensures that the request is authenticated and authorized
        to perform the initialization. It raises an exception if the initialization
        fails.

        Args:
            request (Request): The HTTP request object containing the data for
            initializing the architecture canvas list.

        Returns:
            Response: An HTTP response object indicating the success of the
            initialization.

        Raises:
            Exception: If the initialization of the architecture canvas list fails.
        """
        project_ad = self.project_ad_service.initialize_architecture_canvas_from_xml(
            data=request.data,
        )
        return Response(
            success(
                "Architecture canvas list successfully generated from XML files.",
                {"project_ad": project_ad},
            ),
            status=status.HTTP_201_CREATED,
        )
