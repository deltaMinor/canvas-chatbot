from unittest.mock import MagicMock, patch

import pytest
from service.application.project_diagram.services import ProjectADApplicationService

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.producers.authentication_producer import AuthenticationProducer


def test_initialize_architecture_canvas_from_template():

    # Arrange
    service = ProjectADApplicationService()

    mock_data = {"project_id": "123", "templateId": "456"}
    mock_project_id = mock_data.get("project_id")
    mock_template_id = mock_data.get("templateId")

    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_auth_producer.authentication_model = MagicMock()
    mock_auth_producer.producer = MagicMock()
    mock_auth_producer.user_info = {"user_id": "test_user"}
    mock_permissions = ["perm1", "perm2"]

    mock_db_project_cq = {
        "project_id": "1",
        "schema_": "1.0.0",
        "sections": [],
        "values": {},
    }
    mock_project_ad_model = MagicMock()
    mock_ad_template_model = MagicMock()

    mock_card_nodes = []

    mock_canvas_model = MagicMock()

    with (
        patch.object(
            AuthorizationManager, "verify_project_id", return_value=True
        ) as mock_verify_project_id,
        patch.object(
            service.project_cq_service,
            "get_one",
            return_value=mock_db_project_cq,
        ) as mock_project_cq_service_get_one,
        patch.object(
            service,
            "get_project_ad_model_from_database",
            return_value=mock_project_ad_model,
        ) as mock_get_project_ad_model_from_database,
        patch.object(
            service,
            "get_ad_template_model_from_database",
            return_value=mock_ad_template_model,
        ) as mock_get_ad_template_model_from_database,
        patch.object(
            service, "get_updated_canvas_model", return_value=mock_canvas_model
        ) as mock_get_updated_canvas_model,
        patch.object(service, "update_one") as mock_update_one,
    ):
        # Act
        result = service.initialize_architecture_canvas_from_template(
            data=mock_data,
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
        )

    # Assert
    assert result == {
        "project_id": mock_project_id,
        "card_nodes": mock_card_nodes,
        "canvas": [canvas.model_dump() for canvas in mock_canvas_model],
    }
    mock_verify_project_id.assert_called_once_with(project_id=mock_project_id)
    mock_project_cq_service_get_one.assert_called_once_with(
        {"project_id": mock_project_id}, raise_if_not_found=True
    )
    mock_get_project_ad_model_from_database.assert_called_once_with(mock_project_id)

    mock_get_ad_template_model_from_database.assert_called_once_with(
        template_id=mock_template_id
    )

    mock_get_updated_canvas_model.assert_called_once()
    mock_update_one.assert_called_once_with(
        {"project_id": mock_project_id},
        payload={
            "project_id": mock_project_id,
            "card_nodes": mock_card_nodes,
            "canvas": [canvas.model_dump() for canvas in mock_canvas_model],
        },
        user_info=mock_auth_producer.user_info,
        upsert=True,
    )


# test exception for initialize_architecture_canvas_from_template:
def test_initialize_architecture_canvas_from_template_exception():
    # set up Mocks
    service = ProjectADApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to initialize canvas from template.",
    ):
        service.initialize_architecture_canvas_from_template()
