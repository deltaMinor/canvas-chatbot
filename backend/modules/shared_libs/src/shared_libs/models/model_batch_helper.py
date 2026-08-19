from typing import Any

from shared_libs.types.enum import CanvasType


class ModelBatchHelper:
    def convertCanvasViewsToCanvas(
        self, canvas: dict[str, Any], canvas_views: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """
        Convert canvas views to canvas and remove interface and device nodes in architecture canvas.
        Convert interface object in card ref to be an array if it is not.

        Args:
            canvas (Dict[str, Any]): A dictionary of canvas
            canvas_views (List[Dict[str, Any]]): A list of canvas views

        Returns:
            List[Dict[str, Any]]: A list of dictionary containing the result of converting canvas
            views to the canvases
        """
        _canvas = []
        filtered_nodes = [
            node
            for node in canvas["canvas_data"]["nodes"]
            if (
                node["data"].get("cardRefKey", "") == ""
                and node["data"]["type"] == CanvasType.architecture.value
            )
            or node["data"]["type"] != CanvasType.architecture.value
        ]
        filtered_node_id_list = [node["id"] for node in filtered_nodes]
        filtered_edges = [
            edge
            for edge in canvas["canvas_data"]["edges"]
            if edge.get("source") in filtered_node_id_list
            and edge.get("target") in filtered_node_id_list
        ]
        for canvas_view in canvas_views:
            card_id = canvas_view["ref"].get("card_ref", {}).get("card_id", "")
            _nodes = [
                {**node, "data": {**node.get("data", {}), "card_id": card_id}}
                for node in filtered_nodes
                if node["id"] in canvas_view["node_id_list"]
            ]
            _edges = [
                edge
                for edge in filtered_edges
                if edge["id"] in canvas_view["edge_id_list"]
            ]

            # Ensure card_interface is an array
            card_interface = (
                canvas_view["ref"].get("card_ref", {}).get("card_interface", {})
            )
            if not isinstance(card_interface, list):
                card_interface = [card_interface]

            __canvas = {
                "nodes": _nodes,
                "edges": _edges,
                "viewport": canvas["canvas_data"]["viewport"],
                "canvas_id": canvas_view["view_id"],
                "canvas_name": str(canvas_view["view_name"]).replace(
                    "view", "canvas", 1
                ),
                "canvas_type": canvas_view["view_type"],
                "ref": {
                    **canvas_view["ref"],
                    "card_ref": {
                        **canvas_view["ref"].get("card_ref", {}),
                        "card_interface": card_interface,
                    },
                },
                "view_only": canvas_view["view_only"],
            }
            _canvas.append(__canvas)
        return _canvas
