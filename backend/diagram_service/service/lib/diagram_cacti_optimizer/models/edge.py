from .edge_properties import EdgeProperties
from .node import Node


class Edge(EdgeProperties):
    def __init__(self, edge_id: str, source: Node, target: Node):
        super().__init__()
        self.source: Node = source
        self.target: Node = target
        self.id = edge_id
