import logging

from main import celery_app
from rest_framework import status
from rest_framework.decorators import throttle_classes
from rest_framework.exceptions import ValidationError
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
class ProjectDiagramCanvasArchitectureGenerateAPIView(NonBlockingAPIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADApplicationService

        self.project_ad_service = ProjectADApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )
        from .services import ProjectRegisterApplicationService

        self.project_register_service = ProjectRegisterApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @staticmethod
    def _require_field(data, key: str):
        value = data.get(key)
        if value in [None, ""]:
            raise ValidationError({key: "This field is required."})
        return value

    @staticmethod
    def _require_list(data, key: str):
        value = data.get(key)
        if not isinstance(value, list) or not value:
            raise ValidationError({key: "This field is required."})
        return value

    @raise_exception(
        "An error occurred while generating the project diagram architecture canvas.",
        exception_logger=logger,
    )
    def post(self, request: Request):
        project_id = self._require_field(request.data, "project_id")
        file_type = self._require_field(request.data, "file_type")

        if file_type == "cacti":
            file_id = self._require_field(request.data, "file_id")
            project_ad = self.project_ad_service.initialize_architecture_canvas_from_cacti(
                data={
                    "project_id": project_id,
                    "selected_cacti_file_id": file_id,
                },
            )
            return Response(
                success(
                    "Architecture canvas list successfully generated from CACTi files.",
                    {"project_ad": project_ad},
                ),
                status=status.HTTP_201_CREATED,
            )

        if file_type == "json":
            file_id = self._require_field(request.data, "file_id")
            project_ad = self.project_ad_service.initialize_architecture_canvas_from_diagram_file(
                data={
                    "project_id": project_id,
                    "selected_diagram_file_id": file_id,
                },
            )
            return Response(
                success(
                    "Architecture canvas list successfully generated from diagram file.",
                    {"project_ad": project_ad},
                ),
                status=status.HTTP_201_CREATED,
            )

        if file_type == "iac":
            terraform_file_id_list = self._require_list(request.data, "file_id_list")
            module_file_id_list = request.data.get("module_file_id_list", [])
            project_ad = self.project_ad_service.initialize_architecture_canvas_from_iac(
                data={
                    "project_id": project_id,
                    "selected_terraform_file_id_list": terraform_file_id_list,
                    "selected_module_file_id_list": module_file_id_list,
                },
            )
            return Response(
                success(
                    "Architecture canvas list successfully generated from terraform files.",
                    {"project_ad": project_ad},
                ),
                status=status.HTTP_201_CREATED,
            )

        if file_type == "template":
            file_id = self._require_field(request.data, "file_id")
            project_ad = self.project_ad_service.initialize_architecture_canvas_from_template(
                data={
                    "project_id": project_id,
                    "selected_template_id": file_id,
                },
            )
            return Response(
                success(
                    "Architecture canvas successfully generated from template.",
                    {"project_ad": project_ad},
                ),
                status=status.HTTP_201_CREATED,
            )

        if file_type == "xml":
            file_id = self._require_field(request.data, "file_id")
            project_ad = self.project_ad_service.initialize_architecture_canvas_from_xml(
                data={
                    "project_id": project_id,
                    "selected_xml_file_id": file_id,
                },
            )
            return Response(
                success(
                    "Architecture canvas list successfully generated from XML file.",
                    {"project_ad": project_ad},
                ),
                status=status.HTTP_201_CREATED,
            )

        if file_type == "image":
            file_id = self._require_field(request.data, "file_id")
            canvas_id = self._require_field(request.data, "canvas_id")
            task_id = self.project_register_service.infer_llm_topology_architecture(
                data={
                    "project_id": project_id,
                    "canvas_id": canvas_id,
                    "file_id": file_id,
                },
            )
            return Response(
                success(
                    "Project diagram architecture conversion using LLM initiated successfully.",
                    {"generation": {"task_id": task_id}},
                ),
                status=status.HTTP_200_OK,
            )

        if file_type == "description":
            description = self._require_field(request.data, "description")
            canvas_id = self._require_field(request.data, "canvas_id")
            task_id = self.project_register_service.infer_llm_architecture(
                data={
                    "project_id": project_id,
                    "canvas_id": canvas_id,
                    "description": description,
                },
            )
            return Response(
                success(
                    "Project diagram architecture generation using LLM initiated successfully.",
                    {"generation": {"task_id": task_id}},
                ),
                status=status.HTTP_200_OK,
            )

        raise ValidationError(
            {
                "file_type": (
                    "Unsupported file_type. Expected one of: cacti, json, iac, template, xml, image."
                )
            }
        )

    @raise_exception(
        "An error occurred while retrieving architecture generation status.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id", "canvas_id"])
    def get(
        self,
        request: Request,
    ) -> Response:
        llm_generation_status = self.project_ad_service.get_llm_generation_status(
            data=request.GET,
        )
        return Response(
            success(
                "Architecture generation status is retrieved successfully.",
                llm_generation_status,
            ),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class ProjectDiagramCanvasAPIView(NonBlockingAPIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADApplicationService

        self.project_ad_service = ProjectADApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while updating canvas.", exception_logger=logger
    )
    @verify_data_params(
        key_list=[
            "project_id",
            "canvas_id",
            "canvas",
        ]
    )
    def patch(
        self,
        request: Request,
    ) -> Response:
        """Updates a canvas.

        This method updates a canvas for a project diagram based on the provided data. It ensures
        that the request is authenticated and verifies the required data parameters. It raises an
        exception if the update fails.

        Args:
            request (Request): The HTTP request object containing the data for updating the canvas.

        Returns:
            Response: An HTTP response object indicating the success of the update.

        Raises:
            Exception: If the update of the canvas fails.
        """
        retval = self.project_ad_service.update_canvas(
            data=request.data,
            reserved_keys=[
                "canvas_id",
            ],
        )
        return Response(
            success(
                "Canvas is updated successfully.",
                retval,
            ),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class ProjectDiagramEdgeAPIView(NonBlockingAPIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADApplicationService

        self.project_ad_service = ProjectADApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception("An error occurred while updating edge.", exception_logger=logger)
    @verify_data_params(
        key_list=[
            "project_id",
            "canvas_id",
            "edge",
            "edge_id",
        ]
    )
    def patch(
        self,
        request: Request,
    ) -> Response:
        """Updates an edge.

        This method updates an edge for a project diagram based on the provided data. It ensures
        that the request is authenticated and verifies the required data parameters. It raises an
        exception if the update fails.

        Args:
            request (Request): The HTTP request object containing the data for updating the edge.

        Returns:
            Response: An HTTP response object indicating the success of the update.

        Raises:
            Exception: If the update of the edge fails.
        """
        retval = self.project_ad_service.update_edge(
            data=request.data,
            reserved_keys=[
                "id",
            ],
        )
        return Response(
            success(
                "Edge is updated successfully.",
                retval,
            ),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class ProjectDiagramNodeAPIView(NonBlockingAPIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADApplicationService

        self.project_ad_service = ProjectADApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception("An error occurred while updating node.", exception_logger=logger)
    @verify_data_params(
        key_list=[
            "project_id",
            "canvas_id",
            "node",
            "node_id",
        ]
    )
    def patch(
        self,
        request: Request,
    ) -> Response:
        """Updates a node.

        This method updates a node for a project diagram based on the provided data. It ensures that
        the request is authenticated and verifies the required data parameters. It raises an
        exception if the update fails.

        Args:
            request (Request): The HTTP request object containing the data for updating the node.

        Returns:
            Response: An HTTP response object indicating the success of the update.

        Raises:
            Exception: If the update of the node fails.
        """
        retval = self.project_ad_service.update_node(
            data=request.data,
            reserved_keys=[
                "id",
            ],
        )
        return Response(
            success(
                "Node is updated successfully.",
                retval,
            ),
            status=status.HTTP_200_OK,
        )


class ProjectDiagramDataFlowGenerationAPIView(NonBlockingAPIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADApplicationService

        self.project_ad_service = ProjectADApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )
        from .services import ProjectRegisterApplicationService

        self.project_register_service = ProjectRegisterApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception("An error occurred while generate dataflow diagram using LLM.")
    @verify_data_params(key_list=["project_id"])
    def post(self, request: Request):
        """
        Creates project diagram dataflow canvas using LLM.

        This method retrieves the data from the request. It then creates a project dataflow canvas
        model with the data and updates the project dataflow canvas in the database. It
        returns a response with the created project dataflow canvas model.

        Args:
            request (Request): The request containing the data to create the project register
                            scenario with.

        Returns:
            Response: A response with the created project dataflow canvas model.

        Raises:
            Exception: If an error occurs while creating the project dataflow canvas.
        """
        task_id = self.project_register_service.infer_llm_dataflow(
            data=request.data,
        )
        return Response(
            success(
                "Project diagram dataflow generation using LLM initiated successfully.",
                {"generation": {"task_id": task_id}},
            ),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while retrieving data flow generation status.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id", "canvas_id"])
    def get(
        self,
        request: Request,
    ) -> Response:
        llm_generation_status = self.project_ad_service.get_llm_generation_status(
            data=request.GET,
        )
        return Response(
            success(
                "Data flow generation status is retrieved successfully.",
                llm_generation_status,
            ),
            status=status.HTTP_200_OK,
        )
