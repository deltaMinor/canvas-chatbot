import copy
import xml.etree.ElementTree as ET

from service.lib.diagram_generator_from_xml.xml_mapping import (
    CLUSTER_NODE_BACKGROUND_COLOR,
    CLUSTER_NODE_BORDER_COLOR,
    CLUSTER_NODE_BORDER_STYLE,
    MXGRAPH_TO_CLUSTER_ICON_MAPPING,
    MXGRAPH_TO_ICON_MAPPING,
    MXGRAPH_TO_LABEL_MAPPING,
)

from shared_libs.constants.diagram import (
    DEFAULT_EDGE,
    DEFAULT_ICON_NODE_HEIGHT,
    DEFAULT_ICON_NODE_WIDTH,
    DEFAULT_NODE,
    MAX_HEIGHT_CLUSTER_NODE,
    MAX_WIDTH_CLUSTER_NODE,
    MIN_HEIGHT_CLUSTER_NODE,
    MIN_WIDTH_CLUSTER_NODE,
)
from shared_libs.types.enum import CanvasEdgeType, CanvasNodeType, CanvasNodeVariantType


class DiagramGeneratorFromXML:
    def __init__(
        self,
        xml_string: str,
    ):
        """
        Generate React Flow Diagram from XML data

        Args:
            xml_string: XML data in string format
        """
        self.xml_root = ET.fromstring(xml_string)
        self.json_output = {
            "nodes": [],
            "edges": [],
            "viewport": {"x": 0, "y": 0, "zoom": 1},
        }
        self.nodes = []
        self.edges = []

    def _get_node_position(self, cell: ET.Element):
        geometry = cell.find("mxGeometry")
        x = 0
        y = 0
        height = MIN_HEIGHT_CLUSTER_NODE
        width = MIN_WIDTH_CLUSTER_NODE

        if geometry is not None:
            x = float(geometry.get("x", 0))
            y = float(geometry.get("y", 0))
            height = max(float(geometry.get("height", 0)), MIN_HEIGHT_CLUSTER_NODE)
            width = max(float(geometry.get("width", 0)), MIN_WIDTH_CLUSTER_NODE)

        return x, y, height, width

    def _create_cluster_node(
        self,
        cell: ET.Element,
        node_id: str,
        parent_id: str,
        node_label: str,
        style_dict: dict,
    ) -> dict:
        x, y, height, width = self._get_node_position(cell)
        node_icon = MXGRAPH_TO_CLUSTER_ICON_MAPPING.get(
            style_dict.get("grIcon", ""), ""
        )
        border_color = CLUSTER_NODE_BORDER_COLOR.get(node_icon, "unset")
        background_color = CLUSTER_NODE_BACKGROUND_COLOR.get(node_icon, "unset")
        border_style = CLUSTER_NODE_BORDER_STYLE.get(node_icon, "solid")

        node = copy.deepcopy(DEFAULT_NODE)
        node.update(
            {
                "data": {
                    "class": "",
                    "icon": node_icon,
                    "icon_position": "top-left",
                    "label": node_label,
                    "type": CanvasNodeType.architecture.value,
                },
                "dragHandle": ".ClusterNode_DragHandle",
                "id": node_id,
                "parentId": parent_id,
                "position": {"x": x, "y": y},
                "height": height,
                "width": width,
                "style": {
                    "backgroundColor": background_color,
                    "borderColor": border_color,
                    "borderStyle": border_style,
                    "borderWidth": "2px",
                    "height": height,
                    "keepAspectRatio": True,
                    "maxHeight": MAX_HEIGHT_CLUSTER_NODE,
                    "maxWidth": MAX_WIDTH_CLUSTER_NODE,
                    "minHeight": MIN_HEIGHT_CLUSTER_NODE,
                    "minWidth": MIN_WIDTH_CLUSTER_NODE,
                    "width": width,
                },
                "type": CanvasNodeVariantType.clusterNode.value,
            }
        )
        return node

    def _create_info_node(
        self,
        cell: ET.Element,
        node_id: str,
        parent_id: str,
        node_label: str,
        style_dict: dict,
    ) -> dict:
        x, y, _, _ = self._get_node_position(cell)
        node_icon = MXGRAPH_TO_ICON_MAPPING.get(style_dict.get("resIcon", ""), "")
        # For icons like internet gateway
        if not node_icon:
            node_icon = MXGRAPH_TO_ICON_MAPPING.get(style_dict.get("shape", ""), "")
        if not node_label:
            node_label = MXGRAPH_TO_LABEL_MAPPING.get(node_icon)

        node = copy.deepcopy(DEFAULT_NODE)
        node.update(
            {
                "data": {
                    "class": "",
                    "icon": node_icon,
                    "label": node_label,
                    "type": CanvasNodeType.architecture.value,
                },
                "id": node_id,
                "parentId": parent_id,
                "position": {"x": x, "y": y},
                "style": {
                    "height": DEFAULT_ICON_NODE_HEIGHT,
                    "width": DEFAULT_ICON_NODE_WIDTH,
                },
                "type": CanvasNodeVariantType.infoNode.value,
            }
        )
        return node

    def _create_node(self, cell: ET.Element) -> dict:
        node_id = cell.get("id", "")
        parent_id = cell.get("parent", "")
        if parent_id == "1":
            parent_id = ""

        node_label = cell.get("value", "")

        style = cell.get("style", "")
        style_dict = {}
        for item in style.split(";"):
            if "=" in item:
                key, value = item.split("=", 1)
                style_dict[key] = value

        is_container = style_dict.get("container") == "1"
        if is_container:
            return self._create_cluster_node(
                cell, node_id, parent_id, node_label, style_dict
            )
        else:
            return self._create_info_node(
                cell, node_id, parent_id, node_label, style_dict
            )

    def _create_edge(self, cell: ET.Element) -> dict:
        edge_id = cell.get("id", "")
        source_id = cell.get("source", "")
        target_id = cell.get("target", "")

        style = cell.get("style", "")
        style_dict = {}
        for item in style.split(";"):
            if "=" in item:
                key, value = item.split("=", 1)
                style_dict[key] = value

        start_arrow = style_dict.get("startArrow")
        end_arrow = style_dict.get("endArrow")
        bidirectional = False
        # Bidirectional edge has start arrow
        if start_arrow or end_arrow:
            bidirectional = True

        edge = copy.deepcopy(DEFAULT_EDGE)
        edge.update(
            {
                "id": edge_id,
                "source": source_id,
                "target": target_id,
                "data": {
                    "type": CanvasEdgeType.architecture.value,
                    "bidirectional": bidirectional,
                },
            }
        )
        if bidirectional:
            edge["markerStart"] = {"type": "arrowclosed", "color": "black"}
        return edge

    def _add_all_nodes_and_edges(self):
        """
        Recursively create and store all node objects
        """
        for cell in self.xml_root.findall(".//mxCell"):
            if cell.get("vertex") == "1":
                node = self._create_node(cell)
                self.nodes.append(node)
            if cell.get("edge") == "1":
                edge = self._create_edge(cell)
                self.edges.append(edge)

    def start_diagram_generation_workflow(self):
        """
        Start diagram generation workflow
        """
        self._add_all_nodes_and_edges()
        self.json_output["nodes"] = self.nodes
        self.json_output["edges"] = self.edges

    def get_generated_diagram(self) -> dict:
        """
        Return generated react flow diagram

        Returns:
            dict: React flow diagram generated
        """
        self.start_diagram_generation_workflow()
        return self.json_output
