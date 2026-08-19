from service.lib.diagram_node_util.node_position_util import NodePositionUtil
from service.lib.diagram_node_util.node_style_util import NodeStyleUtil


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

        # ensure the node is within its parent group if it has one
        self._drawn_inside_group: bool = False

        # ensure the node has a lower y coordinate than all its sources
        self._drawn_below_sources: bool = False
        self._targets_drawn: bool = False
        self._group_members_drawn: bool = False
