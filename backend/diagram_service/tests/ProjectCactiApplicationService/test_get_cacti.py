from unittest.mock import MagicMock, patch

import pytest
from service.application.project_diagram.files.services import (
    ProjectADFileApplicationService,
)

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.producers.authentication_producer import AuthenticationProducer


def test_get_cacti():
    # Arrange
    service = ProjectADFileApplicationService()

    mock_data = {"project_id": "123"}
    mock_project_id = mock_data.get("project_id")
    mock_cacti_files = {"files": ["file1.tf", "file2.tf"]}
    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_auth_producer.authentication_model = MagicMock()
    mock_auth_producer.producer = MagicMock()
    mock_auth_producer.user_info = {"user_id": "test_user"}
    mock_permissions = ["perm1", "perm2"]

    with (
        patch.object(
            AuthorizationManager, "verify_project_id", return_value=True
        ) as mock_verify_project_id,
        patch.object(service, "get_one", return_value=mock_cacti_files) as mock_get_one,
    ):
        result = service.get_cacti(
            data=mock_data,
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
        )

        # Assert
        assert result == mock_cacti_files
        mock_verify_project_id.assert_called_once_with(project_id=mock_project_id)
        mock_get_one.assert_called_once_with({"project_id": mock_project_id})


# test exception for get_cacti:
def test_get_cacti_exception():
    # set up Mocks
    service = ProjectADFileApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to retrieve CACTi.",
    ):
        service.get_cacti()
