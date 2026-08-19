from unittest.mock import MagicMock, patch

import pytest
from service.application.project_diagram.files.services import (
    ProjectADFileApplicationService,
)

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.producers.authentication_producer import AuthenticationProducer


def test_delete_cacti():
    # Arrange
    service = ProjectADFileApplicationService()

    mock_data = {"project_id": "123"}
    mock_project_id = mock_data.get("project_id")

    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_auth_producer.authentication_model = MagicMock()
    mock_auth_producer.producer = MagicMock()
    mock_auth_producer.user_info = {"user_id": "test_user"}
    mock_permissions = ["perm1", "perm2"]
    with (
        patch.object(
            AuthorizationManager, "verify_project_id", return_value=True
        ) as mock_verify_project_id,
        patch.object(
            service, "delete_many", return_value={"deleted_count": 1}
        ) as mock_delete_many,
    ):
        result = service.delete_cacti(
            data=mock_data,
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
        )

        # Assert
        assert result == {"deleted_count": 1}

        mock_verify_project_id.assert_called_once_with(project_id=mock_project_id)
        mock_delete_many.assert_called_once_with({"project_id": mock_project_id})


# test exception for delete_cacti:
def test_delete_cacti_exception():
    # set up Mocks
    service = ProjectADFileApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to delete CACTi file.",
    ):
        service.delete_cacti()
