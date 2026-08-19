from unittest.mock import MagicMock, patch

import pytest
from service.application.project_diagram.services import ProjectADApplicationService

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.models.database_models import ProjectADModel
from shared_libs.producers.authentication_producer import AuthenticationProducer


def test_get_project_ad_model():
    # Set up mocks
    service = ProjectADApplicationService()
    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_auth_producer.authentication_model = MagicMock()
    mock_auth_producer.producer = MagicMock()
    mock_auth_producer.user_info = {"user_id": "test_user"}
    mock_permissions = ["perm1", "perm2"]
    mock_data = {"project_id": "1234"}

    mock_db_project_ad = {
        "project_id": "1234",
        "schema_": "1.0.0",
        "sections": [
            {
                "section_id": "sec1",
                "content": "content1",
                "questions": [],
                "subsections": [],
                "sectionId": "sec1",
                "sectionName": "Section 1",
                "summary": {
                    "summary_id": "sum1",
                    "summary_content": "Summary content 1",
                    "footer": "Footer content 1",
                },
            },
            {
                "section_id": "sec2",
                "content": "content2",
                "questions": [],
                "subsections": [],
                "sectionId": "sec2",
                "sectionName": "Section 2",
                "summary": {
                    "summary_id": "sum2",
                    "summary_content": "Summary content 2",
                    "footer": "Footer content 2",
                },
            },
        ],
    }

    mock_project_ad_model = ProjectADModel(**mock_db_project_ad)

    # Patch methods
    with (
        patch.object(
            AuthorizationManager,
            "verify_project_id",
            return_value=True,
        ) as mock_verify_project_id,
        patch.object(
            service,
            "get_project_ad_model_from_database",
            return_value=mock_project_ad_model,
        ) as mock_get_project_ad_model_from_database,
    ):
        # Call the method under test
        result = service.get_project_ad_model(
            data=mock_data,
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
        )

        # Assertions
        assert result == mock_project_ad_model
        mock_verify_project_id.assert_called_once_with(
            project_id=mock_data["project_id"],
        )
        mock_get_project_ad_model_from_database.assert_called_once_with(
            project_id=mock_data["project_id"],
        )


# test exception for get_project_ad_model:
def test_get_project_ad_model_exception():
    # set up Mocks
    service = ProjectADApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to retrieve project ad model.",
    ):
        service.get_project_ad_model()
