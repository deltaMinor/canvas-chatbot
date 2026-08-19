import pytest
from service.application.project_diagram.services import ProjectADApplicationService


def test_initialize_architecture_canvas_from_files_exception():
    # set up Mocks
    service = ProjectADApplicationService()

    # Assert that calling the method raises an exception
    with pytest.raises(
        Exception,
        match="Failed to initialize canvas from files.",
    ):
        service.initialize_architecture_canvas_from_files()
