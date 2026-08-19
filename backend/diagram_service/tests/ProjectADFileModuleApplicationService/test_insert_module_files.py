from unittest.mock import MagicMock, patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from service.application.project_diagram.files.services import (
    ProjectADFileApplicationService,
)

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.lib.file_manager import FileManager
from shared_libs.producers.authentication_producer import AuthenticationProducer


def test_insert_module_files_success():
    # Mock dependencies
    service = ProjectADFileApplicationService()

    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_auth_producer.authentication_model = MagicMock()
    mock_auth_producer.producer = MagicMock()
    mock_auth_producer.user_info = {"user_id": "test_user"}

    mock_permissions = ["permission_1", "permission_2"]
    mock_zip_content = b"This is a test zip file content"
    mock_zip_file = SimpleUploadedFile("test.zip", mock_zip_content)
    mock_files = {"zip_file": mock_zip_file}
    mock_data = {"project_id": "12345", "directory_name": "test_directory"}

    # Call the method under test
    with (
        patch.object(
            AuthorizationManager, "verify_project_id", return_value=True
        ) as mock_verify_project_id,
        patch.object(
            FileManager, "get_decoded_file", return_value="decoded content"
        ) as mock_get_decoded_file,
        patch.object(
            service, "insert_one_file", return_value=MagicMock()
        ) as mock_insert_one_file,
    ):
        result = service.insert_module_files(
            data=mock_data,
            files=mock_files,
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
        )

    # Assertions
    assert result == {"files": ["test_directory"]}

    mock_verify_project_id.assert_called_once_with(project_id=mock_data["project_id"])
    mock_get_decoded_file.assert_called_once_with(file=mock_zip_file)
    mock_insert_one_file.assert_called_once_with(
        query_dict={"project_id": "12345", "filename": "test_directory"},
        decoded_file="decoded content",
        user_info=mock_auth_producer.user_info,
    )


def test_insert_module_files_empty_decoded_file():
    # Mock dependencies
    service = ProjectADFileApplicationService()

    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_auth_producer.authentication_model = MagicMock()
    mock_auth_producer.producer = MagicMock()
    mock_auth_producer.user_info = {"user_id": "test_user"}

    mock_permissions = ["permission_1", "permission_2"]
    mock_zip_content = b"This is a test zip file content"
    mock_zip_file = SimpleUploadedFile("test.zip", mock_zip_content)
    mock_files = {"zip_file": mock_zip_file}
    mock_data = {"project_id": "12345", "directory_name": "test_directory"}
    mock_directory_name = mock_data["directory_name"]

    # Call the method under test
    with (
        patch.object(
            AuthorizationManager, "verify_project_id", return_value=True
        ) as mock_verify_project_id,
        patch.object(
            FileManager, "get_decoded_file", return_value=None
        ) as mock_get_decoded_file,
        patch.object(
            service, "insert_one_file", return_value=MagicMock()
        ) as mock_insert_one_file,
    ):
        with pytest.raises(BadRequest) as context:
            service.insert_module_files(
                data=mock_data,
                files=mock_files,
                auth_producer=mock_auth_producer,
                permissions=mock_permissions,
            )

    # Assertions
    assert str(context.value) == f"File {mock_directory_name} is empty."

    mock_verify_project_id.assert_called_once_with(project_id=mock_data["project_id"])
    mock_get_decoded_file.assert_called_once_with(file=mock_zip_file)
    mock_insert_one_file.assert_not_called()


# test exception for insert_module_files:
def test_insert_module_files_exception():
    # set up Mocks
    service = ProjectADFileApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to insert module files.",
    ):
        service.insert_module_files()
