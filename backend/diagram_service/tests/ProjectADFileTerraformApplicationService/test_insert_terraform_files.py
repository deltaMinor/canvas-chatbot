import logging
from unittest.mock import MagicMock, patch

import pytest
from django.core.files.uploadedfile import UploadedFile
from django.utils.datastructures import MultiValueDict
from service.application.project_diagram.files.services import (
    ProjectADFileApplicationService,
)

from shared_libs.authorization.authorization_manager import AuthorizationManager
from shared_libs.lib.file_manager import FileManager
from shared_libs.producers.authentication_producer import AuthenticationProducer

logger = logging.getLogger(__name__)


def test_insert_terraform_files():
    # Arrange
    service = ProjectADFileApplicationService()

    mock_data = {"project_id": "123"}
    mock_project_id = mock_data.get("project_id")

    mock_file1 = MagicMock(spec=UploadedFile)
    mock_file1.name = "file1.tf"
    mock_file2 = MagicMock(spec=UploadedFile)
    mock_file2.name = "file2.tf"

    mock_files = MultiValueDict({"file": [mock_file1, mock_file2]})
    mock_auth_producer = MagicMock(spec=AuthenticationProducer)
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
            FileManager, "get_decoded_file", side_effect=["decoded_file1", None]
        ) as mock_get_decoded_file,
        patch.object(service, "insert_one_file") as mock_insert_one_file,
        patch.object(logger, "warn") as mock_warn,
    ):
        # Act
        result = service.insert_terraform_files(
            data=mock_data,
            files=mock_files,
            auth_producer=mock_auth_producer,
            permissions=mock_permissions,
        )

        # Assert
        assert mock_get_decoded_file.call_count == 2
        assert (
            mock_insert_one_file.call_count == 1
        )  # Only one valid file insertion which is file1.tf
        assert result == {"files": ["file1.tf", "file2.tf"]}

        mock_warn.assert_called_once_with(
            "File %s is empty.", "file2.tf"
        )  # Warning logger for the empty file
        mock_verify_project_id.assert_called_once_with(project_id=mock_project_id)
        mock_get_decoded_file.assert_any_call(file=mock_file1)
        mock_get_decoded_file.assert_any_call(file=mock_file2)
        mock_insert_one_file.assert_any_call(
            query_dict={"project_id": "123", "filename": "file1.tf"},
            decoded_file="decoded_file1",
            user_info={"user_id": "test_user"},
        )


# test exception for insert_terraform_files:
def test_insert_terraform_files_exception():
    # set up Mocks
    service = ProjectADFileApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to insert Terraform files.",
    ):
        service.insert_terraform_files()
