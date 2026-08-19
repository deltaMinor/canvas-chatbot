import logging
import uuid
from functools import cached_property
from typing import Any

from shared_libs.decorators import raise_exception
from shared_libs.models.database_models import ProjectADModel
from shared_libs.types.enum import CardFieldId, CQFieldId

logger = logging.getLogger(__name__)


class CardNodeBuilder:
    def __init__(
        self,
        values: dict,
        project_ad_model: ProjectADModel,
    ):
        self.card_nodes = []
        self.values = values
        self.project_ad_model = project_ad_model
        self.update_card_nodes()

    @cached_property
    def user_story_cards(self):
        return self.values.get(CQFieldId.user_story_card.value, [])

    @raise_exception(
        "Failed to update card nodes.",
        exception_logger=logger,
    )
    def update_card_nodes(self):
        for card in self.user_story_cards:
            self.append_card_nodes(
                card_ref=self.get_card_ref_dict(card),
            )
        self.replace_node_id_with_preexisting()

    @raise_exception(
        "Failed to check if existing node exists.",
        exception_logger=logger,
    )
    def check_if_node_exists(
        self,
        card_id: str,
        selectable_value: dict,
    ):
        for card_node in self.card_nodes:
            if (
                card_node["label"] == selectable_value["label"]
                and card_node["value"] == selectable_value["value"]
            ):
                card_node["card_id_affliations"].append(card_id)
                return True
        return False

    @raise_exception(
        "Failed to append card nodes from selectable value list.",
        exception_logger=logger,
    )
    def append_card_nodes_from_selectable_value_list(
        self,
        card_id: str,
        ref_key: str,
        selectable_value_list: list[dict],
    ):
        for selectable_value in selectable_value_list:
            # There exist a card node with same label and value as the selectable_value, append the
            # card id to the card id affliation list
            if not selectable_value or self.check_if_node_exists(
                card_id=card_id,
                selectable_value=selectable_value,
            ):
                continue
            # There is no card node with same label and value, create a new card node
            # If it is an interface node, no id is required
            new_node = {**selectable_value}
            if ref_key != CardFieldId.card_interface.name:
                new_node["node_id"] = f"node_{uuid.uuid4()}"
            new_node["ref_key"] = ref_key
            new_node["card_id_affliations"] = [card_id]
            self.card_nodes.append(new_node)

    @raise_exception(
        "Failed to append card nodes from card ref.",
        exception_logger=logger,
    )
    def append_card_nodes(
        self,
        card_ref: dict,
    ):
        if not card_ref:
            return

        card_id = card_ref["card_id"]

        self.append_card_nodes_from_selectable_value_list(
            card_id=card_id,
            ref_key="card_users",
            selectable_value_list=card_ref["card_users"],
        )

        self.append_card_nodes_from_selectable_value_list(
            card_id=card_id,
            ref_key="card_devices",
            selectable_value_list=card_ref["card_devices"],
        )

        self.append_card_nodes_from_selectable_value_list(
            card_id=card_id,
            ref_key="card_interface",
            selectable_value_list=card_ref["card_interface"],
        )

        self.append_card_nodes_from_selectable_value_list(
            card_id=card_id,
            ref_key="card_data",
            selectable_value_list=card_ref["card_data"],
        )

    @staticmethod
    @raise_exception(
        "Failed to get card value in list type.",
        exception_logger=logger,
    )
    def get_card_value_in_list_type(project_cq_card: dict, fieldId: str):
        value = project_cq_card.get(fieldId)
        if isinstance(value, list):
            return value
        return [value]

    @classmethod
    @raise_exception(
        "Failed to retrieve card ref dict.",
        exception_logger=logger,
    )
    def get_card_ref_dict(cls, project_cq_card: dict):
        card_users = cls.get_card_value_in_list_type(
            project_cq_card,
            CardFieldId.card_users.value,
        )
        card_devices = cls.get_card_value_in_list_type(
            project_cq_card,
            CardFieldId.card_devices.value,
        )
        card_interface = cls.get_card_value_in_list_type(
            project_cq_card,
            CardFieldId.card_interface.value,
        )
        card_data = cls.get_card_value_in_list_type(
            project_cq_card,
            CardFieldId.card_data.value,
        )
        return {
            "card_id": project_cq_card.get("card_id"),
            "card_data": card_data,
            "card_devices": card_devices,
            "card_feature": project_cq_card.get(CardFieldId.card_feature.value),
            "card_intent": project_cq_card.get(CardFieldId.card_intent.value),
            "card_outcome": project_cq_card.get(CardFieldId.card_outcome.value),
            "card_title": project_cq_card.get(CardFieldId.card_title.value),
            "card_users": card_users,
            "card_interface": card_interface,
        }

    @raise_exception(
        "Failed to update pre-existing node id.",
        exception_logger=logger,
    )
    def replace_node_id_with_preexisting(
        self,
    ) -> list[Any]:
        # Create a dictionary to store original card_nodes
        original_card_nodes = {
            (card_node.label, card_node.value): card_node.node_id
            for card_node in self.project_ad_model.card_nodes
        }

        for card_node in self.card_nodes:
            # Check if there is a matching card_node in original_card_nodes
            key = (card_node["label"], card_node["value"])
            if key in original_card_nodes:
                card_node["node_id"] = original_card_nodes[key]
