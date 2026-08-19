from unittest.mock import MagicMock, patch

import pytest
from service.application.project_diagram.files.services import (
    ProjectADFileApplicationService,
)

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.producers.authentication_producer import AuthenticationProducer


def test_delete_terraform_files():
    # Arrange
    service = ProjectADFileApplicationService()

    mock_data = {"project_id": "123", "filenames": ["file1.tf", "file2.tf"]}
    mock_project_id = mock_data.get("project_id")
    # mock_filenames = mock_data.get("filenames")

    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_auth_producer.authentication_model = MagicMock()
    mock_auth_producer.producer = MagicMock()
    mock_auth_producer.user_info = {"user_id": "test_user"}

    mock_permissions = ["perm1", "perm2"]

    with (
        patch.object(
            AuthorizationManager, "verify_project_id", return_value=True
        ) as mock_verify_project_id,
        patch.object(service, "delete_many_files") as mock_delete_many_files,
    ):
        # Act
        result = service.delete_terraform_files(
            data=mock_data,
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
        )

        # Assert
        assert mock_delete_many_files.call_count == 2
        assert result == {"files": ["file1.tf", "file2.tf"]}

        mock_verify_project_id.assert_called_once_with(project_id=mock_project_id)
        mock_delete_many_files.assert_any_call(
            query_dict={"project_id": mock_project_id, "filename": "file1.tf"}
        )
        mock_delete_many_files.assert_any_call(
            query_dict={"project_id": mock_project_id, "filename": "file2.tf"}
        )


def test_delete_terraform_files_no_filenames():
    # Arrange
    service = ProjectADFileApplicationService()

    mock_data = {"project_id": "123", "filenames": []}
    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_permissions = ["perm1", "perm2"]

    # Act & Assert

    with pytest.raises(
        BadRequest,
        match="Files are undefined.",
    ):
        service.delete_terraform_files(
            data=mock_data,
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
        )


# test exception for delete_terraform_files:
def test_delete_terraform_files_exception():
    # set up Mocks
    service = ProjectADFileApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to delete Terraform files.",
    ):
        service.delete_terraform_files()
