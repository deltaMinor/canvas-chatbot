from .node import Node


class Edge:
    def __init__(self, id: str, source: Node, target: Node):
        self.source: Node = source
        self.target: Node = target
        self.id = id
