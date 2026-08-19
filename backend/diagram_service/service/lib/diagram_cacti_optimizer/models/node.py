from __future__ import annotations

from service.lib.diagram_node_util.node_colour_util import NodeColourUtil

from shared_libs.types.enum import NodeTypes

from .cursor import Cursor
from .node_properties import NodeProperties


class Node(NodeProperties):
    def __init__(self, node_data: dict):
        super().__init__(node_data)

        # Attribute if the node has a parent group
        self._parent_group_node: Node = None
        self._parent_group_node_id: str = node_data.get("parentId")

        # Dict of sources and targets
        self._targets: dict[str, Node] = {}
        self._sources: dict[str, Node] = {}

        #
        self.x = 0
        self.y = 0
        self.x_absolute = 0
        self.y_absolute = 0
        self.zIndex = 0

    def should_have_parent_group(
        self,
    ) -> bool:
        """
        Returns
            param: bool
                true if this node's _parent_group_node_id is a string, false otherwise
        """
        return isinstance(self._parent_group_node_id, str)

    def has_parent_group(
        self,
    ) -> bool:
        """
        Returns
            param: bool
                true if this node's _parent_group_node is a Node object, false otherwise
        """
        return isinstance(self._parent_group_node, Node)

    def has_siblings(
        self,
    ) -> bool:
        """
        Returns
            param: bool
                true if this node's parentId has more than one child node.
        """
        if (
            self.has_parent_group()
            and len(self.get_parent_group_node().get_group_members()) > 1
        ):
            return True
        return False

    def get_id(
        self,
    ) -> str:
        """
        Returns
            param: str
                the node's unique id.
        """
        return self._id

    def get_node_type(
        self,
    ) -> NodeTypes:
        """
        Return node type.

        Returns:
            NodeTypes: The type of node.
        """
        return self._node_type

    def get_parent_group_node_id(
        self,
    ) -> str | None:
        """
        Returns
            param: str
                the node's parentId property, which is the parent's id.
        """
        return self._parent_group_node_id

    def get_parent_group_node(
        self,
    ) -> Node | None:
        """
        Returns
            param: Node
                the parent instance for this node.
        """
        return self._parent_group_node

    def get_siblings(
        self,
    ) -> list[Node]:
        """
        Returns
            param: list[Node]
                list of nodes with the same parent node, including this node.
        """
        if self.has_parent_group() and self.has_siblings():
            return [
                member
                for _, member in self.get_parent_group_node()
                .get_group_members()
                .items()
            ]
        else:
            return []

    def get_targets(
        self,
    ) -> dict[str, Node]:
        """
        Returns
            param: dict[str,Node]
                dict of this node's target nodes, key is id and value is Node instance
        """
        return self._targets

    def centralise_node(
        self,
        sibling_nodes: list[Node],
    ):
        if len(sibling_nodes) == 0:
            return

        sibling_nodes.sort(key=lambda n: n.x)
        right_hand_nodes = []
        right_hand_x = 0
        for i in range(1, len(sibling_nodes)):
            if (
                sibling_nodes[i - 1].get_id() == self.get_id()
                and sibling_nodes[i].x > sibling_nodes[i - 1].x
            ):
                right_hand_x = sibling_nodes[i].x

            if sibling_nodes[i].x == right_hand_x:
                right_hand_nodes.append(sibling_nodes[i])

        if len(right_hand_nodes) > 1:
            min_y = min([node.y for node in right_hand_nodes])
            max_y = max([node.y + node.height for node in right_hand_nodes])
            self.y = (min_y + max_y) // 2
        elif len(right_hand_nodes) == 1:
            right_hand_node = right_hand_nodes[0]
            if self.height == right_hand_node.height:
                self.y = right_hand_node.y
            elif self.height < right_hand_node.height:
                self.y = right_hand_node.y + 0.5 * (
                    right_hand_node.height - self.height
                )
            else:
                self.y = (
                    right_hand_node.y
                    - (0.5 * self.height)
                    + (0.5 * right_hand_node.height)
                )
        else:
            if self.has_parent_group():
                parent_node = self.get_parent_group_node()
                if parent_node.get_node_type() == NodeTypes.AVAILABILITY_ZONE:
                    self.y = 0.5 * parent_node.height - 0.5 * self.height

    def set_parent_group(
        self,
        parent_group_node,
    ):
        """
        Args
            parent_group_node: ClusterNode
                set this node's _parent_group_node property while also adding this node to the
                _parent_group_node's group members list
        """
        self._parent_group_node = parent_group_node
        self._parent_group_node.add_group_member(self)

    def add_source(
        self,
        source: Node,
    ):
        """
        Args
            source: Node
                the source node to add to this node's _sources list property
        """
        self._sources[source.get_id()] = source

    def add_target(
        self,
        target: Node,
    ):
        """
        Args
            target: Node
                the target node to add to this node's _targets list property
        """
        self._targets[target.get_id()] = target

    def set_position(
        self,
        cursor: Cursor,
    ):
        """
        Set this node's position using a Cursor object
        Args
            cursor: Cursor
                the cursor to use for this node's position
        """
        self.x = cursor.x
        self.y = cursor.y

    def set_group_member_colour_recursive(
        self,
        colour: NodeColourUtil,
    ):
        """
        set this node's colour, will be called from this node's parent instance
            Args
                colour: NodeColourUtil
                    the color object to use for this Node
        """
        colour.darken()
        self.red = colour.red
        self.green = colour.green
        self.blue = colour.blue
        colour.lighten()

    def set_group_member_z_index_recursive(
        self,
        z_index: int = 0,
    ):
        """
        set this node's z-index, will be called from this node's parent instance
            Args
                z_index: int
                    the z-index to use for this node
        """
        z_index += 1
        self.zIndex = z_index
        z_index -= 1

    def set_absolute_position_from_position(
        self,
    ):
        """
        use x and y properties of parent node to set x_absolute and y_absolute of this node
        """
        if self.has_parent_group():
            self.x_absolute = self.x + self.get_parent_group_node().x_absolute
            self.y_absolute = self.y + self.get_parent_group_node().y_absolute
        else:
            self.x_absolute = self.x
            self.y_absolute = self.y

    def __eq__(
        self,
        other,
    ):
        return isinstance(other, Node) and self.get_id() == other.get_id()

    def __str__(
        self,
    ):
        return f"node id:{self.get_id()}\n\
                 node width:{self.width}\n\
                 node height:{self.height}\n\
                 node x:{self.x}\n\
                 node y:{self.y}\n\
                 node targets:{[id for id in self.get_targets()]}\n"
