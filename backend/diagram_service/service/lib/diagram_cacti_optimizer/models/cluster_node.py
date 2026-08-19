from service.lib.diagram_node_util.node_colour_util import NodeColourUtil

from shared_libs.constants.diagram import (
    DEFAULT_CLUSTER_NODE_HEIGHT,
    DEFAULT_CLUSTER_NODE_WIDTH,
)
from shared_libs.types.enum import NodeTypes

from .node import Node


class ClusterNode(Node):
    """
    A clusterNode in React Flow, which is a node that can have child nodes (group members)
    """

    def __init__(
        self,
        node_data,
    ):
        """
        Args
            node_data: dict
                the node's properties which were written by ReactJSON
        """
        super().__init__(node_data)
        self._group_members: dict[str, Node] = {}
        self._group_members_drawn: bool = False
        self.zIndex = 0

    def group_members_drawn(
        self,
    ) -> bool:
        """
        Returns
            param: bool
                self._group_members_drawn
        """
        return self._group_members_drawn

    def has_group_members(
        self,
    ) -> bool:
        """
        Returns
            param: bool
                true if this ClusterNode has group members
        """
        return len(self._group_members) > 0

    def get_group_members(
        self,
    ) -> dict[str, Node]:
        """
        Returns
            param: dict[str,Node]
                the list of group members for this ClusterNode
        """
        return self._group_members

    def get_group_member(
        self,
        node_id,
    ) -> Node:
        """
        Args
            node_id: str
                the unique id of the Node being searched for
        Returns
            param: Node
                the Node matching id
        """
        return self._group_members.get(node_id)

    def add_group_member(
        self,
        child_node: Node,
    ):
        """
        Args
            child_node: Node
                the Node to be added to this ClusterNode's _group_members dict
        """
        self._group_members[child_node.get_id()] = child_node

    def set_absolute_position_from_position(
        self,
    ):
        super().set_absolute_position_from_position()
        for group_member in self.get_group_members().values():
            group_member.set_absolute_position_from_position()

    def set_dimensions(
        self,
        margin,
    ):
        """
        set this node's dimensions according to the number of group members it has and their
        dimensions
        """
        self.height = DEFAULT_CLUSTER_NODE_HEIGHT + margin
        self.width = DEFAULT_CLUSTER_NODE_WIDTH + margin
        # find the boundaries based on the locations for all member nodes
        for member_node in self._group_members.values():
            if isinstance(member_node, ClusterNode):
                member_node.set_dimensions(margin)

            if (
                self.get_node_type() == NodeTypes.SUBNET_PUBLIC
                or self.get_node_type() == NodeTypes.SUBNET_PRIVATE
                or self.get_node_type() == NodeTypes.VPC
            ):
                self.height += member_node.height + margin
                self.width = max(self.width, member_node.width + 2 * margin)

            else:
                self.height = max(self.height, member_node.height + 2 * margin)
                self.width += member_node.width + margin

    def tighten_members_vertically(
        self,
        margin,
    ):

        members_with_type = list(self.get_group_members().values())
        x_set = list(set([member.x for member in members_with_type]))

        members_with_type.sort(key=lambda member: member.y)
        for member in members_with_type:
            if isinstance(member, ClusterNode):
                member.tighten_members_vertically(margin)

        for x in x_set:
            aligned_members = [member for member in members_with_type if member.x == x]
            for i in range(1, len(aligned_members)):
                aligned_members[i].y = (
                    aligned_members[i - 1].y + aligned_members[i - 1].height + margin
                )

    def finalise_dimensions(
        self,
        margin,
    ):
        # find the boundaries based on the locations for all member nodes
        for member_node in self.get_group_members().values():
            if isinstance(member_node, ClusterNode):
                member_node.finalise_dimensions(margin)

        if self.has_group_members():
            furthest_x_absolute = (
                max(
                    [
                        member.x_absolute + member.width
                        for member in self.get_group_members().values()
                    ]
                )
                + margin
            )
            furthest_y_absolute = (
                max(
                    [
                        member.y_absolute + member.height
                        for member in self.get_group_members().values()
                    ]
                )
                + margin
            )
            self.width = max(
                furthest_x_absolute - self.x_absolute, DEFAULT_CLUSTER_NODE_WIDTH
            )
            self.height = max(
                furthest_y_absolute - self.y_absolute, DEFAULT_CLUSTER_NODE_HEIGHT
            )
        else:
            self.width = DEFAULT_CLUSTER_NODE_WIDTH
            self.height = DEFAULT_CLUSTER_NODE_HEIGHT

    def set_group_member_colour_recursive(
        self,
        colour: "NodeColourUtil",
    ):
        """
        Modify group members' colour.
            Args:
                colour: NodeColourUtil
                    the colour to use for this node
        """
        colour.darken()
        self.red = colour.red
        self.green = colour.green
        self.blue = colour.blue
        for group_member in self.get_group_members().values():
            group_member.set_group_member_colour_recursive(colour)
        colour.lighten()

    def set_group_member_z_index_recursive(
        self,
        z_index: int = 0,
    ):
        """
        Modify group members' z-index.
            Args:
                z_index: int
                    the z-index to use for this node
        """
        z_index += 1
        self.zIndex = z_index
        for group_member in self.get_group_members().values():
            group_member.set_group_member_z_index_recursive(z_index)
        z_index -= 1
