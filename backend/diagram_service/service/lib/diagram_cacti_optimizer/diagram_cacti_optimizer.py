import logging
from collections import deque

from service.lib.diagram_generator_from_cacti.react_flow.nodes import (
    NODES_MOVED_TO_VPC,
    NodeAttributes,
)

from shared_libs.decorators import raise_exception
from shared_libs.types.enum import Alignment, DrawPriority, Handle, NodeTypes

from .models.cluster_node import ClusterNode
from .models.cursor import Cursor
from .models.edge import Edge
from .models.node import Node

logger = logging.getLogger(__name__)


class DiagramCactiOptimizer:
    def __init__(self, json_data):
        # dict where key is node id and value is Node instance
        self.nodes: dict[str, Node] = {}
        # dict where key is edge id and value is Edge instance
        self.edges: dict[str, Edge] = {}
        # original input json, without proper node positioning or dimensions
        self.json_data: dict[str, list[dict]] = json_data
        # dict where key is node id and value is Node instance, all Node objects have no parent
        self.orphaned_nodes: dict[str, Node] = {}
        self.margin = 60
        self.spacing = 40
        # To remove rds_cluster and move all the edges to its instance
        self.rds_cluster = {}

    @raise_exception(
        "Failed to create nodes.",
        exception_logger=logger,
    )
    def create_nodes(self):
        """
        Create nodes using json data
        """
        # Sort to create cluster node then info node
        for node_data in sorted(
            self.json_data.get("nodes", [])[:], key=lambda d: d["type"]
        ):
            node_id = node_data.get("id", "")
            node_class = node_data.get("data", {}).get("class", "")
            # Remove aws_rds_cluster and keep aws_rds_cluster_instance
            if node_class == "aws_rds_cluster":
                self.json_data["nodes"].remove(node_data)
                continue
            if node_class == "aws_rds_cluster_instance":
                self.rds_cluster[node_data.get("parentId", "")] = node_id
                subnet_id_list = node_data.get("data", {}).get(
                    NodeAttributes.SUBNET_IDS.value, []
                )
                node_data["parentId"] = subnet_id_list[0] if subnet_id_list else ""
            elif node_class in NODES_MOVED_TO_VPC:
                parent_node = self.get_node(node_data.get("parentId", ""))
                if not parent_node:
                    continue
                while (
                    parent_node and parent_node.get_parent_group_node_id() is not None
                ):
                    parent_node = self.get_node(parent_node.get_parent_group_node_id())
                node_data["parentId"] = parent_node.get_id()
            if node_data.get("type") == "clusterNode":
                self.nodes[node_id] = ClusterNode(node_data)
            else:
                self.nodes[node_id] = Node(node_data)

    @raise_exception(
        "Failed to create edges.",
        exception_logger=logger,
    )
    def create_edges(self):
        """
        Use existing Node instances as source and target for each edge
        """
        for edge_data in self.json_data.get("edges", {}):
            edge_id = edge_data.get("id")

            source_id = edge_data.get("source")
            if source_id in self.rds_cluster:
                source_id = self.rds_cluster[source_id]
                edge_data["source"] = source_id

            target_id = edge_data.get("target")
            if target_id in self.rds_cluster:
                target_id = self.rds_cluster[target_id]
                edge_data["target"] = target_id

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
        "Failed to get nodes with type and parent.",
        exception_logger=logger,
    )
    def get_nodes_with_type_and_parent(
        self,
        node_type,
        parent_node=None,
    ) -> list[Node]:
        filtered_nodes = [
            node for node in self.nodes.values() if node.get_node_type() == node_type
        ]

        if isinstance(parent_node, ClusterNode):
            filtered_nodes = [
                node
                for node in filtered_nodes
                if node.get_parent_group_node() == parent_node
            ]
        else:
            filtered_nodes = [
                node for node in filtered_nodes if node.has_parent_group() is False
            ]
        return filtered_nodes

    @raise_exception(
        "Failed to retrieve node by node_id.",
        exception_logger=logger,
    )
    def get_node(self, node_id) -> Node | None:
        """
        Retrieves a Node instance by its id.
        This method attempts to retrieve a Node instance from the nodes dictionary using the given
        node id.
        If no such node exists, it returns None.
        Args:
            node_id (str): The id of the node to retrieve.
        Returns:
            Node | None: The Node instance with the given id, or None if no such node exists.
        Raises:
            Exception: If the retrieval of the node fails.
        """
        return self.nodes.get(node_id)

    @raise_exception(
        "Failed to get edges.",
        exception_logger=logger,
    )
    def get_edge(self, edge_id):
        return self.edges.get(edge_id)

    @raise_exception(
        "Failed to get edges containing.",
        exception_logger=logger,
    )
    def get_edges_containing(self, nodes: list[Node]):
        return [
            edge
            for edge in self.edges.values()
            if edge.source in nodes and edge.target in nodes
        ]

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
                if isinstance(parent_group_node, ClusterNode):
                    self.get_node(node_id).set_parent_group(parent_group_node)

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
        for node in self.nodes.values():
            if node.should_have_parent_group() is False:
                self.orphaned_nodes[node.get_id()] = node

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
            source = self.edges[edge_id].source
            target = self.edges[edge_id].target
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
            source = self.edges[edge_id].source
            target = self.edges[edge_id].target
            if source and target:
                source.add_target(target)

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
        for node in self.orphaned_nodes.values():
            if isinstance(node, ClusterNode):
                node.set_dimensions(self.spacing)

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
        for node in self.orphaned_nodes.values():
            node.set_absolute_position_from_position()

    @raise_exception(
        "Failed to set node positions.",
        exception_logger=logger,
    )
    def set_node_positions(self):
        position = Cursor()
        self.draw_nodes_of_type(NodeTypes.WAF, position=position)
        self.draw_nodes_of_type(NodeTypes.INTERNET, position=position)
        self.draw_nodes_of_type(NodeTypes.VPC, position=position)

    @raise_exception(
        "Failed to finalize node dimensions.",
        exception_logger=logger,
    )
    def finalise_node_dimensions(self):
        for node in self.orphaned_nodes.values():
            if isinstance(node, ClusterNode):
                node.finalise_dimensions(self.spacing)

    @raise_exception(
        "Failed to tighten nodes vertically.",
        exception_logger=logger,
    )
    def tighten_nodes_vertically(self):
        members_with_type = list(self.orphaned_nodes.values())
        x_set = list(set([member.x for member in members_with_type]))

        members_with_type.sort(key=lambda member: member.y)
        for member in members_with_type:
            if isinstance(member, ClusterNode):
                member.tighten_members_vertically(self.spacing)

        for x in x_set:
            aligned_members = [member for member in members_with_type if member.x == x]
            for i in range(1, len(aligned_members)):
                aligned_members[i].y = (
                    aligned_members[i - 1].y
                    + aligned_members[i - 1].height
                    + self.spacing
                )

    @raise_exception(
        "Failed to draw nodes of type.",
        exception_logger=logger,
    )
    def draw_nodes_of_type(
        self,
        node_type: NodeTypes,
        parent_node: ClusterNode | None = None,
        position: Cursor | None = None,
    ):
        position = position or Cursor()
        nodes = self.get_nodes_with_type_and_parent(node_type, parent_node)
        if node_type == NodeTypes.DEFAULT:
            if (
                parent_node.get_node_type() == NodeTypes.VPC
                or parent_node.get_node_type() == NodeTypes.AVAILABILITY_ZONE
            ):
                self.draw_default_nodes(nodes, position, alignment=Alignment.HORIZONTAL)
            elif (
                parent_node.get_node_type() == NodeTypes.SUBNET_PUBLIC
                or parent_node.get_node_type() == NodeTypes.SUBNET_PRIVATE
            ):
                self.draw_default_nodes(nodes, position, alignment=Alignment.VERTICAL)
        elif (
            node_type == NodeTypes.INTERNET
            or node_type == NodeTypes.IGW
            or node_type == NodeTypes.WAF
        ):
            self.draw_nodes(nodes, position)
        elif node_type == NodeTypes.VPC or node_type == NodeTypes.AVAILABILITY_ZONE:
            self.draw_cluster_nodes(nodes, position, Alignment.VERTICAL)
        elif (
            node_type == NodeTypes.SUBNET_PRIVATE
            or node_type == NodeTypes.SUBNET_PUBLIC
        ):
            self.draw_subnet_nodes(nodes, position)

    @raise_exception(
        "Failed to get bfs sorted nodes.",
        exception_logger=logger,
    )
    def get_bfs_sorted_nodes(self, edges: list[Edge]) -> list[Node]:
        adj_list = {}
        bfs_order = []
        visited = set()
        queue = deque()

        for edge in edges:
            source_id = edge.source.get_id()
            target_id = edge.target.get_id()

            if source_id not in adj_list:
                adj_list[source_id] = set()
            if target_id not in adj_list:
                adj_list[target_id] = set()
            if len(queue) == 0:
                queue.append(source_id)

            adj_list[source_id].add(target_id)

        while queue:
            curr_node_id = queue.popleft()

            if curr_node_id in visited:
                continue

            visited.add(curr_node_id)
            bfs_order.append(self.get_node(curr_node_id))

            for neighbor_id in adj_list.get(curr_node_id, set()):
                if neighbor_id not in visited:
                    queue.append(neighbor_id)

        return bfs_order

    @raise_exception(
        "Failed to draw default nodes.",
        exception_logger=logger,
    )
    def draw_default_nodes(
        self,
        nodes: list[Node],
        position: Cursor | None = None,
        alignment=Alignment.HORIZONTAL,
    ):
        position = position or Cursor()
        if alignment == Alignment.HORIZONTAL:
            for node in nodes:
                node.set_position(position)
                position.move_right(node.width)
                node.set_drawn()
        else:
            for node in nodes:
                node.set_position(position)
                position.move_down(node.height)
                node.set_drawn()

    @raise_exception(
        "Failed to draw nodes.",
        exception_logger=logger,
    )
    def draw_nodes(
        self,
        nodes: list[Node],
        position: Cursor | None = None,
    ):
        position = position or Cursor()
        for node in nodes:
            node.set_position(position)
            position.move_right(node.width)
            node.set_drawn()

    @raise_exception(
        "Failed to draw subnet nodes.",
        exception_logger=logger,
    )
    def draw_subnet_nodes(
        self,
        nodes: list[ClusterNode],
        position: Cursor | None = None,
    ):
        position = position or Cursor()
        position.margin = self.margin
        position.spacing = self.spacing

        subnet_nodes = nodes
        subnet_children = [
            child
            for subnet in subnet_nodes
            for child in subnet.get_group_members().values()
        ]
        # list of edges that involve children of the subnet_nodes
        edges_containing_subnet_children: list[Edge] = self.get_edges_containing(
            subnet_children
        )

        sorted_children: list[Node] = self.get_bfs_sorted_nodes(
            edges_containing_subnet_children
        )
        sorted_parents: list[ClusterNode] = [
            child.get_parent_group_node() for child in sorted_children
        ]
        unique_sorted_parents: list[ClusterNode] = []
        for node in subnet_nodes:
            if node not in sorted_parents:
                unique_sorted_parents.append(node)
        for parent in sorted_parents:
            if parent not in unique_sorted_parents:
                unique_sorted_parents.append(parent)
        for node in unique_sorted_parents:
            node.set_position(position)
            node.set_drawn()
            group_member_type_set = set()
            if isinstance(node, ClusterNode) and node.has_group_members():
                group_member_type_set = set(
                    [
                        member.get_node_type()
                        for member in node.get_group_members().values()
                    ]
                )
                # sort the group_member_type_list by priority in descending order
                group_member_type_list = sorted(
                    list(group_member_type_set),
                    key=lambda t: DrawPriority[t.value].value,
                    reverse=True,
                )
                group_member_position = Cursor(margin=self.margin, spacing=self.spacing)
                for node_type in group_member_type_list:
                    self.draw_nodes_of_type(
                        node_type,
                        parent_node=node,
                        position=group_member_position,
                    )
            position.move_right(node.width)

    @raise_exception(
        "Failed to draw cluster nodes.",
        exception_logger=logger,
    )
    def draw_cluster_nodes(
        self,
        nodes: list[Node],
        position: Cursor | None = None,
        alignment=Alignment.HORIZONTAL,
    ):
        position = position or Cursor()
        position.margin = self.margin
        position.spacing = self.spacing
        for node in nodes:
            node.set_position(position)
            node.set_drawn()
            group_member_type_set = set()
            # retrieve set of unique node types in this ClusterNode
            if isinstance(node, ClusterNode) and node.has_group_members():
                group_member_type_set = set(
                    [
                        member.get_node_type()
                        for member in node.get_group_members().values()
                    ]
                )
                # sort the group_member_type_list by priority in descending order
                group_member_type_list = sorted(
                    list(group_member_type_set),
                    key=lambda t: DrawPriority[t.value].value,
                    reverse=True,
                )
                group_member_position = Cursor(margin=self.margin, spacing=self.spacing)
                for node_type in group_member_type_list:
                    self.draw_nodes_of_type(
                        node_type,
                        parent_node=node,
                        position=group_member_position,
                    )
            if alignment == Alignment.VERTICAL:
                position.move_down(node.height)
            else:
                position.move_right(node.width)

    @raise_exception(
        "Failed to centralise nodes.",
        exception_logger=logger,
    )
    def centralise_nodes(self):
        nodes_sorted_by_x = sorted(
            list(self.nodes.values()), key=lambda n: n.x_absolute, reverse=True
        )

        for node in nodes_sorted_by_x:
            if node.get_id() in self.orphaned_nodes:
                node.centralise_node(list(self.orphaned_nodes.values()))
            else:
                node.centralise_node(node.get_siblings())

    @raise_exception(
        "Failed to set group members' zIndex.",
        exception_logger=logger,
    )
    def set_group_member_z_indexes(self):
        """
        Iterate through all cluster nodes and set their zIndex relative to their parent's zIndex
        """
        for node in self.orphaned_nodes.values():
            if isinstance(node, ClusterNode):
                node.set_group_member_z_index_recursive(z_index=1)

    @raise_exception(
        "Failed to get handle positions.",
        exception_logger=logger,
    )
    def get_handle_position(
        self,
        node: Node,
        handle: str,
    ):

        handle_x_absolute = 0
        handle_y_absolute = 0

        if handle == Handle.SOURCE_RIGHT.value or handle == Handle.TARGET_RIGHT.value:
            handle_x_absolute = node.x_absolute + node.width
            handle_y_absolute = node.y_absolute + (node.height // 2)

        if handle == Handle.SOURCE_LEFT.value or handle == Handle.TARGET_LEFT.value:
            handle_x_absolute = node.x_absolute
            handle_y_absolute = node.y_absolute + (node.height // 2)

        if handle == Handle.SOURCE_TOP.value or handle == Handle.TARGET_TOP.value:
            handle_x_absolute = node.x_absolute + (node.width // 2)
            handle_y_absolute = node.y_absolute

        if handle == Handle.SOURCE_BOTTOM.value or handle == Handle.TARGET_BOTTOM.value:
            handle_x_absolute = node.x_absolute + (node.width // 2)
            handle_y_absolute = node.y_absolute + node.height

        return handle_x_absolute, handle_y_absolute

    @raise_exception(
        "Failed to get closest handles.",
        exception_logger=logger,
    )
    def get_closest_handles(
        self,
        source: Node,
        target: Node,
    ):

        source_handle_types = [
            Handle.SOURCE_TOP.value,
            Handle.SOURCE_BOTTOM.value,
            Handle.SOURCE_LEFT.value,
            Handle.SOURCE_RIGHT.value,
        ]
        target_handle_types = [
            Handle.TARGET_TOP.value,
            Handle.TARGET_BOTTOM.value,
            Handle.TARGET_LEFT.value,
            Handle.TARGET_RIGHT.value,
        ]

        best_source_handle = Handle.SOURCE_RIGHT.value
        best_target_handle = Handle.TARGET_LEFT.value
        min_dist = float("inf")

        for source_handle in source_handle_types:
            for target_handle in target_handle_types:
                source_handle_x, source_handle_y = self.get_handle_position(
                    source, source_handle
                )
                target_handle_x, target_handle_y = self.get_handle_position(
                    target, target_handle
                )

                dist = ((source_handle_y - target_handle_y) ** 2) + (
                    (source_handle_x - target_handle_x) ** 2
                )

                if dist < min_dist:
                    min_dist = dist
                    best_source_handle = source_handle
                    best_target_handle = target_handle

        return best_source_handle, best_target_handle

    @raise_exception(
        "Failed to set edge handles.",
        exception_logger=logger,
    )
    def set_edge_handles(self):
        for edge in self.edges.values():
            source_node = edge.source
            target_node = edge.target
            edge.source_handle, edge.target_handle = self.get_closest_handles(
                source_node, target_node
            )

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
                i,
                modified_node.red,
                modified_node.green,
                modified_node.blue,
            )
            self.write_node_z_index(i, modified_node.zIndex)

        for i in range(len(self.json_data["edges"])):
            node_id = self.json_data["edges"][i].get("id")
            modified_edge = self.get_edge(node_id)
            self.write_handles(
                i, modified_edge.source_handle, modified_edge.target_handle
            )
            self.write_edge_z_index(i, modified_edge.zIndex)

    @raise_exception(
        "Failed to write handles.",
        exception_logger=logger,
    )
    def write_handles(self, index, source_handle, target_handle):
        self.json_data["edges"][index]["sourceHandle"] = source_handle
        self.json_data["edges"][index]["targetHandle"] = target_handle

    @raise_exception(
        "Failed to write edge z-index.",
        exception_logger=logger,
    )
    def write_edge_z_index(self, index, z_index):
        self.json_data["edges"][index]["zIndex"] = z_index

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
        "Failed to write node z-index.",
        exception_logger=logger,
    )
    def write_node_z_index(self, index, z_index):
        self.json_data["nodes"][index]["zIndex"] = z_index

    @raise_exception(
        "Failed to write absolute position output.",
        exception_logger=logger,
    )
    def write_absolute_position_output(self):
        """
        Writes the absolute position output for each node.
        This method iterates over the nodes in the JSON data, and for each node, it retrieves the
        corresponding
        Node object and writes its absolute position to the JSON data.
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
    def write_absolute_positions(
        self,
        index,
        new_x_absolute,
        new_y_absolute,
    ):
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
    def write_position(
        self,
        index,
        new_x,
        new_y,
    ):
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
    def write_dimension(
        self,
        index,
        new_width,
        new_height,
    ):
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
        self.find_orphaned_nodes()
        self.set_node_dimensions()
        self.set_node_positions()
        self.set_absolute_positions()
        self.finalise_node_dimensions()
        self.tighten_nodes_vertically()
        self.centralise_nodes()
        self.set_absolute_positions()
        self.finalise_node_dimensions()
        self.set_group_member_z_indexes()
        self.set_edge_handles()
        self.write_position_output()
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
