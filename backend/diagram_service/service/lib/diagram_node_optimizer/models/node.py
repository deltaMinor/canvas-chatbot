from __future__ import annotations

import math
from copy import deepcopy

from service.lib.diagram_node_util.node_colour_util import NodeColourUtil

from .cursor import Cursor
from .node_properties import NodeProperties


class Node(NodeProperties):
    def __init__(self, node_data: dict):
        super().__init__(node_data)

        # attribute if the node has a parent group
        self._parent_group_node: Node = None
        self._parent_group_node_id: str = node_data.get("parentId")

        # determines how many nested groups this node belongs to
        self._layer: int = 0

        # dict of sources and targets
        self._targets: dict[str, Node] = {}
        self._sources: dict[str, Node] = {}

        #
        self.x = 0
        self.y = 0
        self.x_absolute = 0
        self.y_absolute = 0

    def has_sources(self) -> bool:
        """
        Returns
            param: bool
                true if this node has source nodes, otherwise false
        """
        return len(self._sources) > 0

    def has_targets(self) -> bool:
        """
        Returns
            param:bool
                true if this node has target nodes, otherwise false
        """
        return len(self._targets) > 0

    def should_have_parent_group(self) -> bool:
        """
        Returns
            param: bool
                true if this node's _parent_group_node_id is a string, false otherwise
        """
        return isinstance(self._parent_group_node_id, str)

    def has_parent_group(self) -> bool:
        """
        Returns
            param: bool
                true if this node's _parent_group_node is a Node object, false otherwise
        """
        return isinstance(self._parent_group_node, Node)

    def has_siblings(self) -> bool:
        """
        Returns
            param: bool
                true if this node's parent has more than one child node.
        """
        if (
            self.has_parent_group()
            and len(self.get_parent_group_node().get_group_members()) > 1
        ):
            return True
        return False

    def targets_drawn(self) -> bool:
        """
        Returns
            param: bool
                true if all of this node's targets' positions have been set
        """
        return self._targets_drawn

    def is_drawn_inside_group(self) -> bool:
        """
        Returns
            param: bool
                true if this node's absolute position is within the parent's boundaries
        """
        return self._drawn_inside_group

    def is_drawn_below_sources(self) -> bool:
        """
        Returns
            param: bool
                true if this node is below all of its source nodes
        """
        return self._drawn_below_sources

    def get_id(self) -> str:
        """
        Returns
            param: str
                the node's unique id.
        """
        return self._id

    def get_layer(self) -> int | None:
        """
        Returns
            param: int
                the node's layer
        """
        return self._layer

    def get_parent_group_node_id(self) -> str | None:
        """
        Returns
            param: bool
                the node parent's id.
        """
        return self._parent_group_node_id

    def get_label_width(self) -> int:
        """
        Returns:
            param: int
                the width of the node label string in pixels
        """
        char_width = 7.2
        raw_width = len(self.label) * char_width + 22.5
        label_width = math.ceil(raw_width / 10) * 10
        return label_width

    def get_parent_group_node(self) -> Node | None:
        """
        Returns
            param: Node
                the parent instance for this node.
        """
        return self._parent_group_node

    def get_ancestor_node(self, node_id) -> Node | None:
        """
        Args
            node_id: str
                the id of the ancestor node whose instance is being searched for
        Returns
            param: Node
                the instance of the ancestor node being searched for
        Raises
            error: NameError
                if the node has no ancestor node with this id.
        """
        ancestor_node = self.get_parent_group_node()
        while ancestor_node and ancestor_node.get_id() != node_id:
            ancestor_node = ancestor_node.get_parent_group_node()
        if not ancestor_node:
            raise NameError(f"node {self.get_id()} has no ancestor {node_id}")
        return ancestor_node

    def get_siblings(self) -> list[Node] | None:
        """
        Returns
            param: list[Node]
                list of nodes with the same parent node as this one.
        """
        if self.has_siblings():
            return self.get_parent_group_node().get_group_members()
        else:
            return None

    def get_sources(self) -> dict[str, Node]:
        """
        Returns
            param: dict[str,Node]
                dict of this node's source nodes, key is id and value is Node instance
        """
        return self._sources

    def get_source(self, node_id) -> Node | None:
        """
        Args
            node_id: str
                the id of the source node being searched for
        Returns
            param: Node
                the instance of the source Node with the id in the args
        """
        return self._sources.get(node_id)

    def get_targets(self) -> dict[str, Node]:
        """
        Returns
            param: dict[str,Node]
                dict of this node's target nodes, key is id and value is Node instance
        """
        return self._targets

    def get_target(self, node_id) -> Node | None:
        """
        Returns
            param: Node
                the instance of the target Node with the id in the args
        """
        return self._targets.get(node_id)

    def set_parent_group(self, parent_group_node):
        """
        Args
            parent_group_node: ClusterNode
                set this node's _parent_group_node property while also adding this node to the
                _parent_group_node's group members list
        """
        self._parent_group_node = parent_group_node
        self._parent_group_node.add_group_member(self)

    def set_drawn_inside_group(self):
        """
        Set this node's _drawn_inside_group property to True
        """
        self._drawn_inside_group = True

    def set_targets_drawn(self):
        """
        Set this node's _targets_drawn property to True
        """
        self._targets_drawn = True

    def add_source(self, source: Node):
        """
        Args
            source: Node
                the source node to add to this node's _sources list property
        """
        self._sources[source.get_id()] = source

    def add_target(self, target: Node):
        """
        Args
            target: Node
                the target node to add to this node's _targets list property
        """
        self._targets[target.get_id()] = target

    def set_parent_layer(self, start_layer):
        """
        Recursive method to set parent layers according to group member layers.
        Args
            start_layer: int
                the layer to compare this node's _layer property to
                if start_layer > self._layer, set self._layer to be start_layer
        """
        self.set_layer(start_layer + 1)
        if self.has_parent_group():
            self._parent_group_node.set_parent_layer(start_layer=self.get_layer())

    def set_sibling_layer(self, sibling_node: Node):
        """
        Args
            sibling_node: Node
                the node to compare this node's layer to
        """
        self.set_layer(sibling_node.get_layer())

    def set_layer(self, new_layer):
        """
        Args
            new_layer: int
                the layer to compare self._layer to. If new_layer > self._layer, use new_layer as
                self._layer.
        """
        self._layer = max(self._layer, new_layer)

    def set_position(self, cursor: Cursor):
        """
        Set this node's position using a Cursor object
        Args
            cursor: Cursor
                the cursor to use for this node's position
        """
        self.x = cursor.x
        self.y = cursor.y

    def set_absolute_position_from_position(self):
        """
        use x and y properties of parent node to set x_absolute and y_absolute of this node
        """
        x_offset = 0
        y_offset = 0
        parent = self.get_parent_group_node()
        while parent:
            x_offset += parent.x
            y_offset += parent.y
            parent = parent.get_parent_group_node()
        self.x_absolute = self.x + x_offset
        self.y_absolute = self.y + y_offset

    def set_position_from_absolute_position(self):
        """
        use parent node's absolute position to set this node's position
        """
        if self.has_parent_group():
            self.x = self.x_absolute - self.get_parent_group_node().x_absolute
            self.y = self.y_absolute - self.get_parent_group_node().y_absolute
        else:
            self.x = self.x_absolute
            self.y = self.y_absolute

    def get_furthest_uncommon_ancestors(
        self,
        source: Node,
    ) -> tuple[Node, Node] | None:
        """
        find the furthest ancestor of this node and the furthest ancestor of its source which share
        a common parent if self id is a, and source id is e, and self ancestor path is a-b-c-d and
        source_ancestor path is e-f-c-d, self_furthest_ancestor = b and source_furthest_ancestor = f
        """
        self_ancestor_ids = []
        source_ancestor_ids = []
        self_current_ancestor = self
        source_current_ancestor = source
        while self_current_ancestor:
            self_ancestor_ids.append(self_current_ancestor.get_id())
            self_current_ancestor = self_current_ancestor.get_parent_group_node()
        while source_current_ancestor:
            source_ancestor_ids.append(source_current_ancestor.get_id())
            source_current_ancestor = source_current_ancestor.get_parent_group_node()
        closest_common_ancestor_id = None
        for node_id in self_ancestor_ids:
            if node_id in source_ancestor_ids:
                closest_common_ancestor_id = node_id
                break
        if not closest_common_ancestor_id:
            return
        closest_common_ancestor = self.get_ancestor_node(closest_common_ancestor_id)
        self_furthest_uncommon_ancestor = self
        source_furthest_uncommon_ancestor = source
        while (
            self_furthest_uncommon_ancestor.get_parent_group_node()
            != closest_common_ancestor
        ):
            self_furthest_uncommon_ancestor = (
                self_furthest_uncommon_ancestor.get_parent_group_node()
            )
        while (
            source_furthest_uncommon_ancestor.get_parent_group_node()
            != closest_common_ancestor
        ):
            source_furthest_uncommon_ancestor = (
                source_furthest_uncommon_ancestor.get_parent_group_node()
            )
        if not self_furthest_uncommon_ancestor or not source_furthest_uncommon_ancestor:
            return self, source
        # return self_furthest_uncommon_ancestor,source_furthest_uncommon_ancestor
        return self, source

    def set_children_layer_recursive(
        self,
        start_layer=None,
    ):
        """
        set children nodes' layer according to parent's layer
        """
        if start_layer:
            self.set_layer(self._parent_group_node._layer - 1)

    def set_group_members_absolute_position_recursive(
        self,
        change_x_absolute=0,
        change_y_absolute=0,
        initial=True,
    ):
        """
        modify group members' absolute position according
            Args
                change_x_absolute: int
                    the amount to change this node's x_absolute property by
                change_y_absolute: int
                    the amount to change this node's y_absolute property by
                initial: bool
                    set to true if the recursion starts here.
        """
        if initial:
            self.x_absolute += change_x_absolute
            self.y_absolute += change_y_absolute

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
        set this node's zIndex, will be called from this node's parent instance
            Args
                z_index: int
                    the zIndex to use for this node
        """
        z_index += 1
        self.zIndex = z_index
        z_index -= 1

    def set_group_member_position_recursive(
        self,
        cursor: Cursor,
    ) -> None:
        """
        set this node's position according to parent's position, will be called from this node's
        parent instance
            Args
                cursor: Cursor
                    the cursor to use for this node's position
        """
        if self.is_drawn_inside_group() is False:
            # set the node position according to cursor
            cursor.add_margin_top()
            cursor.add_margin_left()
            self.set_position(cursor)
        # set the cursor position back to origin since we are in a new parent group now
        cursor.set_x(0)
        cursor.set_y(0)
        self.set_drawn_inside_group()

    def set_target_absolute_position_recursive(
        self,
        change_x_absolute=0,
        change_y_absolute=0,
        initial=False,
    ):
        """
        set this node's position according to its source's position
            Args
                change_x_absolute: int
                    the amount to change this node's and its targets' x_absolute property by
                change_y_absolute: int
                    the amount to change this node's and its targets' y_absolute property by
                initial: bool
                    set to true if the recursion starts here.
        """
        if initial:
            self.x_absolute += change_x_absolute
            self.y_absolute += change_y_absolute
        for target in self.get_targets().values():
            target.set_target_absolute_position_recursive(
                change_x_absolute, change_y_absolute, True
            )

    def move_related_nodes(
        self,
        change_x_absolute=0,
        change_y_absolute=0,
    ):
        """
        move all targets of this node
            Args
                change_x_absolute: int
                    the amount to change this node's targets' x_absolute property by
                change_y_absolute: int
                    the amount to change this node's targets' y_absolute property by
        """
        self.set_target_absolute_position_recursive(
            change_x_absolute, change_y_absolute, initial=True
        )

    # @raise_exception("Failed to set target positions recursively")
    def set_target_position_recursive(
        self,
        cursor: Cursor,
        source=None,
    ):
        """
        set target positions according to this node's absolute position, use absolute positions
        because there are cases where the source and target have different parent nodes, so simply
        using position would not be accurate.
        """
        if self.is_drawn_below_sources() is False and self.has_sources():
            if (
                source is None
            ):  # if this node has no sources, just use the cursor's position
                new_x_absolute = cursor.x
                new_y_absolute = max(cursor.y, self.y_absolute)
                self.x_absolute = new_x_absolute
                self.y_absolute = new_y_absolute
            else:  # if this node has sources, update its position according to source's position
                furthest_uncommon_ancestors = self.get_furthest_uncommon_ancestors(
                    source
                )
                if not furthest_uncommon_ancestors:
                    self_ancestor, source_ancestor = self, source
                else:
                    self_ancestor, source_ancestor = furthest_uncommon_ancestors
                # leave x coordinate unchanged
                new_x_absolute = self_ancestor.x_absolute
                # ensure this node's ancestor is at least under the current source
                new_y_absolute = max(
                    self_ancestor.y_absolute,
                    source_ancestor.y_absolute + source_ancestor.height + 80,
                )

                change_x_absolute = new_x_absolute - self_ancestor.x_absolute
                change_y_absolute = new_y_absolute - self_ancestor.y_absolute
                # move all of this node's ancestor's targets and group member positions
                self_ancestor.move_related_nodes(change_x_absolute, change_y_absolute)

        initial_x, initial_y = deepcopy(cursor.get_position())
        cursor.set_x(self.x_absolute)

        for target in self.get_targets().values():
            cursor.set_y(self.y_absolute + self.height + 60)
            target.set_target_position_recursive(cursor, source=self)
            cursor.move_right(target.width)

        cursor.set_x(initial_x)
        cursor.set_y(initial_y)
        self.set_targets_drawn()

    def __eq__(self, other):
        return isinstance(other, Node) and self.get_id() == other.get_id()

    def __str__(self):
        return f"node id:{self.get_id()}\n\
                 node width:{self.width}\n\
                 node height:{self.height}\n\
                 node x:{self.x}\n\
                 node y:{self.y}\n\
                 node targets:{[id for id in self.get_targets()]}\n\
                 node group members:{[id for id in self.get_group_member()]}"
