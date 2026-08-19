from unittest.mock import MagicMock, patch

import pytest
from service.application.project_diagram.services import ProjectADApplicationService

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.producers.authentication_producer import AuthenticationProducer


def test_update_project_ad():
    # Mock data and dependencies
    mock_data = {
        "project_id": "1234",
        "canvas": [
            {
                "viewport": {
                    "width": 1000,
                    "height": 800,
                    "x": 0,
                    "y": 0,
                    "zoom": 1.0,
                },
                "canvas_id": "canvas123",
                "canvas_name": "example_canvas_name",
                "canvas_type": "example_canvas_type",
                "ref": {"key": "value"},
            }
        ],
        "card_nodes": [
            {
                "label": "example_label",
                "ref_key": "example_ref_key",
                "value": "example_value",
                "example_node_field": "example_node_value",
            }
        ],
    }
    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_auth_producer.authentication_model = MagicMock()
    mock_auth_producer.producer = MagicMock()
    mock_auth_producer.user_info = {"user_id": "test_user"}
    mock_permissions = ["perm1", "perm2"]

    mock_reserved_keys = ["reserved_key1", "reserved_key2"]

    service = ProjectADApplicationService()

    # Patch methods and dependencies
    with (
        patch.object(
            AuthorizationManager, "verify_project_id", return_value=True
        ) as mock_verify_project_id,
        patch.object(service, "update_one") as mock_update_one,
    ):
        # Call the method under test
        result = service.update_project_ad(
            data=mock_data,
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
            reserved_keys=mock_reserved_keys,
        )

        # Assertions
        assert result["project_id"] == "1234"
        assert result["canvas"] == [
            {
                "edges": [],
                "nodes": [],
                "viewport": {"x": 0.0, "y": 0.0, "zoom": 1.0},
                "canvas_id": "canvas123",
                "canvas_name": "example_canvas_name",
                "canvas_type": "example_canvas_type",
                "ref": {"key": "value"},
                "view_only": False,
                "warnings": [],
            }
        ]
        assert result["card_nodes"] == [
            {
                "label": "example_label",
                "node_id": None,
                "ref_key": "example_ref_key",
                "value": "example_value",
                "card_id_affliations": [],
            }
        ]
        assert "reserved_key1" not in result
        assert "reserved_key2" not in result
        mock_verify_project_id.assert_called_once_with(
            project_id=mock_data["project_id"]
        )
        mock_update_one.assert_called_once_with(
            {"project_id": "1234"},
            payload={
                "project_id": "1234",
                "canvas": [
                    {
                        "edges": [],
                        "nodes": [],
                        "viewport": {"x": 0.0, "y": 0.0, "zoom": 1.0},
                        "canvas_id": "canvas123",
                        "canvas_name": "example_canvas_name",
                        "canvas_type": "example_canvas_type",
                        "ref": {"key": "value"},
                        "view_only": False,
                        "warnings": [],
                    }
                ],
                "card_nodes": [
                    {
                        "label": "example_label",
                        "node_id": None,
                        "ref_key": "example_ref_key",
                        "value": "example_value",
                        "card_id_affliations": [],
                    }
                ],
            },
            user_info=mock_auth_producer.user_info,
        )


# test exception for update_project_ad:
def test_update_project_ad_exception():
    # set up Mocks
    service = ProjectADApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to update project ad model.",
    ):
        service.update_project_ad()
