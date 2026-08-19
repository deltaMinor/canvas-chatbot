import logging

from service.lib.diagram_generator_from_cacti.react_flow.nodes import NODE_TYPES
from service.lib.diagram_node_util.node_position_util import NodePositionUtil
from service.lib.diagram_node_util.node_style_util import NodeStyleUtil

from shared_libs.decorators import raise_exception
from shared_libs.types.enum import NodeTypes

logger = logging.getLogger(__name__)


class NodeProperties(NodePositionUtil, NodeStyleUtil):
    """
    A class that contains all properties for a react flow node
    """

    def __init__(self, node_data: dict):
        """
        Args
            node_data: dict
                the data for this node taken from ReactJSON output
        """
        # attributes used by react Json output
        NodePositionUtil.__init__(self)
        NodeStyleUtil.__init__(self, node_data)

        # attributes for tracking relations
        self._id: str = node_data["id"]
        self._drawn: bool = False

        # ensure the node is within its parent group if it has one
        self._drawn_inside_group: bool = False

        # ensure the node has a lower y coordinate than all its sources
        self._drawn_below_sources: bool = False
        self._targets_drawn: bool = False
        self._group_members_drawn: bool = False

        #
        self.set_node_type(node_data)

    @raise_exception(
        "Failed to set node type.",
        exception_logger=logger,
    )
    def set_node_type(self, node_data):
        if node_data.get("data").get("class") in NODE_TYPES:
            self._node_type: NodeTypes = NODE_TYPES[node_data.get("data").get("class")]
        else:
            self._node_type: NodeTypes = NodeTypes.DEFAULT

    def set_drawn(self):
        self._drawn = True

    def is_drawn(self):
        return self._drawn
