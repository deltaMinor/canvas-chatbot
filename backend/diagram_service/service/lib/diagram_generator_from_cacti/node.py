from __future__ import annotations

from secrets import token_urlsafe

from shared_libs.constants.diagram import (
    DEFAULT_BLUE,
    DEFAULT_GREEN,
    DEFAULT_ICON_NODE_HEIGHT,
    DEFAULT_ICON_NODE_WIDTH,
    DEFAULT_RED,
    MAX_LABEL_LENGTH,
)
from shared_libs.types.enum import Position

from .react_flow.nodes import (
    CLUSTER_NODES,
    COLOURED_NODES,
    ICON_MAPPING,
    NODE_BORDERS,
    NODE_COLOURS,
    NODES_INSIDE_AZ,
    TerraformTypes,
)


class CactiNode:
    def __init__(
        self,
        json_data: dict,
        terraform_type: str = None,
        parent_node: CactiNode = None,
        is_az: bool = False,
        ae_version: bool = False,
    ):
        """
        stores data regarding a CACTi node, references to any of its children
        """
        if ae_version:
            self.id = (
                json_data.get("properties", {}).get("resource_id")
                or f"node_{token_urlsafe()}"
            )
            self.attributes = {
                key: (
                    str(value)
                    if (
                        isinstance(value, dict)
                        or (
                            isinstance(value, list)
                            and any(isinstance(item, dict) for item in value)
                        )
                    )
                    else value
                )
                for key, value in json_data.get("properties", {}).items()
                if key != "resource_id"
            }
        else:
            # Backwards compatibility for non-AE version
            self.id = json_data.get("id") or f"node_{token_urlsafe()}"
            self.attributes = {
                key: (
                    str(value)
                    if (
                        isinstance(value, dict)
                        or (
                            isinstance(value, list)
                            and any(isinstance(item, dict) for item in value)
                        )
                    )
                    else value
                )
                for key, value in json_data.get("attributes", {}).items()
            }
        self.terraform_type = terraform_type or ""
        self.is_cluster_node = terraform_type in CLUSTER_NODES or is_az
        self.parent_node = parent_node
        self.is_az = is_az
        self.color = None
        self.availability_zone = None
        self.label = None
        self.private_subnet = True

        self.set_colour()
        self.set_label()
        self.set_availability_zone()

    def has_parent(self):
        """
        check whether a node has a parent
        Returns:
            true if parent node exists
        """
        return self.parent_node is not None

    def get_parent(self):
        """
        retrieve parent node of this node

        Returns:
            parent CactiNode if it exists
        """
        if self.has_parent():
            return self.parent_node

    def get_grand_parent(self):
        """
        retrieve parent node of parent node

        Returns:
            parent's parent CactiNode if it exists
        """
        if self.get_parent():
            return self.get_parent().get_parent()

    def set_label(self):
        """
        set label attribute of node
        """
        if self.is_az:
            self.label = self.attributes.get("zone")

        else:
            self.label = self.terraform_type

        self.shorten_label()

    def shorten_label(self):
        """
        shorten label if its more than MAX_LABEL_LENGTH characters
        """
        if len(self.label) > MAX_LABEL_LENGTH:
            self.label = self.terraform_type[:MAX_LABEL_LENGTH] + "..."

    def set_private_subnet(self):
        self.private_subnet = False

    def set_availability_zone(self):
        """
        set whether this node is availability zone according to its attributes
        """
        if self.terraform_type in NODES_INSIDE_AZ:
            self.availability_zone = self.attributes.get("availability_zone")

    def set_colour(self):
        """
        set colour for this node according to its terraform type
        """
        if self.terraform_type in COLOURED_NODES:
            if (
                self.terraform_type == TerraformTypes.SUBNET_PRIVATE.value
                or self.terraform_type == TerraformTypes.SUBNET_PUBLIC.value
            ):
                self.color = NODE_COLOURS[self.terraform_type]

    def __dict__(self):

        self.set_colour()
        node_dict = {
            "id": self.id,
            "type": "infoNode" if not self.is_cluster_node else "clusterNode",
            "data": {
                **{
                    "type": "architecture",
                    "class": self.terraform_type,
                    "label": self.label,
                    "cacti": True,
                },
                **self.attributes,
            },
            "zIndex": 0,
            "draggable": True,
            "style": {
                "width": DEFAULT_ICON_NODE_WIDTH,
                "height": DEFAULT_ICON_NODE_HEIGHT,
                "backgroundColor": {
                    "red": DEFAULT_RED,
                    "green": DEFAULT_GREEN,
                    "blue": DEFAULT_BLUE,
                },
            },
            "position": {
                "x": 0,
                "y": 0,
            },
            "connectable": True,
            "sourcePosition": Position.bottom.value,
            "targetPosition": Position.top.value,
        }

        if self.terraform_type in ICON_MAPPING:
            node_dict["data"]["icon"] = ICON_MAPPING[self.terraform_type]

        if self.attributes.get("load_balancer_type") == "network":
            node_dict["data"]["icon"] = ICON_MAPPING["aws_nlb"]
        elif self.attributes.get("load_balancer_type") == "application":
            node_dict["data"]["icon"] = ICON_MAPPING["aws_alb"]

        if isinstance(self.parent_node, CactiNode):
            node_dict["parentId"] = self.parent_node.id

        if self.color:
            node_dict["style"]["backgroundColor"]["red"] = self.color.get("red")
            node_dict["style"]["backgroundColor"]["green"] = self.color.get("green")
            node_dict["style"]["backgroundColor"]["blue"] = self.color.get("blue")

        if self.terraform_type in NODE_BORDERS:
            node_dict["style"]["borderColor"] = NODE_BORDERS[self.terraform_type][
                "borderColor"
            ]
            node_dict["style"]["borderStyle"] = NODE_BORDERS[self.terraform_type][
                "borderStyle"
            ]

        return node_dict
