from unittest.mock import MagicMock, patch

import pytest
from service.application.project_diagram.services import ProjectADApplicationService
from service.lib.diagram_cacti_optimizer.diagram_cacti_optimizer import (
    DiagramCactiOptimizer,
)
from service.lib.diagram_generator_from_cacti.diagram_generator_from_cacti import (
    DiagramGeneratorFromCacti,
)

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.producers.authentication_producer import AuthenticationProducer


def test_initialize_architecture_canvas_from_cacti():

    # Arrange
    service = ProjectADApplicationService()

    mock_data = {"project_id": "123", "selected_cacti_file_id": "cacti_1"}
    mock_project_id = mock_data.get("project_id")

    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_auth_producer.authentication_model = MagicMock()
    mock_auth_producer.producer = MagicMock()
    mock_auth_producer.user_info = {"user_id": "test_user"}
    mock_permissions = ["perm1", "perm2"]

    mock_project_ad_model = MagicMock()

    mock_cacti_file = {
        "file_id": "cacti_1",
        "data": "eyJub2RlcyI6IFt7ImlkIjogIm4xIn1dLCAiZWRnZXMiOiBbeyJpZCI6ICJlMSJ9XX0=",
    }

    mock_diagram = {"nodes": [{"id": "n1"}], "edges": [{"id": "e1"}]}

    mock_canvas_model = MagicMock()

    with (
        patch.object(
            AuthorizationManager, "verify_project_id", return_value=True
        ) as mock_verify_project_id,
        patch.object(
            service,
            "get_project_ad_model_from_database",
            return_value=mock_project_ad_model,
        ) as mock_get_project_ad_model_from_database,
        patch.object(
            service.project_ad_file_service,
            "get_many_files",
            return_value=[mock_cacti_file],
        ) as mock_project_ad_file_service_get_many_files,
        patch.object(
            DiagramGeneratorFromCacti,
            "get_generated_diagram",
            return_value=mock_diagram,
        ) as mock_get_generated_diagram,
        patch.object(
            DiagramCactiOptimizer,
            "assign_positions",
            return_value=mock_diagram,
        ) as mock_assign_positions,
        patch.object(
            service, "get_updated_canvas_model", return_value=mock_canvas_model
        ) as mock_get_updated_canvas_model,
        patch.object(service, "update_one") as mock_update_one,
    ):
        # Act
        result = service.initialize_architecture_canvas_from_cacti(
            data=mock_data,
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
        )

    # Assert
    assert result == {
        "project_id": mock_project_id,
        "canvas": [canvas.model_dump() for canvas in mock_canvas_model],
    }
    mock_verify_project_id.assert_called_once_with(project_id=mock_project_id)
    mock_get_project_ad_model_from_database.assert_called_once_with(mock_project_id)
    mock_project_ad_file_service_get_many_files.assert_called_once_with(
        {
            "project_id": mock_project_id,
            "file_type": "cacti",
        }
    )
    mock_get_generated_diagram.assert_called_once()
    mock_assign_positions.assert_called_once()
    mock_get_updated_canvas_model.assert_called_once()
    mock_update_one.assert_called_once_with(
        {"project_id": mock_project_id},
        payload={
            "project_id": mock_project_id,
            "canvas": [canvas.model_dump() for canvas in mock_canvas_model],
        },
        user_info=mock_auth_producer.user_info,
        upsert=True,
    )


# test exception for initialize_architecture_canvas_from_cacti:
def test_initialize_architecture_canvas_from_cacti_exception():
    # set up Mocks
    service = ProjectADApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to initialize canvas from CACTi.",
    ):
        service.initialize_architecture_canvas_from_cacti()
