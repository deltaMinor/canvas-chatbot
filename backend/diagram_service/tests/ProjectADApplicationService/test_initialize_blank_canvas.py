from unittest.mock import MagicMock, patch

import pytest
from service.application.project_diagram.services import ProjectADApplicationService

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.lib.diagram_util.card_node_builder import CardNodeBuilder
from shared_libs.models.database_models import ProjectADModel
from shared_libs.producers.authentication_producer import AuthenticationProducer


def test_initialize_blank_canvas():
    # Mock data and dependencies
    mock_data = {"project_id": "1234"}
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

    mock_project_ad_model = ProjectADModel(
        project_id="123456789", canvas=[], card_nodes=[]
    )
    mock_card_node_builder = CardNodeBuilder(
        values={},
        project_ad_model=mock_project_ad_model,
    )
    mock_user_story_cards = mock_card_node_builder.user_story_cards
    mock_card_nodes = mock_card_node_builder.card_nodes
    mock_canvas_model = MagicMock()
    service = ProjectADApplicationService()

    # Patch methods and dependencies
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
            service, "get_updated_canvas_model", return_value=mock_canvas_model
        ) as mock_get_updated_canvas_model,
        patch.object(
            service,
            "update_one",
        ) as mock_update_one,
    ):
        # Call the method under test
        result = service.initialize_blank_canvas(
            data=mock_data,
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
        )

        # Assertions
        assert result["project_id"] == mock_data["project_id"]
        assert result["card_nodes"] == mock_card_nodes
        assert result["canvas"] == [canvas.model_dump() for canvas in mock_canvas_model]

        assert isinstance(result["card_nodes"], list)

        # Verify mock calls
        mock_verify_project_id.assert_called_once_with(
            project_id=mock_data["project_id"]
        )
        mock_project_cq_service_get_one.assert_called_once_with(
            {"project_id": mock_data["project_id"]},
            raise_if_not_found=True,
        )
        mock_get_project_ad_model_from_database.assert_called_once_with(
            mock_data["project_id"]
        )
        mock_get_updated_canvas_model.assert_called_once_with(
            card_nodes=mock_card_nodes,
            diagram=None,
            user_story_cards=mock_user_story_cards,
        )
        mock_update_one.assert_called_once_with(
            {"project_id": mock_data["project_id"]},
            payload={
                "project_id": mock_data["project_id"],
                "card_nodes": mock_card_nodes,
                "canvas": [canvas.model_dump() for canvas in mock_canvas_model],
            },
            user_info=mock_auth_producer.user_info,
            upsert=True,
        )


# test exception for initialize_blank_canvas:
def test_initialize_blank_canvas_exception():
    # set up Mocks
    service = ProjectADApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to initialize blank canvas.",
    ):
        service.initialize_blank_canvas()
