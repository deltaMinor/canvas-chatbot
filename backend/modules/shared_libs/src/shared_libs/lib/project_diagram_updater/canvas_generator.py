import copy
import logging
import uuid
from typing import TYPE_CHECKING

from shared_libs.decorators import raise_exception
from shared_libs.models.base_models import CanvasBaseModel
from shared_libs.models.base_models.diagram import CanvasEdgeBaseModel

if TYPE_CHECKING:
    from shared_libs.models.database_models import ProjectADModel

HANDLE_SOURCE_PREFIX = "attack_source"
HANDLE_TARGET_PREFIX = "attack_target"

logger = logging.getLogger(__name__)


class CanvasGenerator:
    def __init__(self, project_ad_model: "ProjectADModel"):
        self.project_ad_model = project_ad_model

    @raise_exception(
        "Failed to get updated attack flow canvas views.",
        exception_logger=logger,
    )
    def process_scenario_canvases(
        self, canvases_to_add: list["CanvasBaseModel"]
    ) -> None:
        _nodes: list[dict] = [n.model_dump() for c in self.project_ad_model.canvas for n in c.nodes]

        self.new_edges = []
        self.node_id_pairs = []

        for canvas in canvases_to_add:
            attack_paths = canvas.ref.get("threat_scenario_ref", {}).get("attackPaths", [])
            updated_attack_paths = []
            all_attack_path_edges = []
            for attack_path in attack_paths:
                updated_attack_path_nodes = list(
                    dict.fromkeys(step.get("nodeId") for step in attack_path["steps"])
                )
                self.edge_canvas_type = canvas.canvas_type
                attack_path_edges = self.get_attack_path_edges(_nodes, attack_path)
                updated_attack_path = {
                    **attack_path,
                    "nodes": updated_attack_path_nodes,
                    "edges": attack_path_edges,
                }
                updated_attack_paths.append(updated_attack_path)
                all_attack_path_edges.extend(attack_path_edges)
            canvas.edges = [
                CanvasEdgeBaseModel.model_validate(e)
                for e in self.new_edges
                if e["id"] in all_attack_path_edges
            ]
            canvas.ref = {
                "threat_scenario_ref": {
                    **canvas.ref["threat_scenario_ref"],
                    "attackPaths": updated_attack_paths,
                }
            }
        return canvases_to_add

    @raise_exception("Failed to get attack path edges.", exception_logger=logger)
    def get_attack_path_edges(self, _nodes: list[dict], attack_path: dict):
        _dict = [
            {"node_id": obj["nodeId"], "step": obj["step"]}
            for obj in attack_path["steps"]
        ]
        node_ids = [item["node_id"] for item in sorted(_dict, key=lambda x: x["step"])]
        known_node_ids = {n["id"] for n in _nodes}
        node_id_pairs = [
            [n, node_ids[i + 1]]
            for i, n in enumerate(node_ids)
            if i + 1 < len(node_ids) and n != node_ids[i + 1]
        ]
        valid_pairs = [p for p in node_id_pairs if p[0] in known_node_ids and p[1] in known_node_ids]
        skipped = len(node_id_pairs) - len(valid_pairs)
        if skipped:
            logger.warning(
                "[ RR-DIAGRAM ] Skipped %d edge pair(s) — referenced node(s) not found in architecture canvas.",
                skipped,
            )
        node_id_pairs = valid_pairs
        new_node_id_pairs = [n for n in node_id_pairs if n not in self.node_id_pairs]
        self.node_id_pairs.extend(new_node_id_pairs)

        if new_node_id_pairs:
            new_edges = []
            for pair in new_node_id_pairs:
                sourceHandle, targetHandle = self.get_edge_handles(_nodes, pair)
                edge = {
                    "id": f"edge_{uuid.uuid4()}",
                    "source": pair[0],
                    "target": pair[1],
                    "sourceHandle": sourceHandle,
                    "targetHandle": targetHandle,
                    "type": "attackPath",
                    "data": {
                        "type": self.edge_canvas_type,
                        "bidirectional": False,
                    },
                    "style": {"strokeWidth": 2, "stroke": "#ff5722", "opacity": 1},
                    "markerEnd": {"color": "#ff5722", "type": "arrowclosed"},
                    "zIndex": 1,
                }
                new_edges.append(edge)
            self.new_edges.extend(new_edges)

        path_edges = []
        for pair in node_id_pairs:
            for edge in self.new_edges:
                if edge["source"] == pair[0] and edge["target"] == pair[1]:
                    path_edges.append(edge["id"])
        return path_edges

    @raise_exception(
        "Failed to compute node position recursively.",
        exception_logger=logger,
    )
    def compute_position_recursive(
        self,
        node: dict,
        nodes: list[dict],
        position_absolute: dict,
    ):
        parentId = node["parentId"]
        if not parentId:
            return
        parent_node = next((n for n in nodes if n["id"] == parentId), None)
        if not parent_node:
            raise Exception(f"Parent node with id {parentId} not found.")
        parent_position = parent_node["position"]
        position_absolute["x"] += parent_position["x"]
        position_absolute["y"] += parent_position["y"]
        self.compute_position_recursive(parent_node, nodes, position_absolute)

    @raise_exception(
        "Failed to compute node position absolute.", exception_logger=logger
    )
    def compute_position_absolute(self, node: dict, nodes: list[dict]):
        position_absolute = copy.deepcopy(node["position"])
        self.compute_position_recursive(node, nodes, position_absolute)
        return position_absolute

    @raise_exception("Failed to get attack flow edge handles.", exception_logger=logger)
    def get_edge_handles(self, nodes: list[dict], pair: list):
        src_node: dict = {}
        tgt_node: dict = {}
        for n in nodes:
            if n["id"] == pair[0]:
                src_node = n
                break
        for n in nodes:
            if n["id"] == pair[1]:
                tgt_node = n
                break
        if not src_node or not tgt_node:
            raise Exception("Source node or target node not found.")

        src_cardRefKey = src_node["data"].get("cardRefKey")
        tgt_cardRefKey = tgt_node["data"].get("cardRefKey")
        if src_cardRefKey == "card_users":
            return (f"{HANDLE_SOURCE_PREFIX}_left", f"{HANDLE_TARGET_PREFIX}_right")
        if tgt_cardRefKey == "card_users":
            return (f"{HANDLE_SOURCE_PREFIX}_right", f"{HANDLE_TARGET_PREFIX}_left")

        src_node_pos = self.compute_position_absolute(src_node, nodes)
        tgt_node_pos = self.compute_position_absolute(tgt_node, nodes)
        src_width = src_node["style"]["width"]
        src_height = src_node["style"]["height"]
        x_axis_diff = src_node_pos["x"] - tgt_node_pos["x"]
        y_axis_diff = src_node_pos["y"] - tgt_node_pos["y"]
        src_handle_pos = "left"
        tgt_handle_pos = "right"

        if abs(x_axis_diff) < src_width:
            src_handle_pos = "top" if y_axis_diff > 0 else "bottom"
            tgt_handle_pos = "bottom" if y_axis_diff > 0 else "top"
        elif abs(y_axis_diff) < src_height:
            src_handle_pos = "left" if x_axis_diff > 0 else "right"
            tgt_handle_pos = "right" if x_axis_diff > 0 else "left"
        else:
            src_handle_pos = "top" if y_axis_diff > 0 else "bottom"
            tgt_handle_pos = "right" if x_axis_diff > 0 else "left"

        if src_cardRefKey == "card_interface":
            src_handle_pos = "left"

        return (
            f"{HANDLE_SOURCE_PREFIX}_{src_handle_pos}",
            f"{HANDLE_TARGET_PREFIX}_{tgt_handle_pos}",
        )
