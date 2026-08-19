"""Post-generation layout validation and compaction for LLM-produced diagrams.

After the LLM generates node positions there are two common problems:

1. **Out-of-bounds children** — a child node's position (relative to its parent
   cluster) places part of the child outside the parent's bounding box.  This
   happens when hard layout locks preserve LLM-provided absolute positions that
   were not recalculated after the cluster dimensions were set.

2. **Excessive whitespace** — clusters are wider/taller than their content
   requires, and root-level nodes are scattered across a large canvas area with
   large gaps between them.

``DiagramNodesLayoutOptimizer`` extends ``DiagramNodesReposition`` so it can
reuse ``reposition_nodes`` as the first step of the pipeline before applying
its own validation and compaction passes.
"""

import logging
from collections import defaultdict

from shared_libs.decorators import raise_exception
from shared_libs.lib.diagram_util.diagram_nodes_reposition import (
    DEFAULT_HEIGHT,
    DEFAULT_PADDING,
    DEFAULT_WIDTH,
    DiagramNodesReposition,
)

logger = logging.getLogger(__name__)


class DiagramNodesLayoutOptimizer(DiagramNodesReposition):
    """Validate and optimise node layout after LLM diagram generation.

    Extends :class:`DiagramNodesReposition` with three additional passes that
    run after the inherited ``reposition_nodes`` step:

    1. :meth:`validate_and_fix_parent_bounds` — guarantees every child node is
       fully contained within its parent cluster.  Clamps children with
       negative-relative positions to the padding boundary and expands the
       parent when children still overflow.

    2. :meth:`compact_cluster_bounds` — shrinks cluster ``width``/``height`` to
       the tight bounding box of their children (plus padding), eliminating dead
       space inside containers.  Processes deepest clusters first so that
       nested-cluster sizes are settled before their parents are measured.

    3. :meth:`compact_root_positions` — translates all root-level elements
       (``parentId == ""``) toward the canvas origin by a uniform delta so that
       the leftmost/topmost element sits at ``DEFAULT_PADDING``.  Relative
       spacing between root nodes is preserved.

    The public entry point is :meth:`run`, which executes all four steps in
    order.
    """

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _build_cluster_map(nodes: list[dict]) -> dict[str, dict]:
        return {n["id"]: n for n in nodes if n.get("type") == "clusterNode"}

    @staticmethod
    def _build_children_by_parent(nodes: list[dict]) -> dict[str, list[dict]]:
        mapping: dict[str, list[dict]] = defaultdict(list)
        for node in nodes:
            pid = node.get("parentId") or ""
            if pid:
                mapping[pid].append(node)
        return mapping

    @staticmethod
    def _node_right(node: dict) -> float:
        return node["position"]["x"] + (node.get("width") or DEFAULT_WIDTH)

    @staticmethod
    def _node_bottom(node: dict) -> float:
        return node["position"]["y"] + (node.get("height") or DEFAULT_HEIGHT)

    # ------------------------------------------------------------------
    # Pass 1 — validate and fix parent containment
    # ------------------------------------------------------------------

    @raise_exception(
        "Failed to validate and fix parent bounds.",
        exception_logger=logger,
    )
    def validate_and_fix_parent_bounds(self, nodes: list[dict]) -> list[dict]:
        """Ensure every child node is fully contained within its parent cluster.

        For each cluster:
        - Children whose position is negative (relative to the cluster origin)
          are clamped to ``DEFAULT_PADDING``.
        - If the children's bounding box exceeds the cluster's
          ``width``/``height`` after clamping, the cluster is expanded to fit.

        All violations are logged as warnings so the LLM prompts can be
        adjusted to produce better initial layouts.
        """
        cluster_map = self._build_cluster_map(nodes)
        children_by_parent = self._build_children_by_parent(nodes)

        for cluster_id, cluster in cluster_map.items():
            children = children_by_parent.get(cluster_id, [])
            if not children:
                continue

            required_right = 0.0
            required_bottom = 0.0

            for child in children:
                cx = child["position"]["x"]
                cy = child["position"]["y"]
                cw = child.get("width") or DEFAULT_WIDTH
                ch = child.get("height") or DEFAULT_HEIGHT

                # Clamp negative / sub-padding positions
                if cx < DEFAULT_PADDING:
                    logger.warning(
                        "[ LAYOUT ] Node '%s' position.x=%.1f is outside parent"
                        " cluster '%s' (min=%s). Clamping.",
                        child.get("id"),
                        cx,
                        cluster_id,
                        DEFAULT_PADDING,
                    )
                    child["position"]["x"] = float(DEFAULT_PADDING)
                    cx = float(DEFAULT_PADDING)

                if cy < DEFAULT_PADDING:
                    logger.warning(
                        "[ LAYOUT ] Node '%s' position.y=%.1f is outside parent"
                        " cluster '%s' (min=%s). Clamping.",
                        child.get("id"),
                        cy,
                        cluster_id,
                        DEFAULT_PADDING,
                    )
                    child["position"]["y"] = float(DEFAULT_PADDING)
                    cy = float(DEFAULT_PADDING)

                required_right = max(required_right, cx + cw + DEFAULT_PADDING)
                required_bottom = max(required_bottom, cy + ch + DEFAULT_PADDING)

            current_w = cluster.get("width") or 0.0
            current_h = cluster.get("height") or 0.0

            if required_right > current_w:
                logger.warning(
                    "[ LAYOUT ] Cluster '%s' width=%.1f insufficient for children"
                    " (required=%.1f). Expanding.",
                    cluster_id,
                    current_w,
                    required_right,
                )
                cluster["width"] = required_right

            if required_bottom > current_h:
                logger.warning(
                    "[ LAYOUT ] Cluster '%s' height=%.1f insufficient for children"
                    " (required=%.1f). Expanding.",
                    cluster_id,
                    current_h,
                    required_bottom,
                )
                cluster["height"] = required_bottom

        return nodes

    # ------------------------------------------------------------------
    # Pass 2 — compact cluster internal space
    # ------------------------------------------------------------------

    @raise_exception(
        "Failed to compact cluster bounds.",
        exception_logger=logger,
    )
    def compact_cluster_bounds(self, nodes: list[dict]) -> list[dict]:
        """Shrink cluster dimensions to the tight bounding box of their children.

        Processes deepest clusters first (leaves before parents) so that nested
        cluster sizes are finalised before their containing cluster is measured.
        Only ever shrinks — never expands (``validate_and_fix_parent_bounds``
        handles expansion).
        """
        cluster_map = self._build_cluster_map(nodes)
        children_by_parent = self._build_children_by_parent(nodes)

        # Compute tree depth for each cluster so we can process leaves first.
        depth_cache: dict[str, int] = {}

        def cluster_depth(cid: str, visited: set[str] | None = None) -> int:
            if cid in depth_cache:
                return depth_cache[cid]
            if visited is None:
                visited = set()
            if cid in visited:
                return 0
            visited.add(cid)
            parent_id = (cluster_map.get(cid) or {}).get("parentId") or ""
            d = (
                (1 + cluster_depth(parent_id, visited))
                if parent_id in cluster_map
                else 0
            )
            depth_cache[cid] = d
            return d

        sorted_clusters = sorted(
            cluster_map.items(),
            key=lambda pair: cluster_depth(pair[0]),
            reverse=True,  # deepest first
        )

        for cluster_id, cluster in sorted_clusters:
            children = children_by_parent.get(cluster_id, [])
            if not children:
                continue

            tight_right = max(self._node_right(c) for c in children) + DEFAULT_PADDING
            tight_bottom = max(self._node_bottom(c) for c in children) + DEFAULT_PADDING

            current_w = cluster.get("width") or 0.0
            current_h = cluster.get("height") or 0.0

            if current_w > tight_right:
                logger.info(
                    "[ LAYOUT ] Compacting cluster '%s' width: %.1f → %.1f.",
                    cluster_id,
                    current_w,
                    tight_right,
                )
                cluster["width"] = tight_right

            if current_h > tight_bottom:
                logger.info(
                    "[ LAYOUT ] Compacting cluster '%s' height: %.1f → %.1f.",
                    cluster_id,
                    current_h,
                    tight_bottom,
                )
                cluster["height"] = tight_bottom

        return nodes

    # ------------------------------------------------------------------
    # Pass 3 — compact canvas whitespace
    # ------------------------------------------------------------------

    @raise_exception(
        "Failed to compact root positions.",
        exception_logger=logger,
    )
    def compact_root_positions(self, nodes: list[dict]) -> list[dict]:
        """Translate root-level elements toward the canvas origin.

        All nodes with no parent (``parentId == ""``) are shifted by the same
        (dx, dy) so the leftmost/topmost sits at ``DEFAULT_PADDING``.  Relative
        spacing between root elements is preserved.
        """
        root_nodes = [n for n in nodes if not (n.get("parentId") or "")]
        if not root_nodes:
            return nodes

        min_x = min(n["position"]["x"] for n in root_nodes)
        min_y = min(n["position"]["y"] for n in root_nodes)

        dx = float(DEFAULT_PADDING) - min_x
        dy = float(DEFAULT_PADDING) - min_y

        if abs(dx) < 1.0 and abs(dy) < 1.0:
            return nodes

        logger.info(
            "[ LAYOUT ] Compacting canvas: shifting %d root element(s)"
            " by (dx=%.1f, dy=%.1f).",
            len(root_nodes),
            dx,
            dy,
        )
        for node in root_nodes:
            node["position"]["x"] += dx
            node["position"]["y"] += dy

        return nodes

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------

    @raise_exception(
        "Failed to run layout optimisation pipeline.",
        exception_logger=logger,
    )
    def run(self, nodes: list[dict], edges: list[dict]) -> list[dict]:
        """Execute the full four-step layout pipeline.

        Steps:
        1. ``reposition_nodes`` (inherited) — topological grid layout.
        2. ``validate_and_fix_parent_bounds`` — clamp and expand for containment.
        3. ``compact_cluster_bounds`` — shrink clusters to tight content bounds.
        4. ``compact_root_positions`` — eliminate canvas whitespace.

        Args:
            nodes: Serialised node dicts with ``id``, ``type``, ``parentId``,
                ``position`` (``{x, y}``), ``width``, ``height``.
            edges: Serialised edge dicts with ``source`` and ``target``.

        Returns:
            The same list mutated in-place and also returned for chaining.
        """
        nodes = self.reposition_nodes(nodes, edges)
        nodes = self.validate_and_fix_parent_bounds(nodes)
        nodes = self.compact_cluster_bounds(nodes)
        nodes = self.compact_root_positions(nodes)
        return nodes
