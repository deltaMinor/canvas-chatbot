import math
from copy import deepcopy

from service.lib.diagram_node_util.node_colour_util import NodeColourUtil

from shared_libs.constants.diagram import (
    DEFAULT_CLUSTER_NODE_HEIGHT,
    DEFAULT_CLUSTER_NODE_WIDTH,
)

from .cursor import Cursor
from .node import Node


class ClusterNode(Node):
    """
    A clusterNode in React Flow, which is a node that can have child nodes (group members)
    """

    def __init__(self, node_data):
        """
        Args
            node_data: dict
                the node's properties which were written by ReactJSON
        """
        super().__init__(node_data)
        self._group_members: dict[str, Node] = {}
        self._group_members_drawn: bool = False

    def group_members_drawn(self) -> bool:
        """
        Returns
            param: bool
                self._group_members_drawn
        """
        return self._group_members_drawn

    def get_number_of_members(self) -> int:
        """
        Returns
            param: bool
                the number of group members of this ClusterNode
        """
        return max(len(self._group_members), 1)

    def has_group_members(self) -> bool:
        """
        Returns
            param: bool
                true if this ClusterNode has group members
        """
        return len(self._group_members) > 0

    def get_group_members(self) -> dict[str, Node]:
        """
        Returns
            param: dict[str,Node]
                the list of group members for this ClusterNode
        """
        return self._group_members

    def get_group_member(self, node_id) -> Node:
        """
        Args
            node_id: str
                the unique id of the Node being searched for
        Returns
            param: Node
                the Node matching id
        """
        return self._group_members.get(node_id)

    def add_group_member(self, child_node: Node):
        """
        Args
            child_node: Node
                the Node to be added to this ClusterNode's _group_members dict
        """
        self._group_members[child_node.get_id()] = child_node

    def set_dimensions(self):
        """
        set this node's dimensions according to the number of group members it has and their
        dimensions
        """
        self.height = DEFAULT_CLUSTER_NODE_HEIGHT / 2
        self.width = DEFAULT_CLUSTER_NODE_WIDTH
        # find the boundaries based on the locations for all member nodes
        for member_node in self._group_members.values():
            self.height += member_node.height + DEFAULT_CLUSTER_NODE_HEIGHT / 2
            self.width += member_node.width + DEFAULT_CLUSTER_NODE_WIDTH / 2

    def tighten_boundaries(self, cursor: Cursor):
        """
        Remove most of the empty space inside this node, leaving some margins near the boundaries
        Args:
            cursor: Cursor
                the Cursor whose margin property defines the amount of space to leave on the
                boundaries of the node
        """
        if not self.has_group_members():
            return
        for group_member in self.get_group_members().values():
            if isinstance(group_member, ClusterNode):
                group_member.tighten_boundaries(cursor)
        lower_bound_x = min(
            self.x,
            min([group_member.x for group_member in self.get_group_members().values()]),
        )
        upper_bound_x = max(
            [
                group_member.x + group_member.width
                for group_member in self.get_group_members().values()
            ]
        )
        lower_bound_y = min(
            self.y,
            min([group_member.y for group_member in self.get_group_members().values()]),
        )
        upper_bound_y = max(
            [
                group_member.y + group_member.height
                for group_member in self.get_group_members().values()
            ]
        )
        self.width = upper_bound_x - lower_bound_x + 2 * cursor.margin
        self.height = upper_bound_y - lower_bound_y + 2 * cursor.margin
        char_width = 7.2
        raw_width = len(self.get_id()) * char_width + 22.5
        id_width = math.ceil(raw_width / 10) * 10
        self.width = max(self.width, id_width)

    def finalise_dimension_and_position(self, cursor: Cursor):
        """
        Reduce the empty space in this ClusterNode's boundaries
        """
        if len(self.get_group_members().values()):
            lower_bound_x = min(
                [group_member.x for group_member in self.get_group_members().values()]
            )
            lower_bound_y = min(
                [group_member.y for group_member in self.get_group_members().values()]
            )

            change_start_x = lower_bound_x - cursor.margin
            change_start_y = lower_bound_y - cursor.margin
            self.x += change_start_x
            self.y += change_start_y

            for node in self.get_group_members().values():
                node.x -= change_start_x
                node.y -= change_start_y

            self.width -= change_start_x
            self.height -= change_start_y

            upper_bound_x = max(
                [
                    group_member.x + group_member.width
                    for group_member in self.get_group_members().values()
                ]
            )
            upper_bound_y = max(
                [
                    group_member.y + group_member.height
                    for group_member in self.get_group_members().values()
                ]
            )

            self.width = upper_bound_x + cursor.margin
            self.height = upper_bound_y + cursor.margin

    def can_be_scaled_down_vertically(self, minimum_gap):
        """
        Reduce the vertical space between nodes while maintaining the relative vertical spacing.
            Args
                minimum_gap: int
                    the minimum space between two vertically adjacent nodes
        """
        reducable = False
        group_members: list = [id for id in self.get_group_members()]
        # sort group members by their y coordinates in ascending order
        group_members.sort(key=lambda id: self.get_group_member(id).y)
        # keep track of minimum y coordinate of current group member
        cur_min_y = -1
        for i in range(1, len(group_members)):
            cur_id = group_members[i]
            prev_id = group_members[i - 1]
            cur_group_member = self.get_group_member(cur_id)
            prev_group_member = self.get_group_member(prev_id)
            prev_y_boundary = prev_group_member.y + prev_group_member.height
            # minimum y coordinate must at least be as high as the previous group member's ending y
            cur_min_y = max(cur_min_y, prev_y_boundary)
            vertical_gap = cur_group_member.y - (cur_min_y)
            if vertical_gap > minimum_gap:
                old_y = deepcopy(cur_group_member.y)
                cur_group_member.y = cur_min_y + minimum_gap
                reducable = True
                # update the y coord of group members that have the same y as the current
                for j in range(i + 1, len(group_members)):
                    following_id = group_members[j]
                    following_group_member = self.get_group_member(following_id)
                    if following_group_member.y == old_y:
                        following_group_member.y = cur_group_member.y
        return reducable

    def can_be_scaled_down_horizontally(self, minimum_gap):
        """
        Reduce the horizontal space between nodes while maintaining the relative horizontal spacing.
            Args
                minimum_gap: int
                    the minimum horizontal space to keep between two horizontally adjacent nodes
        """
        reducable = False
        group_members: list = [id for id in self.get_group_members()]
        # sort group members by their x coordinates in ascending order
        group_members.sort(key=lambda id: self.get_group_member(id).x)

        # keep track of minimum x coordinate of current group member
        cur_min_x = -1
        for i in range(1, len(group_members)):
            cur_id = group_members[i]
            prev_id = group_members[i - 1]

            cur_group_member = self.get_group_member(cur_id)
            prev_group_member = self.get_group_member(prev_id)

            prev_label_width = prev_group_member.get_label_width()
            prev_group_member_width = max(prev_group_member.width, prev_label_width)
            prev_x_boundary = prev_group_member.x + prev_group_member_width
            # minimum x coordinate must at least be as high as the previous group member's ending x
            cur_group_member.x = prev_x_boundary + minimum_gap
            horizontal_gap = cur_group_member.x - (prev_x_boundary)
            current_minimum_gap = max(prev_label_width, minimum_gap)
            if horizontal_gap > current_minimum_gap:
                old_x = deepcopy(cur_group_member.x)
                cur_group_member.x = cur_min_x + max(prev_label_width, minimum_gap)
                reducable = True
                # update the x coord of group members that have the same x as the current
                for j in range(i + 1, len(group_members)):
                    following_id = group_members[j]
                    following_group_member = self.get_group_member(following_id)
                    # following_group_member.x +=change_x
                    if following_group_member.x == old_x:
                        following_group_member.x = cur_group_member.x
        return reducable

    def can_be_scaled_down(self, minimum_gap):
        """
        method which scales down this ClusterNode and checks whether it still can be scaled down
        further
            Args:
                minimum_gap: int
                    the minimum vertical and horizontal space to maintain between any two nodes
        """
        reducable = False

        for node in self.get_group_members().values():
            if isinstance(node, ClusterNode):
                reducable = reducable or node.can_be_scaled_down(minimum_gap)
        reducable = (
            reducable
            or self.can_be_scaled_down_vertically(minimum_gap)
            or self.can_be_scaled_down_horizontally(minimum_gap)
        )
        self.tighten_boundaries(Cursor(margin=90))
        return reducable

    def finalise_members_dimensions_and_position(self):
        """
        Reduce the empty space in this ClusterNode's boundaries and recursively move its members
        nearer to the boundaries
        """
        for node in self.get_group_members().values():
            if isinstance(node, ClusterNode):
                node.finalise_members_dimensions_and_position()
        self.finalise_dimension_and_position(Cursor(margin=30))

    def set_group_members_drawn(self):
        """
        set _group_members_drawn to True
        """
        self._group_members_drawn = True

    def set_children_layer_recursive(self, start_layer=None):
        """
        set all this node's group members' layers
            Args
                start_layer: int
                    will not be None if this method is called from a parent
        """
        if start_layer:
            self.set_layer(self._parent_group_node._layer - 1)
        for node_id in self.get_group_members():
            self.get_group_member(node_id).set_children_layer_recursive(
                start_layer=self._layer
            )

    def set_group_members_absolute_position_recursive(
        self, change_x_absolute=0, change_y_absolute=0, initial=True
    ):
        """
        Modify group members' absolute positions
            Args:
                change_x_absolute: int
                    the amount to change this ClusterNode's x_absolute property by
                change_y_absolute: int
                    the amount to change this ClusterNode's y_absolute property by
                initial: bool
                    set to True if this is the start of the recursion
        """
        if initial:
            self.x_absolute += change_x_absolute
            self.y_absolute += change_y_absolute
        for group_member in self.get_group_members().values():
            group_member.set_group_members_absolute_position_recursive(
                change_x_absolute, change_y_absolute
            )

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

    def set_group_member_z_index_recursive(self, z_index: int = 0):
        """
        Modify group members' zIndex.
            Args:
                z_index: int
                    the zIndex to use for this node
        """
        z_index += 1
        self.zIndex = z_index
        for group_member in self.get_group_members().values():
            group_member.set_group_member_z_index_recursive(z_index)
        z_index -= 1

    def set_group_member_position_recursive(self, cursor: Cursor):
        """
        Modify the group members' positions using a Cursor object
            Args
                cursor: Cursor
                    the Cursor whose position is used for this ClusterNode
        """
        if self.is_drawn_inside_group() is False:
            # set the node position according to cursor
            cursor.add_margin_top()
            cursor.add_margin_left()
            self.set_position(cursor)
        elif self.has_group_members() is False:
            return
        # set the cursor position back to origin since we are in a new parent group now
        cursor.set_x(0)
        cursor.set_y(0)
        for group_member in self.get_group_members().values():
            current_x, current_y = deepcopy(cursor.get_position())
            if group_member.is_drawn_inside_group() or (
                isinstance(group_member, ClusterNode)
                and group_member.group_members_drawn()
            ):
                continue
            group_member.set_group_member_position_recursive(cursor)
            cursor.set_x(current_x)
            cursor.set_y(current_y)

            cursor.move_right(group_member.width)

        self.set_group_members_drawn()
        self.set_drawn_inside_group()

    def set_target_absolute_position_recursive(
        self, change_x_absolute=0, change_y_absolute=0, initial=False
    ):
        """
        set this node's position according to its source's position
        Args
            change_x_absolute: int
                the amount to change this node's x_absolute property by
            change_y_absolute: int
                the amount to change this node's y_absolute property by
        """
        if initial:
            self.x_absolute += change_x_absolute
            self.y_absolute += change_y_absolute
        self.set_group_members_absolute_position_recursive(
            change_x_absolute, change_y_absolute, initial=False
        )
        for target in self.get_targets().values():
            target.set_target_absolute_position_recursive(
                change_x_absolute, change_y_absolute, True
            )
