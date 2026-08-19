import json
from datetime import datetime, timezone
from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest
from django.core.files.uploadedfile import UploadedFile
from service.application.project_diagram.files.services import (
    ProjectADFileApplicationService,
)

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.producers.authentication_producer import AuthenticationProducer


def test_insert_cacti():
    service = ProjectADFileApplicationService()

    # Mock data and dependencies
    mock_project_id = "1234"
    mock_file_content = '{"key": "value"}'
    mock_file_name = "mock_cacti.json"
    mock_cacti_file_in_memory = UploadedFile(
        file=BytesIO(mock_file_content.encode("utf-8")), name=mock_file_name
    )
    mock_data = {
        "project_id": mock_project_id,
        "file": mock_cacti_file_in_memory,
    }
    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
    mock_auth_producer.authentication_model = MagicMock()
    mock_auth_producer.producer = MagicMock()
    mock_auth_producer.user_info = {"user_id": "test_user"}
    mock_permissions = ["perm1", "perm2"]

    expected_cacti_data = json.loads(mock_file_content)

    # Patch methods and dependencies
    with (
        patch.object(
            AuthorizationManager, "verify_project_id", return_value=True
        ) as mock_verify_project_id,
        patch(
            "service.application.project_diagram.files.services.project_ad_file.token_urlsafe",
            return_value="mock_token",
        ) as mock_token_urlsafe,
        patch(
            "service.application.project_diagram.files.services.project_ad_file.datetime.datetime"
        ) as mock_datetime,
        patch.object(service, "update_one") as mock_update_one,
    ):
        # Set the mock datetime to return a specific datetime
        mock_now = datetime(2024, 1, 1, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now

        # Call the method under test
        result = service.insert_cacti(
            data=mock_data,
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
        )

        # Assertions
        assert result["project_id"] == mock_project_id
        assert result["data"] == expected_cacti_data
        assert result["doc_version"] == "cacti_mock_token"
        assert result["filename"] == mock_file_name
        assert result["uploadDate"] == str(mock_now)

        # Verify mock calls
        mock_verify_project_id.assert_called_once_with(project_id=mock_project_id)
        mock_token_urlsafe.assert_called_once()
        mock_update_one.assert_called_once_with(
            {"project_id": mock_project_id},
            payload={
                "project_id": mock_project_id,
                "data": expected_cacti_data,
                "doc_version": "cacti_mock_token",
                "filename": mock_file_name,
                "uploadDate": str(mock_now),
            },
            user_info=mock_auth_producer.user_info,
            upsert=True,
        )


# test exception for insert_cacti:
def test_insert_cacti_exception():
    # set up Mocks
    service = ProjectADFileApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to insert CACTi to database",
    ):
        service.insert_cacti()
