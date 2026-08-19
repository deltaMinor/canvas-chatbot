import logging
from collections import defaultdict, deque

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)

DEFAULT_PADDING = 50
DEFAULT_SPACING = 50
ROOT_NODE_SPACING = 80
MAX_NUM_CHILD_PER_ROW = 5
DEFAULT_WIDTH = 80
DEFAULT_HEIGHT = 80

logglogger = logging.getLogger(__name__)


class DiagramNodesReposition:
    def __init__(self) -> None:
        pass

    def get_children_nodes(self, clusterId, nodes) -> list[dict]:
        return [n for n in nodes if n["parentId"] == clusterId]

    def set_position(
        self,
        cluster_nodes: list[dict],
        nodes: list[dict],
        iterated_cluster_node_ids: set[str],
        iterated_info_node_ids: set[str],
        ranking: dict[str, int],
    ) -> list[dict]:

        for cluster_node in cluster_nodes:
            cluster_id = cluster_node["id"]
            # _cluster_label = cluster_node["data"]["label"]
            children_nodes = self.get_children_nodes(clusterId=cluster_id, nodes=nodes)

            children_nodes = sorted(
                children_nodes,
                key=lambda obj: ranking.get(obj["id"], max(ranking.values())),
            )

            if cluster_id in iterated_cluster_node_ids:
                continue

            iterated_cluster_node_ids.add(cluster_id)

            row_height = 0
            child_count = 0
            x_cursor = DEFAULT_PADDING
            y_cursor = DEFAULT_PADDING

            for children_node in children_nodes:
                child_type = children_node["type"]
                child_id = children_node["id"]
                # _child_label = children_node["data"]["label"]

                # --- Wrap logic ---
                if child_count >= MAX_NUM_CHILD_PER_ROW:
                    x_cursor = DEFAULT_PADDING
                    y_cursor += row_height + DEFAULT_SPACING
                    row_height = 0
                    child_count = 0

                if child_type == "infoNode":
                    if child_id in iterated_info_node_ids:
                        continue

                    iterated_info_node_ids.add(child_id)

                    # Set default size if not provided
                    child_width = children_node.get("width", 80)
                    child_height = children_node.get("height", 80)
                    # child_label = children_node["data"]["label"]

                    # Position child relative to cluster
                    children_node["position"]["x"] = x_cursor
                    children_node["position"]["y"] = y_cursor

                    # Update cursors
                    x_cursor += child_width + DEFAULT_SPACING
                    row_height = max(row_height, child_height)
                    child_count += 1

                elif child_type == "clusterNode":
                    # 1. Get children of this nested cluster node
                    self.set_position(
                        [children_node],
                        nodes,
                        iterated_cluster_node_ids,
                        iterated_info_node_ids,
                        ranking,
                    )  # Pass the cluster node itself

                    # Get the size of the nested cluster after layout
                    nested_width = children_node.get("width", 120)
                    nested_height = children_node.get("height", 120)

                    # Position this cluster node
                    children_node["position"]["x"] = x_cursor
                    children_node["position"]["y"] = y_cursor

                    # Update cursors
                    x_cursor += nested_width + DEFAULT_SPACING
                    row_height = max(row_height, nested_height)
                    child_count += 1

            # After laying out all children, update the size of this cluster
            if not children_nodes:
                cluster_node["width"] = max(
                    cluster_node.get("width", 0),
                    200,
                )
                cluster_node["height"] = max(
                    cluster_node.get("height", 0),
                    200,
                )
                continue

            max_right = max(
                (child["position"]["x"] + child.get("width", 100))
                for child in children_nodes
            )
            max_bottom = max(
                (child["position"]["y"] + child.get("height", 60))
                for child in children_nodes
            )

            cluster_node["width"] = max_right + DEFAULT_PADDING
            cluster_node["height"] = max_bottom + DEFAULT_PADDING

        return nodes

    @raise_exception(
        "Failed to compute node position rank.",
        exception_logger=logger,
    )
    def compute_node_ranks(self, nodes: list[dict], edges: list[dict]) -> dict:
        # Initialize graph structure
        graph = defaultdict(list)

        sources_and_targets = set()
        for edge in edges:
            sources_and_targets.add(edge["source"])
            sources_and_targets.add(edge["target"])

        nodes_to_position = [n for n in nodes if n["id"] in sources_and_targets]

        in_degree = {node["id"]: 0 for node in nodes_to_position}
        rank = {node["id"]: 0 for node in nodes_to_position}

        for edge in edges:
            src = edge["source"]
            tgt = edge["target"]
            graph[src].append(tgt)
            in_degree[tgt] += 1

        # Queue for nodes with in-degree 0 (start nodes)
        queue = deque([node_id for node_id, deg in in_degree.items() if deg == 0])

        while queue:
            current = queue.popleft()
            for neighbor in graph[current]:
                # Assign rank: neighbor must be at least 1 level after current
                rank[neighbor] = max(rank[neighbor], rank[current] + 1)
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        if not rank:
            return {}

        max_rank = max(rank.values())
        cluster_node_ids = [n for n in nodes if n["type"] == "clusterNode"]

        cluster_node_rank = {n["id"]: max_rank for n in cluster_node_ids}

        for pos_node_id, rank_val in rank.items():
            node = next((obj for obj in nodes if obj["id"] == pos_node_id), None)
            if not node:
                continue
            parent_id = node.get("parentId")
            if not parent_id or parent_id not in cluster_node_rank:
                continue
            if rank_val < cluster_node_rank[parent_id]:
                cluster_node_rank[parent_id] = rank_val

        result = {**rank, **cluster_node_rank}

        return result

    @raise_exception(
        "Failed to reposition nodes.",
        exception_logger=logger,
    )
    def reposition_nodes(
        self,
        nodes: list[dict],
        edges: list[dict],
    ) -> list[dict]:
        logger.info("[ RR-LLM ] Repositioning nodes...")
        if not nodes:
            return nodes

        has_hard_layout_locks = any(
            (node.get("layout_lock") or "").strip().lower() == "hard" for node in nodes
        )
        if has_hard_layout_locks:
            logger.info(
                "[ RR-LLM ] Skipping node reposition due to hard layout locks from image anchors."
            )
            return nodes

        ranking = self.compute_node_ranks(nodes, edges)
        default_rank = max(ranking.values()) if ranking else 0

        cluster_nodes = [node for node in nodes if node["type"] == "clusterNode"]
        root_nodes = [
            node
            for node in nodes
            if node["parentId"] == "" and node["type"] == "infoNode"
        ]

        iterated_info_node_ids = set()
        iterated_cluster_node_ids = set()

        nodes = self.set_position(
            cluster_nodes,
            nodes,
            iterated_cluster_node_ids,
            iterated_info_node_ids,
            ranking,
        )

        root_node_ids = [n["id"] for n in root_nodes]

        repos_nodes = [n for n in nodes if n["id"] not in root_node_ids]

        if not repos_nodes:
            return nodes

        cluster_repos_nodes = [
            child for child in repos_nodes if child["type"] == "clusterNode"
        ]
        if cluster_repos_nodes:
            min_bound_x = min(child["position"]["x"] for child in cluster_repos_nodes)
        else:
            min_bound_x = min(child["position"]["x"] for child in repos_nodes)
        min_bound_y = min(child["position"]["y"] for child in repos_nodes)

        min_y = min_bound_y + DEFAULT_SPACING
        current_x = min_bound_x
        current_y = min_y

        counter_x = 1
        counter_y = 1
        sorted_root_nodes = sorted(
            root_nodes,
            key=lambda obj: ranking.get(obj["id"], default_rank),
            reverse=True,
        )
        tracker = default_rank

        for root_node in sorted_root_nodes:
            root_node_ranking = ranking.get(root_node["id"], default_rank)
            if root_node_ranking < tracker:
                # increase x, set min y
                calculated_x = (ROOT_NODE_SPACING + DEFAULT_WIDTH) * counter_x
                current_x = min_bound_x - calculated_x
                current_y = min_y
                root_node["position"]["x"] = current_x
                root_node["position"]["y"] = min_y
                tracker = root_node_ranking
                counter_x += 1
            else:
                # keep x, increase y
                calculated_y = (ROOT_NODE_SPACING + DEFAULT_HEIGHT) * counter_y
                current_y = current_y + calculated_y
                root_node["position"]["x"] = current_x
                root_node["position"]["y"] = current_y
                counter_y += 1

            repos_nodes.append(root_node)

        return nodes
