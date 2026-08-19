from unittest.mock import MagicMock, patch

import pytest
from service.application.services import MasterADTemplateApplicationService

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.models.base_models import CanvasDataBaseModel
from shared_libs.models.database_models import MasterADTemplateModel
from shared_libs.producers.authentication_producer import AuthenticationProducer


def test_get_master_diagram_template_models():
    # Arrange
    service = MasterADTemplateApplicationService()
    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_auth_producer.authentication_model = MagicMock()
    mock_auth_producer.producer = MagicMock()
    mock_auth_producer.user_info = {"user_id": "test_user"}
    mock_permissions = ["perm1", "perm2"]

    mock_db_master_diagram_template = [
        {
            "templateId": "12345",
            "templateName": "test_template_name_1",
            "templateData": CanvasDataBaseModel(viewport={"x": 0, "y": 0, "zoom": 1}),
        },
        {
            "templateId": "67890",
            "templateName": "test_template_name_2",
            "templateData": CanvasDataBaseModel(viewport={"x": 1, "y": 1, "zoom": 2}),
        },
    ]

    with (
        patch.object(
            AuthorizationManager,
            "verify_standalone_authorization",
            return_value=True,
        ) as mock_verify_standalone_authorization,
        patch.object(
            service, "get_many", return_value=mock_db_master_diagram_template
        ) as mock_get_many,
    ):
        result = service.get_master_diagram_template_models(
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
        )

        # Assert
        assert result == [
            MasterADTemplateModel(**template_data)
            for template_data in mock_db_master_diagram_template
        ]

        mock_verify_standalone_authorization.assert_called_once_with()
        mock_get_many.assert_called_once_with()


# test exception for get_master_diagram_template_models:
def test_get_master_diagram_template_models_exception():
    # set up Mocks
    service = MasterADTemplateApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to retrieve master diagram template models.",
    ):
        service.get_master_diagram_template_models()
