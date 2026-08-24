import copy
import logging
import uuid
from typing import Any

from shared_libs.constants.diagram import BLANK_ARCHITECTURE_CANVAS
from shared_libs.decorators import raise_exception
from shared_libs.models.base_models import CanvasBaseModel
from shared_libs.types.enum import CanvasType, CardFieldId

logger = logging.getLogger(__name__)


# Imported by services
class DiagramCanvasFactory:
    """
    A class used to manage and create diagram canvases.

    This class provides methods to load diagrams from JSON files, create new canvases from
    templates, append new canvases to a list, and create new data flow canvases.

    Methods:
        create_new_data_flow_canvas: Create a new data flow canvas from a user story card.
        get_architecture_canvas_model: Create a new architecture canvas.
        get_data_flow_canvas_models: Create a new data flow canvas view.
        update_card_ref: Update card ref of data flow canvas view.

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
        "Failed to create new data flow canvas.",
        exception_logger=logger,
    )
    def create_new_data_flow_canvas(
        self,
        card: dict,
        card_nodes: list[dict[str, Any]],
    ) -> dict:
        """
        Create a new data flow canvas from a user story card.

        This method generates a new data flow canvas with a unique ID, the name of the canvas set to
        the card title, and a reference to the card. The edge and node list are initialised to
        be empty array. The viewport is set to be default.

        Args:
            card (dict): The user story card, a dictionary containing card details.
            card_nodes (List[dict]): A list of card node dictionary

        Returns:
            dict: A dictionary representing the new data flow canvas. The dictionary includes
            the canvas name, ID, type, node list, edge list, viewport and a reference to the card.
        """
        card_ref = {}
        card_id = card.get("card_id")
        card_ref["card_id"] = card_id
        for field in CardFieldId:
            card_ref[field.name] = card.get(field.value)

        self.update_card_ref(card_ref, card_nodes)

        return {
            "canvas_id": f"canvas_{uuid.uuid4()}",
            "canvas_name": card.get(CardFieldId.card_title.value),
            "canvas_type": CanvasType.data_flow.value,
            "edges": [],
            "nodes": [],
            "ref": {
                "card_ref": card_ref,
            },
            "viewport": {"x": 0, "y": 0, "zoom": 1},
        }

    @raise_exception(
        "Failed to append data flow canvas.",
        exception_logger=logger,
    )
    def get_data_flow_canvas_models(
        self,
        card_nodes: list[dict[str, Any]],
        user_story_cards: list[dict],
    ) -> list["CanvasBaseModel"]:
        """
        Generates a list of data flow canvas models based on user story cards.

        This method creates a new data flow canvas for each user story card. The new canvases are
        then appended to a list which is returned.

        Args:
            card_nodes (List[dict[str, Any]]): A list of card node dictionary
            user_story_cards (List[dict]): A list of user story cards.

        Raises:
            Exception: If an error occurs while appending data flow canvas views.

        Returns:
            List[CanvasBaseModel]: A list of data flow canvas models.
        """
        canvas_models = []

        try:
            # If no cards are provided, exit the function
            if not user_story_cards:
                return canvas_models
            # For each card, create a new data flow canvas and append it to the canvas list
            for card in user_story_cards:
                new_canvas = self.create_new_data_flow_canvas(card, card_nodes)
                canvas_models.append(CanvasBaseModel(**new_canvas))
            return canvas_models
        except Exception as error:
            # Log a warning if an exception occurs
            logger.warning("Failed to append data flow canvas: %s", error)
        return canvas_models

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
