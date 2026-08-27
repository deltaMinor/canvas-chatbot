import copy
import logging
import uuid

from shared_libs.constants.diagram import (
    DATA_FLOW_DEVICE_NODE_TOSCA_TYPE,
    DATA_FLOW_INTERFACE_NODE_TOSCA_TYPE,
    DATA_FLOW_USER_NODE_TOSCA_TYPE,
    DEFAULT_CLUSTER_NODE_HEIGHT,
    DEFAULT_CLUSTER_NODE_WIDTH,
    DEFAULT_EDGE,
    DEFAULT_ICON_NODE_HEIGHT,
    DEFAULT_ICON_NODE_WIDTH,
    MAX_HEIGHT_CLUSTER_NODE,
    MAX_WIDTH_CLUSTER_NODE,
    MIN_HEIGHT_CLUSTER_NODE,
    MIN_WIDTH_CLUSTER_NODE,
)
from shared_libs.decorators import raise_exception
from shared_libs.models.base_models import CanvasNodeBaseModel
from shared_libs.models.diagram_layout_hints import (
    DiagramLayoutHints,
    LayoutBbox,
)
from shared_libs.types.enum import (
    CanvasEdgeType,
    CanvasNodeType,
    CanvasNodeVariantType,
    Handle,
    Position,
)
from shared_libs.utils.diagram_anchor_util import DiagramAnchorUtil

logger = logging.getLogger(__name__)


class DiagramOutputParser:
    DEDUPE_CONFIDENCE_THRESHOLD = 0.7
    GLOBAL_SERVICE_ICONS = {"route53", "cloudfront", "internet"}

    def __init__(self):
        pass

    @staticmethod
    def _normalize_text(value: str) -> str:
        return (value or "").strip().lower()

    @staticmethod
    def _parent_key(node: dict) -> str:
        return (node.get("parentId") or "").strip()

    @staticmethod
    def _node_confidence(node: dict) -> float:
        raw_confidence = node.get("confidence")
        if raw_confidence is None and isinstance(node.get("data"), dict):
            raw_confidence = node.get("data", {}).get("confidence")
        try:
            if not isinstance(raw_confidence, (int, float, str)):
                raise TypeError
            confidence = float(raw_confidence)
        except (TypeError, ValueError):
            confidence = 0.5
        return max(0.0, min(1.0, confidence))

    def _choose_preferred_node(self, current_node: dict, incoming_node: dict) -> dict:
        current_conf = self._node_confidence(current_node)
        incoming_conf = self._node_confidence(incoming_node)
        if incoming_conf > current_conf:
            return incoming_node
        return current_node

    def _prevalidate_diagram_output(self, llm_output: dict) -> dict:
        nodes = llm_output.get("nodes", [])
        edges = llm_output.get("edges", [])

        deduped_nodes: list[dict] = []
        by_identity: dict[tuple[str, str, str], dict] = {}
        by_global_scope: dict[tuple[str, str], dict] = {}
        replaced_id_map: dict[str, str] = {}
        index_by_node_id: dict[str, int] = {}

        for node in nodes:
            if not isinstance(node, dict):
                continue
            node_id = node.get("id")
            if not node_id:
                continue

            data = node.get("data") or {}
            icon = self._normalize_text(data.get("icon", ""))
            label = self._normalize_text(data.get("label", ""))
            parent = self._parent_key(node)
            confidence = self._node_confidence(node)
            identity_key = (icon, label, parent)

            existing = by_identity.get(identity_key)
            if existing is not None:
                preferred = self._choose_preferred_node(existing, node)
                by_identity[identity_key] = preferred
                preferred_id = preferred.get("id")
                existing_id = existing.get("id")
                if preferred_id and existing_id and preferred_id != existing_id:
                    replaced_id_map[existing_id] = preferred_id
                    existing_index = index_by_node_id.get(existing_id)
                    if existing_index is not None:
                        deduped_nodes[existing_index] = preferred
                        index_by_node_id.pop(existing_id, None)
                        index_by_node_id[preferred_id] = existing_index
                replaced_id_map[node_id] = preferred.get("id", node_id)
                continue

            if icon in self.GLOBAL_SERVICE_ICONS:
                global_key = (icon, parent)
                global_existing = by_global_scope.get(global_key)
                if (
                    global_existing is not None
                    and confidence < self.DEDUPE_CONFIDENCE_THRESHOLD
                ):
                    replaced_id_map[node_id] = global_existing.get("id", node_id)
                    continue
                if global_existing is not None:
                    preferred = self._choose_preferred_node(global_existing, node)
                    by_global_scope[global_key] = preferred
                    if preferred.get("id") != global_existing.get("id"):
                        global_existing_id = global_existing.get("id")
                        preferred_id = preferred.get("id")
                        if isinstance(global_existing_id, str) and isinstance(
                            preferred_id, str
                        ):
                            replaced_id_map[global_existing_id] = preferred_id
                        global_existing_index = (
                            index_by_node_id.get(global_existing_id)
                            if isinstance(global_existing_id, str)
                            else None
                        )
                        if (
                            global_existing_index is not None
                            and preferred_id
                            and global_existing_id
                        ):
                            deduped_nodes[global_existing_index] = preferred
                            index_by_node_id.pop(global_existing_id, None)
                            index_by_node_id[preferred_id] = global_existing_index
                    else:
                        replaced_id_map[node_id] = preferred.get("id", node_id)
                    by_identity[identity_key] = preferred
                    continue
                by_global_scope[global_key] = node

            by_identity[identity_key] = node
            index_by_node_id[node_id] = len(deduped_nodes)
            deduped_nodes.append(node)

        kept_ids = {n.get("id") for n in deduped_nodes}
        deduped_edges: list[dict] = []
        seen_edges: set[tuple[str, str]] = set()
        for edge in edges:
            if not isinstance(edge, dict):
                continue
            source_raw = edge.get("source")
            target_raw = edge.get("target")
            if not isinstance(source_raw, str) or not isinstance(target_raw, str):
                continue
            source = replaced_id_map.get(source_raw, source_raw)
            target = replaced_id_map.get(target_raw, target_raw)
            if not source or not target or source == target:
                continue
            if source not in kept_ids or target not in kept_ids:
                continue
            edge_key = (source, target)
            if edge_key in seen_edges:
                continue
            seen_edges.add(edge_key)
            updated_edge = dict(edge)
            updated_edge["source"] = source
            updated_edge["target"] = target
            deduped_edges.append(updated_edge)

        return {
            "nodes": deduped_nodes,
            "edges": deduped_edges,
        }

    @raise_exception(
        "Failed to merge layout hints into diagram output.",
        exception_logger=logger,
    )
    def _merge_with_layout_hints(
        self,
        llm_output: dict,
        layout_hints: dict | None = None,
    ) -> dict:
        if not layout_hints:
            return llm_output

        hints_model = DiagramLayoutHints(**layout_hints)
        image_width = hints_model.image.width
        image_height = hints_model.image.height
        hint_nodes = hints_model.nodes + hints_model.containers
        if not hint_nodes:
            return llm_output

        by_hint_id = {hint.hint_id: hint for hint in hint_nodes if hint.hint_id}

        for node in llm_output.get("nodes", []):
            if not isinstance(node, dict):
                continue
            data = node.get("data") or {}
            layout_hint_id = node.get("layout_hint_id") or data.get("layout_hint_id")
            matched_hint = by_hint_id.get(str(layout_hint_id or "").strip())

            if matched_hint is None:
                icon = self._normalize_text(data.get("icon", ""))
                label = self._normalize_text(data.get("label", ""))
                for candidate in hint_nodes:
                    candidate_icon = self._normalize_text(candidate.icon_guess)
                    candidate_label = self._normalize_text(candidate.label_text)
                    if candidate_icon and candidate_icon == icon:
                        matched_hint = candidate
                        break
                    if candidate_label and candidate_label == label:
                        matched_hint = candidate
                        break

            if matched_hint is None:
                continue

            anchor = DiagramAnchorUtil.normalize_to_canvas_anchor(
                image_width=image_width,
                image_height=image_height,
                bbox=matched_hint.bbox if matched_hint.bbox else LayoutBbox(),
                canvas_width=2000,
                canvas_height=1200,
                confidence=matched_hint.confidence,
            )
            node["position"] = {"x": int(anchor.x), "y": int(anchor.y)}
            node["width"] = int(anchor.width)
            node["height"] = int(anchor.height)
            node["layout_lock"] = anchor.layout_lock
            node["layout_confidence"] = anchor.confidence

        return llm_output

    @raise_exception(
        "Failed to parse llm topology output.",
        exception_logger=logger,
    )
    def parse_diagram_output(
        self,
        llm_output: dict,
        enumerated_tosca_mapping: dict,
        layout_hints: dict | None = None,
    ):
        logger.info("[ RR-LLM ] Parsing llm topology generation output...")
        llm_output = self._prevalidate_diagram_output(llm_output=llm_output or {})
        llm_output = self._merge_with_layout_hints(
            llm_output=llm_output,
            layout_hints=layout_hints,
        )

        # =============================================
        # parse nodes
        # =============================================
        _nodes = llm_output.get("nodes", None)
        node_mapping = {}
        nodes = []
        if _nodes is not None:
            node_mapping = {node["id"]: f"node_{str(uuid.uuid4())}" for node in _nodes}

            for node in _nodes:
                # node id
                llm_node_id = node["id"]
                # data
                data_icon = node.get("data", {}).get("icon", "")
                data_label = node.get("data", {}).get("label", "")
                # type
                node_type = (
                    node["type"]
                    if node["type"]
                    in [
                        CanvasNodeVariantType.infoNode.value,
                        CanvasNodeVariantType.clusterNode.value,
                    ]
                    else CanvasNodeVariantType.infoNode.value
                )
                # parent id
                llm_parentId = node.get("parentId", "")
                parentId = node_mapping.get(llm_parentId, "")
                # position
                position = node.get("position", {"x": "150", "y": "50"})
                zIndex = node.get("zIndex", 1)
                # dimensions
                height = (
                    DEFAULT_ICON_NODE_HEIGHT
                    if node_type == CanvasNodeVariantType.infoNode.value
                    else node.get("height", DEFAULT_CLUSTER_NODE_HEIGHT)
                )
                width = (
                    DEFAULT_ICON_NODE_WIDTH
                    if node_type == CanvasNodeVariantType.infoNode.value
                    else node.get("width", DEFAULT_CLUSTER_NODE_WIDTH)
                )
                # data
                data = {
                    "icon": data_icon,
                    "label": data_label,
                    "tosca_type": enumerated_tosca_mapping.get(data_icon, ""),
                    "type": CanvasNodeType.architecture.value,
                }

                new_node_model = CanvasNodeBaseModel(
                    id=node_mapping[llm_node_id],
                    parentId=parentId,
                    position=position,
                    type=node_type,
                    width=width,
                    height=height,
                    data=data,
                    targetPosition=Position.top.value,
                    sourcePosition=Position.bottom.value,
                )

                # cluster node
                if new_node_model.type == CanvasNodeVariantType.clusterNode.value:
                    new_node_model.dragHandle = ".ClusterNode_DragHandle"
                    new_node_model.style = {
                        "backgroundColor": "unset",
                        "borderStyle": "solid",
                        "borderWidth": "2px",
                        "height": new_node_model.height,
                        "maxHeight": MAX_HEIGHT_CLUSTER_NODE,
                        "maxWidth": MAX_WIDTH_CLUSTER_NODE,
                        "minHeight": MIN_HEIGHT_CLUSTER_NODE,
                        "minWidth": MIN_WIDTH_CLUSTER_NODE,
                        "opacity": 1,
                        "width": new_node_model.width,
                    }
                if new_node_model.type == CanvasNodeVariantType.infoNode.value:
                    new_node_model.style = {
                        "height": new_node_model.height,
                        "width": new_node_model.width,
                        "opacity": 1,
                    }

                new_node = new_node_model.model_dump()

                # overwrite model validation value of zIndex
                new_node["zIndex"] = zIndex

                nodes.append(new_node)

        # =============================================
        # parse edges
        # =============================================
        _edges = llm_output.get("edges", None)
        edges = []
        if _edges is not None:
            for _edge in _edges:
                _source = _edge.get("source", None)
                _target = _edge.get("target", None)
                if _source is None or _target is None:
                    continue
                source = node_mapping.get(_source, None)
                target = node_mapping.get(_target, None)
                if source and target:
                    edge = copy.deepcopy(DEFAULT_EDGE)
                    edge.update(
                        {
                            "id": f"edge_{str(uuid.uuid4())}",
                            "source": source,
                            "target": target,
                            "sourceHandle": Handle.SOURCE_RIGHT.value,
                            "targetHandle": Handle.TARGET_LEFT.value,
                            "data": {
                                "type": CanvasEdgeType.architecture.value,
                                "bidirectional": False,
                            },
                        }
                    )
                    edges.append(edge)

        # =============================================
        # result
        # =============================================
        diagram_results = {
            "nodes": nodes,
            "edges": edges,
        }

        return diagram_results

    @raise_exception(
        "Failed to infer node while parsing llm output.",
        exception_logger=logger,
    )
    def infer_node(
        self, currentValue: str, infer_key: str, nodes: list[dict], card: dict
    ):
        tosca = {
            "users": DATA_FLOW_USER_NODE_TOSCA_TYPE,
            "devices": DATA_FLOW_DEVICE_NODE_TOSCA_TYPE,
            "interfaces": DATA_FLOW_INTERFACE_NODE_TOSCA_TYPE,
        }

        infered_nodes = {
            n["value"]: n["id"] for n in nodes if n["tosca_type"] == tosca[infer_key]
        }
        inferred_values = infered_nodes.keys()

        card_values = card[infer_key]

        found_user_value = next((v for v in inferred_values if v in card_values), None)
        if found_user_value:
            source = infered_nodes[found_user_value]
            return source
        return currentValue

    @raise_exception(
        "Failed to parse llm dataflow generation output.",
        exception_logger=logger,
    )
    def infer_key_from_value(self, value: str) -> str:
        if "user" in value:
            return "users"
        if "device" in value:
            return "devices"
        if "interface" in value:
            return "interfaces"
        return ""

    @raise_exception(
        "Failed to parse llm dataflow generation output.",
        exception_logger=logger,
    )
    def parse_dataflow_output(
        self, llm_output: dict, project_input_model: dict, card_id: str
    ):
        logger.info("[ RR-LLM ] Parsing llm dataflow generation output...")

        result = {"nodes_data_stored": {}, "edges": []}

        card = next(
            (c for c in project_input_model["user_stories"] if c["id"] == card_id), {}
        )

        vertices = project_input_model["dataflow"]["vertices"]
        vertices_id = [_["id"] for _ in vertices]
        all_data = [_["name"] for _ in project_input_model["data"] if "name" in _]

        _nodes = llm_output.get("nodes", [])
        _edges = llm_output.get("edges", [])

        if not len(_edges):
            return result

        for _node in _nodes:
            data_stored = _node.get("data", {}).get("data_stored", [])
            data_stored = [_ for _ in data_stored if _ in all_data]
            if _node["id"] not in vertices_id or len(data_stored) == 0:
                continue
            result["nodes_data_stored"][_node["id"]] = data_stored

        for edge in _edges:
            data = edge["data"]
            source = data["source"]
            target = data["target"]

            source_infer_key = self.infer_key_from_value(source)
            target_infer_key = self.infer_key_from_value(target)

            if source_infer_key:
                source = self.infer_node(
                    currentValue=source,
                    infer_key=source_infer_key,
                    nodes=vertices,
                    card=card,
                )
            if target_infer_key:
                target = self.infer_node(
                    currentValue=source,
                    infer_key=target_infer_key,
                    nodes=vertices,
                    card=card,
                )

            if source in vertices_id and target in vertices_id:
                edge = copy.deepcopy(DEFAULT_EDGE)
                edge.update(
                    {
                        "id": f"edge_{str(uuid.uuid4())}",
                        "source": source,
                        "target": target,
                        "sourceHandle": Handle.SOURCE_RIGHT.value,
                        "targetHandle": Handle.TARGET_LEFT.value,
                        "data": {
                            "type": "data_flow",
                            "bidirectional": False,
                            "card_id": card_id,
                        },
                        "style": {
                            "strokeWidth": 2,
                            "stroke": "#e91e63",
                        },
                        "markerEnd": {"type": "arrowclosed", "color": "#e91e63"},
                    }
                )
                result["edges"].append(edge)

        return result
