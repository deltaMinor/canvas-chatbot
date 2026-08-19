import copy

from shared_libs.constants.diagram import DEFAULT_EDGE
from shared_libs.types.enum import CanvasEdgeType

from .node import CactiNode


class CactiEdge:
    def __init__(
        self,
        edge_id: str,
        json_data: dict,
        source_node: CactiNode,
        target_node: CactiNode,
    ):
        """
        stores data regarding a CACTi edge, and references to its source and target
        """
        self.json_data = json_data
        self.id = edge_id
        self.source = source_node
        self.target = target_node
        self.bidirectional = False

    def __dict__(self):
        edge_dict = copy.deepcopy(DEFAULT_EDGE)
        edge_dict.update(
            {
                "id": f"{self.source.id}-{self.target.id}",
                "source": f"{self.source.id}",
                "target": f"{self.target.id}",
                "data": {
                    "type": CanvasEdgeType.architecture.value,
                    "bidirectional": self.bidirectional,
                },
            }
        )
        if self.bidirectional:
            edge_dict["markerStart"] = {"type": "arrowclosed", "color": "black"}
        return edge_dict
