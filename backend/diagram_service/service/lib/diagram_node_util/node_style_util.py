from shared_libs.constants.diagram import (
    DEFAULT_ICON_NODE_HEIGHT,
    DEFAULT_ICON_NODE_WIDTH,
)


class NodeStyleUtil:
    """
    A Class that contains the Node's style properties
    """

    def __init__(self, node_data: dict):
        """
        Args
            node_data: dict
                the dict for this node's properties taken from ReactJSON's output
        """
        self.width: int = node_data.get("style").get("width") or DEFAULT_ICON_NODE_WIDTH
        self.height: int = (
            node_data.get("style").get("height") or DEFAULT_ICON_NODE_HEIGHT
        )
        self.red: int = node_data.get("style").get("backgroundColor").get("red")
        self.green: int = node_data.get("style").get("backgroundColor").get("green")
        self.blue: int = node_data.get("style").get("backgroundColor").get("blue")
        self.zIndex: int = node_data.get("style").get("zIndex") or 1
        self.label: str = node_data.get("data").get("label") or "default label"
        self._type: str = node_data.get("type")
