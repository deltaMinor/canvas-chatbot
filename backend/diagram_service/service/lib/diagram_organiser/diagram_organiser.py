import logging
import random
from collections import defaultdict

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


# Imported by services
class DiagramOrganiser:
    """
    A class used to manage and organise diagrams.

    This class provides methods to set parent nodes, track parent nodes, and edit the diagram JSON.

    Attributes:
        width_inc (int): The increment for the width of a node.
        height_inc (int): The increment for the height of a node.
        defaultNodeWidth (int): The default width of a node.
        defaultNodeHeight (int): The default height of a node.
        diagram (dict): The diagram to be organised.

    Methods:
        set_parentnodes: Sets the parent nodes of the diagram.
        track_parentnodes: Tracks the parent nodes of the diagram.
        editJson: Edits the JSON of the diagram.
    """

    width_inc = 30
    height_inc = 30
    defaultNodeWidth = 150
    defaultNodeHeight = 36

    def __init__(self, diagram: dict):
        """
        Constructs all the necessary attributes for the DiagramOrganiser object.

        Args:
            diagram (dict): The diagram to be organised.
        """
        self.diagram = diagram

    @raise_exception(
        "Failed to set parent nodes.",
        exception_logger=logger,
    )
    def set_parentnodes(
        self,
        parent_nodes,
        parent_node_count,
        width_inc,
        height_inc,
        defaultNodeWidth,
        defaultNodeHeight,
    ):
        """
        Sets the parent nodes of the diagram.

        Args:
            parent_nodes (dict): The parent nodes to be set.
            parent_node_count (dict): The count of parent nodes.
            width_inc (int): The increment for the width of a node.
            height_inc (int): The increment for the height of a node.
            defaultNodeWidth (int): The default width of a node.
            defaultNodeHeight (int): The default height of a node.
        """
        backgroundColor = [
            f"rgba({random.randrange(0, 255)}, {random.randrange(0, 255)}, {random.randrange(0, 255)}, 0.5)"
            for _ in parent_nodes
        ]

        for colorOrder, object in enumerate(parent_nodes):
            if object == "main":
                continue
            for node in self.diagram.get("nodes"):
                if node.get("id") == object:
                    node["style"] = {
                        "backgroundColor": backgroundColor[colorOrder],
                    }

    @raise_exception(
        "Failed to track parent nodes.",
        exception_logger=logger,
    )
    def track_parentnodes(self):
        """
        Tracks the parent nodes of the diagram.

        Returns:
            tuple: A tuple containing the parent nodes and their count.
        """
        parent_nodes = defaultdict(list)
        parent_node_count = defaultdict(int)

        nodes: list[dict] = self.diagram.get("nodes")

        for node in nodes:
            parentId = node.get("parentId", "main")
            parent_nodes[parentId].append(node.get("id"))
            parent_node_count[parentId] += 1

        for node in nodes:
            if (
                node.get("id") in parent_node_count
                and node.get("parentId") in parent_node_count
            ):
                parent_node_count[node.get("parentId")] += parent_node_count[
                    node.get("id")
                ]

        errorCheck = set()
        for node in nodes:
            matching_nodes = [
                node2
                for node2 in nodes
                if node.get("id") == node2.get("id")
                and node.get("parentId") != node2.get("parentId")
            ]
            for node2 in matching_nodes:
                node3 = next(
                    (
                        node3
                        for node3 in nodes
                        if node3.get("id") == node2.get("parentId")
                        and node3.get("parentId") == node.get("parentId")
                    ),
                    None,
                )
                if node3:
                    parent_nodes[node3.get("parentId")].remove(node.get("id"))
                    parent_nodes[node3.get("id")].append(node.get("id"))
                    errorCheck.add(node.get("parentId"))
                    errorCheck.add(node2.get("parentId"))

        for pnode in parent_nodes:
            parent_nodes[pnode] = list(set(parent_nodes[pnode]))

        return parent_nodes, parent_node_count

    @raise_exception(
        "Failed to edit diagram json.",
        exception_logger=logger,
    )
    def editJson(self):
        """
        Edits the JSON of the diagram.

        Returns:
            dict: The edited diagram.
        """
        parent_nodes, parent_node_count = self.track_parentnodes()
        self.set_parentnodes(
            parent_nodes,
            parent_node_count,
            self.width_inc,
            self.height_inc,
            self.defaultNodeWidth,
            self.defaultNodeHeight,
        )
        return self.diagram
