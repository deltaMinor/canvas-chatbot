import logging

from main import celery_app
from rest_framework import status
from rest_framework.decorators import throttle_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from shared_libs.constants.architecture_diagram import (
    PROJECT_AD_FILE_TYPE_CACTI,
    PROJECT_AD_FILE_TYPE_DIAGRAM,
    PROJECT_AD_FILE_TYPE_MODULE,
    PROJECT_AD_FILE_TYPE_PDF_DOCUMENT,
    PROJECT_AD_FILE_TYPE_TERRAFORM,
    PROJECT_AD_FILE_TYPE_XML,
)
from shared_libs.decorators import (
    raise_exception,
    verify_data_params,
    verify_files_get_params,
    verify_files_getlist_params,
    verify_get_params,
)
from shared_libs.lib.nonblocking_api_view import NonBlockingAPIView
from shared_libs.templates.message_template import success

logger = logging.getLogger(__name__)


class ProjectDiagramTerraformFilesAPIView(NonBlockingAPIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADFileApplicationService

        self.project_ad_file_service = ProjectADFileApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving Terraform files.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id"])
    def get(
        self,
        request: Request,
    ):
        """Retrieves Terraform files for a specific project from the database.

        This method retrieves a project ID from the request data, verifies the project ID using the
        retrieves the Terraform files for the specified project
        from the database using the file_terraform_service.

        Args:
            request (Request): The request containing the project ID.

        Returns:
            Response: A response containing the retrieved Terraform files and a success message. If
            no Terraform files are found for the specified project, the response will contain an
            appropriate message and an empty list of files.
        """
        terraform_files = self.project_ad_file_service.get_files(
            data=request.GET,
            file_type=PROJECT_AD_FILE_TYPE_TERRAFORM,
        )
        return Response(
            success(
                "Terraform files retrieved successfully.",
                {"terraform_files": terraform_files},
            ),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while inserting Terraform files.",
        exception_logger=logger,
    )
    @verify_files_getlist_params(key_list=["file"])
    @verify_data_params(key_list=["project_id"])
    def post(
        self,
        request: Request,
    ):
        """Uploads Terraform files to the database.

        This method retrieves a project ID and a list of files from the request data, verifies the
        project ID and uploads the Terraform files to the
        database using the file_terraform_service.

        Args:
            request (Request): The request containing the data of the Terraform files to upload.

        Returns:
            Response: A response containing a success message and the result of the
            project_ad_file_service.insert_files method.
        """
        res = self.project_ad_file_service.insert_files(
            data=request.data,
            files=request.FILES,
            file_type=PROJECT_AD_FILE_TYPE_TERRAFORM,
        )

        # db_files = get_ad_terraform_files(
        #     {Project.project_id.value: project_id},
        #     user_info=SYSTEM_USER_INFO,
        # )
        # if not db_files or not len(db_files):
        #     raise NotFound(f"No files found for project_id {project_id}")
        # TERRAFORM_FILES_DIR = f"{ASSETS_DIR}/{project_id}/terraform"
        # save_database_files_in_local_directory(db_files, TERRAFORM_FILES_DIR)

        return Response(
            success("Terraform files successfully uploaded.", res),
            status=status.HTTP_201_CREATED,
        )

    @raise_exception(
        "An error occurred while deleting Terraform files.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def delete(
        self,
        request: Request,
    ):
        """Deletes Terraform files for a specific project from the database.

        This method retrieves a project ID from the request data, verifies the project ID using the
        deletes the Terraform files for the specified project
        from the database using the file_terraform_service.

        Args:
            request (Request): The request containing the project ID.

        Returns:
            Response: A response containing a success message and the result of the
            project_ad_file_service.delete_files method.
        """
        res = self.project_ad_file_service.delete_files(
            data=request.data,
            file_type=PROJECT_AD_FILE_TYPE_TERRAFORM,
        )
        return Response(
            success("Terraform files deleted successfully.", res),
            status=status.HTTP_200_OK,
        )


class ProjectDiagramModuleFilesAPIView(NonBlockingAPIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADFileApplicationService

        self.project_ad_file_service = ProjectADFileApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving the module file.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id"])
    def get(
        self,
        request: Request,
    ):
        """Retrieves module files for a specific project from the database.

        This method retrieves a project ID from the request data, verifies the project ID using the
        retrieves the module files for the specified project
        from the database using the file_module_service.

        Args:
            request (Request): The request containing the project ID.

        Returns:
            Response: A response containing the retrieved module files and a success message. If no
            module files are found for the specified project, the response will contain an
            appropriate message and an empty list of files.
        """
        module_files = self.project_ad_file_service.get_files(
            data=request.GET,
            file_type=PROJECT_AD_FILE_TYPE_MODULE,
        )
        return Response(
            success(
                "Module file retrieved successfully.",
                {"module_files": module_files},
            ),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while saving new module file.",
        exception_logger=logger,
    )
    @verify_files_get_params(key_list=["zip_file"])
    @verify_data_params(key_list=["project_id", "directory_name"])
    def post(
        self,
        request: Request,
    ):
        """Uploads a module directory to the database.

        This method retrieves a project ID, directory name, and zip file from the request data,
        verifies the project ID and uploads the zip file
        to the database as a module directory.

        Args:
            request (Request): The request containing the data of the module directory to upload.

        Returns:
            Response: A response containing a success message.
        """
        res = self.project_ad_file_service.insert_files(
            data=request.data,
            files=request.FILES,
            file_type=PROJECT_AD_FILE_TYPE_MODULE,
        )

        # Fetch module files from database
        # db_files = get_ad_module_files(
        #     {Project.project_id.value: project_id},
        #     user_info=SYSTEM_USER_INFO,
        # )
        # if not db_files or not len(db_files):
        #     raise NotFound(f"No files found for project_id {project_id}")

        # db_zipfile = db_files[0]
        # save_zipfile_in_local_directory(db_zipfile, MODULE_DIR)

        return Response(
            success("Module zipfile successfully uploaded.", res),
            status=status.HTTP_201_CREATED,
        )

    @raise_exception(
        "An error occurred while deleting module file.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def delete(
        self,
        request: Request,
    ):
        """Deletes module files for a specific project from the database.

        This method retrieves a project ID from the request data, verifies the project ID using the
        deletes the module files for the specified project from
        the database using the file_module_service.

        Args:
            request (Request): The request containing the project ID.

        Returns:
            Response: A response containing a success message and the result of the
            project_ad_file_service.delete_files method.
        """
        res = self.project_ad_file_service.delete_files(
            data=request.data,
            file_type=PROJECT_AD_FILE_TYPE_MODULE,
        )
        return Response(
            success("Module file(s) deleted successfully.", res),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class ProjectDiagramCactiFilesAPIView(NonBlockingAPIView):
    """
    API View for handling requests related to the Project CACTi.

    This view handles GET and POST requests for the Project CACTi. It uses the
    ProjectADFileApplicationService to perform the necessary operations. The view is throttled on a
    per-user basis to prevent abuse.

    Attributes:
        project_ad_file_service (ProjectADFileApplicationService): The service used for performing
        operations related to the Project CACTi
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADFileApplicationService

        self.project_ad_file_service = ProjectADFileApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving project cacti files.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id"])
    def get(
        self,
        request: Request,
    ):
        project_cacti = self.project_ad_file_service.get_files(
            data=request.GET,
            file_type=PROJECT_AD_FILE_TYPE_CACTI,
            as_response=True,
        )
        return Response(
            success(
                "Project cacti files retrieved successfully.",
                {"project_cacti": project_cacti},
            ),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while inserting project cacti files.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def post(
        self,
        request: Request,
    ):
        """Inserts project cacti files.

        This method inserts project cacti files based on the provided data.
        It ensures that the request is authenticated and authorized to perform
        the insertion. It raises an exception if the insertion fails.

        Args:
            request (Request): The HTTP request object containing the data for
            inserting the project cacti file.

        Returns:
            Response: An HTTP response object indicating the success of the
            insertion.

        Raises:
            Exception: If the insertion of the project cacti file fails.
        """
        payload = self.project_ad_file_service.insert_files(
            data=request.data,
            files=request.FILES,
            file_type=PROJECT_AD_FILE_TYPE_CACTI,
        )
        return Response(
            success(
                "CACTI files successfully uploaded.",
                payload,
            ),
            status=status.HTTP_201_CREATED,
        )

    @raise_exception(
        "An error occurred while deleting project cacti files.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def delete(
        self,
        request: Request,
    ):
        """Deletes project cacti files.

        This method deletes project cacti files based on the provided data.
        It ensures that the request is authenticated and authorized to perform
        the deletion. It raises an exception if the deletion fails.

        Args:
            request (Request): The HTTP request object containing the data for
            deleting the project cacti files.

        Returns:
            Response: An HTTP response object indicating the success of the
            deletion.

        Raises:
            Exception: If the deletion of the project cacti files fails.
        """
        retval = self.project_ad_file_service.delete_files(
            data=request.data,
            file_type=PROJECT_AD_FILE_TYPE_CACTI,
        )
        return Response(
            success(
                "CACTi file is deleted successfully.",
                retval,
            ),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class ProjectDiagramJSONFilesAPIView(NonBlockingAPIView):
    """
    API View for handling requests related to the project diagram file.

    This view handles POST and DELETE requests for the project diagram file. It uses the
    ProjectADFileApplicationService to perform the necessary operations. The view is throttled
    on a per-user basis to prevent abuse.

    Attributes:
        project_ad_file_service (ProjectADFileApplicationService): The service used for
        performing operations related to the Project Diagram File
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADFileApplicationService

        self.project_ad_file_service = ProjectADFileApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving project diagram files.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id"])
    def get(
        self,
        request: Request,
    ):
        project_diagram_file = self.project_ad_file_service.get_files(
            data=request.GET,
            file_type=PROJECT_AD_FILE_TYPE_DIAGRAM,
            as_response=True,
        )
        return Response(
            success(
                "Project diagram files retrieved successfully.",
                {"project_diagram_file": project_diagram_file},
            ),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while inserting project diagram files.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def post(
        self,
        request: Request,
    ):
        """Insert project diagram files.

        This method inserts project diagram files based on the provided data.
        It ensures that the request is authenticated and authorized to perform
        the insertion. It raises an exception if the insertion fails.

        Args:
            request (Request): The HTTP request object containing the data for
            inserting the project diagram files.

        Returns:
            Response: An HTTP response object indicating the success of the
            insertion.

        Raises:
            Exception: If the insertion of the project diagram files fails.
        """
        payload = self.project_ad_file_service.insert_files(
            data=request.data,
            files=request.FILES,
            file_type=PROJECT_AD_FILE_TYPE_DIAGRAM,
        )
        return Response(
            success(
                "Project diagram files successfully uploaded.",
                payload,
            ),
            status=status.HTTP_201_CREATED,
        )

    @raise_exception(
        "An error occurred while deleting project diagram files.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def delete(
        self,
        request: Request,
    ):
        """Deletes project diagram files.

        This method deletes project diagram files based on the provided data.
        It ensures that the request is authenticated and authorized to perform
        the deletion. It raises an exception if the deletion fails.

        Args:
            request (Request): The HTTP request object containing the data for
            deleting the project diagram files.

        Returns:
            Response: An HTTP response object indicating the success of the
            deletion.

        Raises:
            Exception: If the deletion of the project diagram files fails.
        """
        retval = self.project_ad_file_service.delete_files(
            data=request.data,
            file_type=PROJECT_AD_FILE_TYPE_DIAGRAM,
        )
        return Response(
            success(
                "Project diagram file is deleted successfully.",
                retval,
            ),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class ProjectDiagramPDFDocumentFilesAPIView(NonBlockingAPIView):
    """
    API View for handling requests related to storage-only PDF document uploads.

    Attributes:
        project_ad_file_service (ProjectADFileApplicationService): The service used for
        performing operations related to the Project Diagram File
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADFileApplicationService

        self.project_ad_file_service = ProjectADFileApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving project PDF document files.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id"])
    def get(
        self,
        request: Request,
    ):
        project_pdf_document_file = self.project_ad_file_service.get_files(
            data=request.GET,
            file_type=PROJECT_AD_FILE_TYPE_PDF_DOCUMENT,
            as_response=True,
        )
        return Response(
            success(
                "Project PDF document files retrieved successfully.",
                {"project_pdf_document_file": project_pdf_document_file},
            ),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while inserting project PDF document files.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def post(
        self,
        request: Request,
    ):
        """Insert project PDF document files.

        This method stores uploaded PDF files against the project. It ensures
        that the request is authenticated and authorized to perform the
        insertion. It raises an exception if the insertion fails.

        Args:
            request (Request): The HTTP request object containing the data for
            inserting the project PDF document files.

        Returns:
            Response: An HTTP response object indicating the success of the
            insertion.

        Raises:
            Exception: If the insertion of the project PDF document files fails.
        """
        payload = self.project_ad_file_service.insert_files(
            data=request.data,
            files=request.FILES,
            file_type=PROJECT_AD_FILE_TYPE_PDF_DOCUMENT,
        )
        return Response(
            success(
                "Project PDF document files successfully uploaded.",
                payload,
            ),
            status=status.HTTP_201_CREATED,
        )

    @raise_exception(
        "An error occurred while deleting project PDF document files.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def delete(
        self,
        request: Request,
    ):
        """Deletes project PDF document files.

        This method deletes project PDF document files based on the provided
        data. It ensures that the request is authenticated and authorized to
        perform the deletion. It raises an exception if the deletion fails.

        Args:
            request (Request): The HTTP request object containing the data for
            deleting the project PDF document files.

        Returns:
            Response: An HTTP response object indicating the success of the
            deletion.

        Raises:
            Exception: If the deletion of the project PDF document files fails.
        """
        retval = self.project_ad_file_service.delete_files(
            data=request.data,
            file_type=PROJECT_AD_FILE_TYPE_PDF_DOCUMENT,
        )
        return Response(
            success(
                "Project PDF document file is deleted successfully.",
                retval,
            ),
            status=status.HTTP_200_OK,
        )


@throttle_classes([UserRateThrottle])
class ProjectDiagramMediaFilesAPIView(NonBlockingAPIView):
    file_types: list[str] = []
    file_label = "media"
    response_key = "project_ad_files"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from service.application.project_diagram.services import (
            ProjectADApplicationService,
        )

        self.project_ad_service = ProjectADApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving project diagram media files.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id"])
    def get(self, request: Request):
        payload = self.project_ad_service.get_project_ad_image_files(
            data=request.GET,
            file_types=self.file_types,
        )
        return Response(
            success(
                f"Project diagram {self.file_label} files retrieved successfully.",
                {self.response_key: payload},
            ),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while inserting project diagram media files.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def post(self, request: Request):
        payload = self.project_ad_service.insert_project_ad_image_files(
            data=request.data,
            files=request.FILES,
            file_types=self.file_types,
        )
        return Response(
            success(
                f"Project diagram {self.file_label} files successfully uploaded.",
                payload,
            ),
            status=status.HTTP_201_CREATED,
        )

    @raise_exception(
        "An error occurred while selecting project diagram media file.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id", "file_id"])
    def patch(self, request: Request):
        payload = self.project_ad_service.select_project_ad_image_file(
            data=request.data,
            file_types=self.file_types,
        )
        return Response(
            success(
                f"Project diagram {self.file_label} file selected successfully.",
                payload,
            ),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while deleting project diagram media files.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id", "file_id_list"])
    def delete(self, request: Request):
        payload = self.project_ad_service.delete_project_ad_image_files(
            data=request.data,
            file_types=self.file_types,
        )
        return Response(
            success(
                f"Project diagram {self.file_label} files deleted successfully.",
                payload,
            ),
            status=status.HTTP_200_OK,
        )


class ProjectDiagramImageFilesAPIView(ProjectDiagramMediaFilesAPIView):
    file_types = ["image", "pdf"]
    file_label = "image"
    response_key = "image_files"


@throttle_classes([UserRateThrottle])
class ProjectDiagramXMLFilesAPIView(NonBlockingAPIView):
    """
    API View for handling requests related to the Project XML.

    This view handles GET and POST requests for the Project XML. It uses the
    ProjectADFileApplicationService to perform the necessary operations. The view is throttled on a
    per-user basis to prevent abuse.

    Attributes:
        project_ad_file_service (ProjectADFileApplicationService): The service used for performing
        operations related to the Project XML
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .services import ProjectADFileApplicationService

        self.project_ad_file_service = ProjectADFileApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    @raise_exception(
        "An error occurred while retrieving project XML files.",
        exception_logger=logger,
    )
    @verify_get_params(key_list=["project_id"])
    def get(
        self,
        request: Request,
    ):
        project_xml = self.project_ad_file_service.get_files(
            data=request.GET,
            file_type=PROJECT_AD_FILE_TYPE_XML,
            as_response=True,
        )
        return Response(
            success(
                "Project XML files retrieved successfully.",
                {"project_xml": project_xml},
            ),
            status=status.HTTP_200_OK,
        )

    @raise_exception(
        "An error occurred while inserting project XML files.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def post(
        self,
        request: Request,
    ):
        """Inserts project XML files.

        This method inserts project XML files based on the provided data.
        It ensures that the request is authenticated and authorized to perform
        the insertion. It raises an exception if the insertion fails.

        Args:
            request (Request): The HTTP request object containing the data for
            inserting the project XML file.

        Returns:
            Response: An HTTP response object indicating the success of the
            insertion.

        Raises:
            Exception: If the insertion of the project XML file fails.
        """
        payload = self.project_ad_file_service.insert_files(
            data=request.data,
            files=request.FILES,
            file_type=PROJECT_AD_FILE_TYPE_XML,
        )
        return Response(
            success(
                "XML files successfully uploaded.",
                payload,
            ),
            status=status.HTTP_201_CREATED,
        )

    @raise_exception(
        "An error occurred while deleting project XML files.",
        exception_logger=logger,
    )
    @verify_data_params(key_list=["project_id"])
    def delete(
        self,
        request: Request,
    ):
        """Deletes project XML files.

        This method deletes project XML files based on the provided data.
        It ensures that the request is authenticated and authorized to perform
        the deletion. It raises an exception if the deletion fails.

        Args:
            request (Request): The HTTP request object containing the data for
            deleting the project XML files.

        Returns:
            Response: An HTTP response object indicating the success of the
            deletion.

        Raises:
            Exception: If the deletion of the project XML files fails.
        """
        retval = self.project_ad_file_service.delete_files(
            data=request.data,
            file_type=PROJECT_AD_FILE_TYPE_XML,
        )
        return Response(
            success(
                "XML file is deleted successfully.",
                retval,
            ),
            status=status.HTTP_200_OK,
        )
