import copy
import logging
from typing import Any

from shared_libs.constants.diagram import BLANK_ARCHITECTURE_CANVAS
from shared_libs.decorators import raise_exception
from shared_libs.models.base_models import CanvasBaseModel
from shared_libs.types.enum import CardFieldId

logger = logging.getLogger(__name__)


# Imported by services
class DiagramCanvasFactory:
    """
    A class used to manage and create diagram canvases.

    This class provides methods to load diagrams from JSON files and create new
    canvases from templates.

    Methods:
        get_architecture_canvas_model: Create a new architecture canvas.
        update_card_ref: Update card ref of a canvas view.

    Raises:
        Exception: If any method fails, an exception is raised with a relevant message.
    """

    def __init__(self):
        """
        Constructs all the necessary attributes for the DiagramCanvasFactory object.
        """
        pass

    @raise_exception(
        "Failed to update card ref.",
        exception_logger=logger,
    )
    def update_card_ref(
        self,
        card_ref: dict[str, Any],
        card_nodes: list[dict[str, Any]],
    ):
        """
        Update card ref with the card nodes.

        Args:
            card_ref (dict[str, Any]): A dictionary contains data of the user story card
            card_nodes (List[dict[str, Any]]): A list of card node dictionary
        """
        card_id = card_ref.get("card_id")
        card_ref_key_list = [
            CardFieldId.card_data.name,
            CardFieldId.card_devices.name,
            CardFieldId.card_users.name,
            CardFieldId.card_interface.name,
        ]
        for card_ref_key in card_ref_key_list:
            # Initialize an empty list to store card_node objects
            card_ref_object_list = []
            for card_node in card_nodes:
                # If the ref key is in the card_ref_key_list and card id is in the card id
                # affiliation, store the card node object into a list
                if card_node.get(
                    "ref_key"
                ) == card_ref_key and card_id in card_node.get(
                    "card_id_affliations", []
                ):
                    card_ref_object_list.append(card_node)
            if len(card_ref_object_list) == 0:
                continue
            card_ref[card_ref_key] = card_ref_object_list

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
