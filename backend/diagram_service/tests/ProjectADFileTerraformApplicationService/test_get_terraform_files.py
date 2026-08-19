from unittest.mock import MagicMock, patch

import pytest
from service.application.project_diagram.files.services import (
    ProjectADFileApplicationService,
)

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.producers.authentication_producer import AuthenticationProducer


def test_get_terraform_files():
    # Arrange
    service = ProjectADFileApplicationService()

    mock_data = {"project_id": "test_project_id"}
    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_auth_producer.authentication_model = MagicMock()
    mock_auth_producer.authentication_model.user = MagicMock()
    mock_auth_producer.producer = MagicMock()

    mock_terraform_files = [{"file_name": "main.tf", "content": "content"}]

    with (
        patch.object(
            AuthorizationManager,
            "verify_project_id",
            return_value=True,
        ) as mock_verify_project_id,
        patch.object(
            service,
            "get_many_files",
            return_value=mock_terraform_files,
        ) as mock_get_many_files,
    ):
        # Act
        result = service.get_terraform_files(
            data=mock_data,
            auth_producer=mock_auth_producer,
            permissions=[
                mock_auth_producer.permission_model.project_diagram_file_terraform.read
            ],
        )

    # Assert
    assert result == mock_terraform_files

    mock_verify_project_id.assert_called_once_with(project_id="test_project_id")
    mock_get_many_files.assert_called_once_with({"project_id": mock_data["project_id"]})


# test exception for get_terraform_files:
def test_get_terraform_files_exception():
    # set up Mocks
    service = ProjectADFileApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to retrieve terraform files.",
    ):
        service.get_terraform_files()
