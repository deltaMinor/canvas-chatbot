import logging

from service.lib.diagram_node_util.node_colour_util import NodeColourUtil

from shared_libs.decorators import raise_exception

from .models.cluster_node import ClusterNode
from .models.cursor import Cursor
from .models.edge import Edge
from .models.node import Node

logger = logging.getLogger(__name__)


# Imported by services
class DiagramNodeOptimizer:
    """
    Manages the positions of nodes in a graph.

    This class takes a JSON representation of a graph and provides methods to manipulate the
    positions of the nodes. It also provides methods to create nodes and edges, find orphaned nodes,
    set parent groups of children, find sources and targets of nodes, set node dimensions, and write
    the output.

    Attributes:
        nodes (dict): A dictionary where the key is the node id and the value is a Node instance.
        edges (dict): A dictionary where the key is the edge id and the value is an Edge instance.
        orphaned_nodes (dict): A dictionary where the key is the node id and the value is a Node
        instance with no parent group.
        json_data (dict): The original input JSON, without proper node positioning or dimensions.
        no_of_layers (int): The largest number of intermediate ancestors between a group node and
        lowest descendent (groups).
        cursor (Cursor): A Cursor instance to keep track of x and y coordinates.
    """

    def __init__(self, json_data):
        """
        Initializes the NodePositionManager with the given JSON data.
        This method initializes the nodes, edges, orphaned_nodes dictionaries, the no_of_layers integer,
        and the cursor instance. It also sets the json_data attribute to the given JSON data.

        Args
            json_data (dict): output dict from ReactJSON.
        """
        # dict where key is node id and value is Node instance
        self.nodes: dict[str, Node] = {}
        # dict where key is edge id and value is Edge instance
        self.edges: dict[str, Edge] = {}
        # dict where key is node id and value is Node instance with no parent group
        self.orphaned_nodes: dict[str, Node] = {}
        # original input json, without proper node positioning or dimensions
        self.json_data: dict[str, list[dict]] = json_data
        # largest number of intermediate ancestors between a group node and lowest descendent
        # (groups)
        self.no_of_layers: int = 0
        # Cursor to keep track of x and y coordinate
        self.cursor: Cursor = Cursor(0, 0)

    @raise_exception(
        "Failed to create nodes.",
        exception_logger=logger,
    )
    def create_nodes(self):
        """
        Create nodes using json data

        This method iterates over the nodes in the JSON data, and for each node, it creates a Node instance
        and adds it to the nodes dictionary. The key for each entry in the dictionary is the node id, and
        the value is the corresponding Node instance.

        Raises:
            Exception: If the creation of nodes fails.
        """
        node_data: dict
        for node_data in self.json_data["nodes"]:
            if node_data.get("type") == "clusterNode":
                self.nodes[node_data.get("id")] = ClusterNode(node_data)
            else:
                self.nodes[node_data.get("id")] = Node(node_data)

    @raise_exception(
        "Failed to create edges.",
        exception_logger=logger,
    )
    def create_edges(self):
        """
        Use existing node instances as source and target for each edge.
        This method iterates over the edges in the JSON data, and for each edge, it creates an Edge instance
        and adds it to the edges dictionary. The key for each entry in the dictionary is the edge id, and
        the value is the corresponding Edge instance. If the source or target node for an edge does not exist,
        the edge is removed from the JSON data.

        Raises:
            Exception: If the creation of edges fails.
        """
        for edge_data in self.json_data["edges"]:
            edge_id = edge_data.get("id")

            source_id = edge_data.get("source")
            target_id = edge_data.get("target")

            source = self.get_node(source_id)
            target = self.get_node(target_id)

            if not source or not target:
                self.json_data["edges"].remove(edge_data)
                continue
            edge = Edge(edge_id, source, target)
            self.edges[edge.id] = edge

    @raise_exception(
        "Failed to get all cluster nodes.",
        exception_logger=logger,
    )
    def get_all_cluster_nodes(self) -> list[ClusterNode]:
        """
        Returns
            param: list[ClusterNode]
                all ClusterNodes inside self.nodes
        """
        return [node for node in self.nodes.values() if isinstance(node, ClusterNode)]

    @raise_exception(
        "Failed to retrieve node by node_id.",
        exception_logger=logger,
    )
    def get_node(self, node_id) -> Node | None:
        """
        Retrieves a Node instance by its id.

        This method attempts to retrieve a Node instance from the nodes dictionary using the given
        node id. If no such node exists, it returns None.

        Args:
            node_id (str): The id of the node to retrieve.

        Returns:
            Node | None: The Node instance with the given id, or None if no such node exists.

        Raises:
            Exception: If the retrieval of the node fails.
        """
        return self.nodes.get(node_id)

    @raise_exception(
        "Failed to retrieve highest layer nodes.",
        exception_logger=logger,
    )
    def get_highest_layer_nodes(self) -> list[ClusterNode]:
        """
        Retrieves the ids of the nodes in the highest layer.

        This method iterates over the nodes in the nodes dictionary, and for each node, it checks if
        its layer is equal to the highest layer (no_of_layers). If it is, the node id is added to
        the list. The method returns this list of node ids.

        Returns:
            list: A list of the ids of the nodes in the highest layer.

        Raises:
            Exception: If the retrieval of the highest layer nodes fails.
        """
        return [
            node
            for node in self.get_all_cluster_nodes()
            if node.get_layer() == self.no_of_layers
        ]

    @raise_exception(
        "Failed to find orphaned nodes.",
        exception_logger=logger,
    )
    def find_orphaned_nodes(self) -> Node | None:
        """
        Finds and stores orphaned nodes.

        This method iterates over the nodes in the nodes dictionary, and for each node, it checks if
        the node should have a parent group. If it should not, the node is considered orphaned, and
        it is added to the orphaned_nodes dictionary.

        Raises:
            Exception: If the operation fails.
        """
        node: Node
        for node in self.nodes.values():
            if node.should_have_parent_group() is False:
                self.orphaned_nodes[node.get_id()] = node

    @raise_exception(
        "Failed to set parent groups of children.",
        exception_logger=logger,
    )
    def set_parent_groups_of_children(self):
        """
        Sets the parent group for each child node.

        This method iterates over the nodes in the nodes dictionary, and for each node, it checks if
        the node should have a parent group. If it should, the method retrieves the parent group
        node and sets it as the parent group of the node.

        Raises:
            Exception: If the operation fails.
        """
        for node_id in self.nodes:
            parent_group_node_id = self.get_node(node_id).get_parent_group_node_id()
            if self.get_node(node_id).should_have_parent_group():
                parent_group_node = self.get_node(parent_group_node_id)
                if not parent_group_node:
                    continue
                self.get_node(node_id).set_parent_group(parent_group_node)

    @raise_exception(
        "Failed to find sources of nodes.",
        exception_logger=logger,
    )
    def find_sources_of_nodes(self):
        """
        Finds and sets the source nodes for each target node.

        This method iterates over the edges in the edges dictionary, and for each edge, it retrieves
        the source and target nodes. If both nodes exist, it adds the source node to the list of
        source nodes for the target node.

        Raises:
            Exception: If the operation fails.
        """

        for edge_id in self.edges:
            source: Node = self.edges[edge_id].source
            target: Node = self.edges[edge_id].target
            if source and target:
                target.add_source(source)

    @raise_exception(
        "Failed to find targets of nodes.",
        exception_logger=logger,
    )
    def find_targets_of_nodes(self):
        """
        Finds and sets the target nodes for each source node.

        This method iterates over the edges in the edges dictionary, and for each edge, it retrieves
        the source and target nodes. If both nodes exist, it adds the target node to the list of
        target nodes for the source node.

        Raises:
            Exception: If the operation fails.
        """

        for edge_id in self.edges:
            target: Node = self.edges[edge_id].target
            source: Node = self.edges[edge_id].source
            if source and target:
                source.add_target(target)

    @raise_exception(
        "Failed to find layer of nodes.",
        exception_logger=logger,
    )
    def find_layer_of_nodes(self):
        """
        Finds and sets the layer for each node.

        This method iterates over the nodes in the nodes dictionary, and for each node, it checks if
        the node has group members or is a parent group. If it does not, it sets the parent layer
        for the node. Then, it sets the children layer for nodes that do not have group members, and
        the sibling layer for nodes that have siblings. Finally, it sets the layer for orphaned
        nodes to the highest layer.

        Raises:
            Exception: If the operation fails.
        """
        cluster_nodes = self.get_all_cluster_nodes()

        for node in self.nodes.values():
            node.set_parent_layer(start_layer=0)

        for cluster_node in cluster_nodes:
            if cluster_node.has_group_members():
                cluster_node.set_children_layer_recursive()

        for node in self.nodes.values():
            if node.has_siblings():
                for sibling_id in node.get_siblings():
                    node.set_sibling_layer(sibling_node=self.get_node(sibling_id))
        for node in self.nodes.values():
            self.no_of_layers = max(node.get_layer(), self.no_of_layers)
        for orphaned_node in self.orphaned_nodes.values():
            orphaned_node.set_layer(self.no_of_layers)

    @raise_exception(
        "Failed to set node dimensions.",
        exception_logger=logger,
    )
    def set_node_dimensions(self):
        """
        Sets the dimensions for each node.

        This method iterates over the nodes in the nodes dictionary, and for each node, it checks if
        the node's layer is equal to the current layer. If it is, it sets the dimensions for the
        node. The method starts from the nodes with the lowest layer and proceeds to the nodes with
        the highest layer, because the dimensions for nodes of a higher layer may depend on the
        dimensions for nodes of a lower layer.

        Raises:
            Exception: If the operation fails.
        """
        cluster_nodes = self.get_all_cluster_nodes()
        for layer in range(1, self.no_of_layers + 1):
            for node in cluster_nodes:
                if node.get_layer() == layer:
                    node.set_dimensions()

    @raise_exception(
        "Failed to set absolute positions.",
        exception_logger=logger,
    )
    def set_absolute_positions(self):
        """
        Sets the absolute position of each node according to its parent group's position.

        This method iterates over the nodes in the nodes dictionary, and for each node, it sets the
        absolute position of the node based on its current position and the position of its parent
        group.

        Raises:
            Exception: If the operation fails.
        """
        for node in self.nodes.values():
            node.set_absolute_position_from_position()

    @raise_exception(
        "Failed to reduce empty space inside nodes.",
        exception_logger=logger,
    )
    def reduce_empty_space_inside_nodes(self):
        """
        Reduces the empty space inside each node.

        This method iterates over the nodes in the nodes dictionary, and for each node, it checks if
        the node has a parent group. If it does not, it tightens the boundaries of the node to
        reduce the empty space inside it.

        Raises:
            Exception: If the operation fails.
        """
        for node in self.get_all_cluster_nodes():
            if node.has_parent_group():
                continue
            node.tighten_boundaries(Cursor(margin=90))

    @raise_exception(
        "Failed to scale down to smallest.",
        exception_logger=logger,
    )
    def scale_down_to_smallest(self):
        """
        Scales down the nodes to the smallest possible size.

        This method repeatedly checks if the nodes can be scaled down and reduces the empty space
        inside the nodes until they cannot be scaled down any further.

        Raises:
            Exception: If the operation fails.
        """
        reducable = True
        while reducable:
            reducable = False
            reducable = reducable or self.can_be_scaled_down()

    @raise_exception(
        "Failed to verify whether scaling down is allowed.",
        exception_logger=logger,
    )
    def can_be_scaled_down(self) -> bool:
        """
        Checks if the nodes can be scaled down.

        This method iterates over the nodes in the highest layer, and for each node, it checks if
        the node can be scaled down. If at least one node can be scaled down, the method returns
        True.

        Returns:
            bool: True if at least one node can be scaled down, False otherwise.

        Raises:
            Exception: If the operation fails.
        """
        reducable = False
        highest_layer_nodes = self.get_highest_layer_nodes()
        for node in highest_layer_nodes:
            reducable = reducable or node.can_be_scaled_down(minimum_gap=80)
            node.finalise_members_dimensions_and_position()
        return reducable

    @raise_exception(
        "Failed to set group member positions.",
        exception_logger=logger,
    )
    def set_group_member_positions(self):
        """
        Sets the positions of the group members for each node.

        This method iterates over the nodes in the nodes dictionary, and for each node, it checks if
        the node is drawn inside a group, has a parent group, or has group members drawn. If none of
        these conditions are met, it sets the group member positions for the node.

        Raises:
            Exception: If the operation fails.
        """
        # Cursor to keep track of current x and y coordinate, initially (0,0)
        cursor = Cursor()
        # Add a margin to the cursor
        cursor.add_margin_top()
        cursor.add_margin_left()
        for node in self.get_all_cluster_nodes():
            # start recursion from nodes with no parent groups
            if (
                node.is_drawn_inside_group()
                or node.has_parent_group()
                or node.group_members_drawn()
            ):
                continue
            # Start recursion from nodes with no parent groups (the provider node)
            current_x, current_y = cursor.get_position()
            node.set_group_member_position_recursive(cursor)
            cursor.set_x(current_x)
            cursor.set_y(current_y)
            cursor.move_right(node.width)

    @raise_exception(
        "Failed to set group member colours.",
        exception_logger=logger,
    )
    def set_group_member_colours(self):
        """
        Iterate through all cluster nodes and set their colours relative to their parent node colour.
        """
        colour = NodeColourUtil()
        for node in self.get_all_cluster_nodes():
            if node.has_parent_group():
                continue
            node.set_group_member_colour_recursive(colour)

    @raise_exception(
        "Failed to set group member z-index.",
        exception_logger=logger,
    )
    def set_group_member_z_indexes(self):
        """
        Iterate through all cluster nodes and set their zIndex relative to their parent node zIndex
        """
        for node in self.get_all_cluster_nodes():
            if node.has_parent_group():
                continue
            node.set_group_member_z_index_recursive(z_index=0)

    @raise_exception(
        "Failed to set target positions.",
        exception_logger=logger,
    )
    def set_target_positions(self):
        """
        Sets the target positions for each node.

        This method iterates over the nodes in the nodes dictionary, and for each node, it checks if
        the node has sources. If it does not, it sets the target position for the node. Then, it
        sets the position of the node from its absolute position.

        Raises:
            Exception: If the operation fails.
        """
        # Cursor to keep track of current x and y coordinate, initially (0,0)
        cursor = Cursor(margin=90)
        # Add a margin to the cursor
        cursor.add_margin_top()
        cursor.add_margin_left()
        for node in self.nodes.values():
            node: Node
            # start recursion from nodes with no sources
            if node.has_sources():
                continue
            cursor.set_x(node.x_absolute)
            cursor.set_y(node.y_absolute + node.height)
            node.set_target_position_recursive(cursor, node)
            cursor.move_right(node.width)

        for node in self.nodes.values():
            node.set_position_from_absolute_position()

    @raise_exception(
        "Failed to set node positions.",
        exception_logger=logger,
    )
    def set_node_positions(self):
        """
        Sets the positions of the nodes.

        This method performs the following steps:
        1. Ensures the nodes are inside their respective parent groups.
        2. Ensures the nodes are below all of its source nodes.

        Raises:
            Exception: If the operation fails.
        """
        self.set_group_member_positions()
        # find absolute positions to make it easier to set target positions for source nodes,
        # especially if source and target have different parent groups
        self.set_absolute_positions()
        # Ensuring nodes are below their sources
        self.set_target_positions()
        # remove empty space between nodes while ensuring relative positions are the same
        self.scale_down_to_smallest()

    @raise_exception(
        "Failed to initialize nodes and edges.",
        exception_logger=logger,
    )
    def initialise_nodes_and_edges(self):
        """
        Initializes the nodes and edges.

        This method performs the following steps:
        1. Creates Node and Edge objects.
        2. Finds the targets and sources of every node, where each source and target is another Node
        object.
        3. Sets the parent group of each node if it has one.
        4. Finds the layer of each node.

        Raises:
            Exception: If the operation fails.
        """
        # Initialise Node and Edge objects
        self.create_nodes()
        self.create_edges()
        # find sources and targets of every node, each source and target is another Node object
        self.find_targets_of_nodes()
        self.find_sources_of_nodes()
        # set parent group of each node if it has one.
        self.set_parent_groups_of_children()
        self.find_layer_of_nodes()

    @raise_exception(
        "Failed to write position output.",
        exception_logger=logger,
    )
    def write_position_output(self):
        """
        Writes the position output.

        This method iterates over the nodes in the JSON data, and for each node, it retrieves the
        corresponding Node object and writes its position and dimensions to the JSON data.

        Raises:
            Exception: If the operation fails.
        """
        for i in range(len(self.json_data["nodes"])):
            node_id = self.json_data["nodes"][i].get("id")
            modified_node = self.get_node(node_id)
            self.write_position(i, modified_node.x, modified_node.y)
            self.write_dimension(i, modified_node.width, modified_node.height)
            self.write_colour(
                i, modified_node.red, modified_node.green, modified_node.blue
            )
            self.write_z_index(i, modified_node.zIndex)

    @raise_exception(
        "Failed to write colour.",
        exception_logger=logger,
    )
    def write_colour(self, index, red, green, blue):
        """
        modify style backgroundColor property
            Args:
                index: int
                    index of node in self.json_data['nodes'] list to modify
                red: int
                    new r value to use for node['style']['backgroundColor']
                green: int
                    new g value to use for node['style']['backgroundColor']
                blue: int
                    new b value to use for node['style']['backgroundColor']
        """
        self.json_data["nodes"][index]["style"]["backgroundColor"] = (
            f"rgba({red},{green},{blue},0.3)"
        )

    @raise_exception(
        "Failed to write z-index.",
        exception_logger=logger,
    )
    def write_z_index(self, index, z_index):
        self.json_data["nodes"][index]["style"]["zIndex"] = z_index

    @raise_exception(
        "Failed to write absolute position output.",
        exception_logger=logger,
    )
    def write_absolute_position_output(self):
        """
        Writes the absolute position output for each node.

        This method iterates over the nodes in the JSON data, and for each node, it retrieves the
        corresponding Node object and writes its absolute position to the JSON data.

        Raises:
            Exception: If the operation fails.
        """
        for i in range(len(self.json_data["nodes"])):
            node_id = self.json_data["nodes"][i].get("id")
            modified_node = self.get_node(node_id)
            self.write_absolute_positions(
                i, modified_node.x_absolute, modified_node.y_absolute
            )

    @raise_exception(
        "Failed to write absolute position.",
        exception_logger=logger,
    )
    def write_absolute_positions(self, index, new_x_absolute, new_y_absolute):
        """
        Writes the absolute position for a node.

        This method writes the given absolute position to the node at the given index in the JSON
        data.

        Args:
            index (int): The index of the node in the JSON data.
            new_x_absolute (float): The new absolute x-coordinate of the node.
            new_y_absolute (float): The new absolute y-coordinate of the node.

        Raises:
            Exception: If the operation fails.
        """
        self.json_data["nodes"][index]["positionAbsolute"] = {
            "x": new_x_absolute,
            "y": new_y_absolute,
        }

    @raise_exception(
        "Failed to write position.",
        exception_logger=logger,
    )
    def write_position(self, index, new_x, new_y):
        """
        Writes the position for a node.

        This method writes the given position to the node at the given index in the JSON data.

        Args:
            index (int): The index of the node in the JSON data.
            new_x (float): The new x-coordinate of the node.
            new_y (float): The new y-coordinate of the node.

        Raises:
            Exception: If the operation fails.
        """
        self.json_data["nodes"][index]["position"]["x"] = new_x
        self.json_data["nodes"][index]["position"]["y"] = new_y

    @raise_exception(
        "Failed to write dimension.",
        exception_logger=logger,
    )
    def write_dimension(self, index, new_width, new_height):
        """
        Writes the dimensions for a node.

        This method writes the given dimensions to the node at the given index in the JSON data.

        Args:
            index (int): The index of the node in the JSON data.
            new_width (float): The new width of the node.
            new_height (float): The new height of the node.

        Raises:
            Exception: If the operation fails.
        """
        self.json_data["nodes"][index]["style"]["width"] = new_width
        self.json_data["nodes"][index]["style"]["height"] = new_height

    @raise_exception(
        "Failed to write viewport.",
        exception_logger=logger,
    )
    def write_viewport(self):
        self.json_data["viewport"] = {"x": 0, "y": 0, "zoom": 1}

    @raise_exception(
        "Failed to start assign position workflow.",
        exception_logger=logger,
    )
    def start_assign_position_workflow(self):
        """
        Assigns new positions and absolute positions to nodes.

        This method performs the following steps:
        1. Initializes the nodes and edges.
        2. Sets the dimensions for each node.
        3. Sets the positions for each node.
        4. Writes the position output.
        5. Sets the absolute positions for each node.
        6. Writes the absolute position output.

        The resulting graph will look like a tree where targets are below sources.

        Raises:
            Exception: If the operation fails.
        """
        self.initialise_nodes_and_edges()
        self.set_node_dimensions()
        self.set_node_positions()
        self.set_group_member_z_indexes()
        self.write_position_output()
        self.set_absolute_positions()
        self.write_absolute_position_output()
        self.write_viewport()

    @raise_exception(
        "Failed to assign position.",
        exception_logger=logger,
    )
    def assign_positions(self) -> dict:
        """
        Assigns positions to the nodes.

        This method starts the assign position workflow and returns the JSON data with the new
        positions.

        Returns:
            dict: The JSON data with the new positions.

        Raises:
            Exception: If the operation fails.
        """
        self.start_assign_position_workflow()

        return self.json_data
