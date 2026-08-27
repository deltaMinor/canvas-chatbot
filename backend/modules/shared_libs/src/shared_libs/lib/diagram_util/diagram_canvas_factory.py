import copy
import logging

from shared_libs.constants.diagram import BLANK_ARCHITECTURE_CANVAS
from shared_libs.decorators import raise_exception
from shared_libs.models.base_models import CanvasBaseModel

logger = logging.getLogger(__name__)


# Imported by services
class DiagramCanvasFactory:
    """
    A class used to manage and create diagram canvases.

    This class provides methods to load diagrams from JSON files, create new canvases from
    templates, and append new canvases to a list.

    Methods:
        get_architecture_canvas_model: Create a new architecture canvas.

    Raises:
        Exception: If any method fails, an exception is raised with a relevant message.
    """

    def __init__(self):
        """
        Constructs all the necessary attributes for the DiagramCanvasFactory object.
        """
        pass

    @raise_exception(
        "Failed to retrieve architecture canvas.",
        exception_logger=logger,
    )
    def get_architecture_canvas_model(
        self,
        diagram: dict,
    ) -> "CanvasBaseModel":
        """
        Retrieves the architecture canvas model.

        This method creates a new canvas with a unique ID. If a diagram is provided, it is copied to
        be used as the nodes, edges and viewport. If no diagram is provided, a blank canvas data is
        used.

        Args:
            diagram (dict): The diagram to be used as the canvas data. If None, a blank canvas data
            is used.

        Returns:
            CanvasBaseModel: An instance of CanvasBaseModel representing the new architecture
            canvas.

        Raises:
            Exception: If the architecture canvas model cannot be retrieved.
        """
        # Create a new canvas dictionary with default values
        new_canvas = copy.deepcopy(BLANK_ARCHITECTURE_CANVAS)

        # If a diagram is provided, set nodes and edges according to it
        if diagram is not None:
            new_canvas["nodes"] = diagram["nodes"]
            new_canvas["edges"] = diagram["edges"]
            new_canvas["viewport"] = diagram["viewport"]

        return CanvasBaseModel(**new_canvas)
