from unittest.mock import MagicMock, patch

import pytest
from service.application.project_diagram.services import ProjectADApplicationService


def test_initialize_blank_canvas():
    # Mock data and dependencies
    mock_data = {"project_id": "1234"}
    mock_canvas_model = MagicMock()
    service = ProjectADApplicationService()

    # Patch methods and dependencies
    with (
        patch.object(
            service,
            "get_one",
            return_value={"project_id": mock_data["project_id"]},
        ) as mock_get_one,
        patch.object(
            service, "get_updated_canvas_model", return_value=mock_canvas_model
        ) as mock_get_updated_canvas_model,
        patch.object(
            service,
            "update_one",
        ) as mock_update_one,
        patch.object(
            service.db_log_ad_service,
            "update_one",
        ) as mock_db_log_update_one,
    ):
        # Call the method under test
        result = service.initialize_blank_canvas(
            data=mock_data,
        )

        # Assertions
        assert result["project_id"] == mock_data["project_id"]
        assert result["canvas"] == [canvas.model_dump() for canvas in mock_canvas_model]

        # Verify mock calls
        mock_get_one.assert_called_once()
        mock_get_updated_canvas_model.assert_called_once_with(
            diagram=None,
        )
        mock_update_one.assert_called_once()
        mock_db_log_update_one.assert_called_once()


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
