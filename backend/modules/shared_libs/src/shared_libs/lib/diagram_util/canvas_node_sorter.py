import logging

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class CanvasNodeSorter:
    """
    A class to sort canvas nodes based on their parent-child relationship.

    This class provides methods to sort a list of node dictionaries so that
    parent nodes appear before their children, and to perform various
    operations related to node ordering and hierarchy.
    """

    def __init__(self):
        return

    @raise_exception(
        "Failed to sort nodes by parent-child relationship.",
        exception_logger=logger,
    )
    def sort_nodes_by_parent_child(
        self,
        nodes: list[dict],
    ):
        """
        Sorts the nodes list in-place based on parent-child relationships.

        Args:
            nodes (List[dict]): List of node dictionaries. Each node must have 'id' and 'parentId' keys.

        Returns:
            List[dict]: The sorted list of nodes.
        """
        self._patch_parentNode_to_parentId(
            nodes=nodes,
        )
        self._sort_nodes_by_parent_node_count(
            nodes=nodes,
        )
        for node in nodes:
            self._update_child_nodes_recursive(
                node=node,
                nodes=nodes,
            )
        return nodes

    @raise_exception(
        "Failed to patch 'parentNode' to 'parentId'.",
        exception_logger=logger,
    )
    def _patch_parentNode_to_parentId(
        self,
        nodes: list[dict],
    ):
        """
        Updates all nodes in the list, renaming the 'parentNode' key to 'parentId' if present.
        """
        for node in nodes:
            if "parentNode" in node:
                node["parentId"] = node.pop("parentNode")
        return nodes

    @raise_exception(
        "Failed to sort nodes.",
        exception_logger=logger,
    )
    def _sort_nodes_by_parent_node_count(
        self,
        nodes: list[dict],
    ):
        """
        Sorts the nodes list in-place based on the number of parent nodes (depth in the tree).

        Args:
            nodes (List[dict]): List of node dictionaries. Each node must have 'id' and 'parentId' keys.

        Returns:
            None: The nodes list is sorted in-place.
        """
        mapping = self._get_parent_node_count_mapping(
            nodes=nodes,
        )
        nodes.sort(key=lambda n: mapping[n["id"]])

    @raise_exception(
        "Failed to get parent node count mapping.",
        exception_logger=logger,
    )
    def _get_parent_node_count_mapping(
        self,
        nodes: list[dict],
    ):
        """
        Returns a mapping from node id to the number of parent nodes (depth in the tree).

        Args:
            nodes (List[dict]): List of node dictionaries. Each node must have 'id' and 'parentId' keys.

        Returns:
            dict: Mapping from node id to parent node count.
        """
        mapping = {}
        for n in nodes:
            parent_node_count = 0
            current = n
            while current.get("parentId"):
                parent = next(
                    (node for node in nodes if node["id"] == current["parentId"]),
                    None,
                )
                if not parent:
                    break
                parent_node_count += 1
                current = parent
            mapping[n["id"]] = parent_node_count
        return mapping

    @raise_exception(
        "Failed to sort nodes.",
        exception_logger=logger,
    )
    def _update_child_nodes_recursive(
        self,
        node: dict,
        nodes: list[dict],
    ):
        """
        Recursively moves child nodes to be immediately after their parent node in the list.

        Args:
            node (dict): The parent node.
            nodes (List[dict]): The list of all nodes.

        Returns:
            None: The nodes list is modified in-place.
        """
        child_nodes = [n for n in nodes if n.get("parentId") == node["id"]]
        if not child_nodes:
            return
        parent_node_index = self._get_node_array_index(
            node=node,
            nodes=nodes,
        )
        for n_idx, n in enumerate(child_nodes):
            child_node_index = self._get_node_array_index(
                node=n,
                nodes=nodes,
            )
            self._move_node_in_place(
                nodes=nodes,
                from_index=child_node_index,
                to_index=parent_node_index + n_idx + 1,
            )
            self._update_child_nodes_recursive(
                node=n,
                nodes=nodes,
            )

    @raise_exception(
        "Failed to retrieve node index.",
        exception_logger=logger,
    )
    def _get_node_array_index(
        self,
        node: dict,
        nodes: list[dict],
    ) -> int:
        """
        Returns the index of the given node in the nodes list.

        Args:
            node (dict): The node to find.
            nodes (List[dict]): The list of nodes.

        Returns:
            int: The index of the node in the list.

        Raises:
            Exception: If the node is not found in the list.
        """
        for idx, n in enumerate(nodes):
            if n["id"] == node["id"]:
                return idx
        raise Exception("Node not found in nodes list")

    @raise_exception(
        "Failed to move node in place.",
        exception_logger=logger,
    )
    def _move_node_in_place(
        self,
        nodes: list[dict],
        from_index: int,
        to_index: int,
    ):
        """
        Moves a node within the list from one index to another in-place.

        Args:
            nodes (List[dict]): The list of nodes.
            from_index (int): The index to move from.
            to_index (int): The index to move to.

        Returns:
            None: The nodes list is modified in-place.
        """
        if from_index == to_index:
            return
        moved = nodes.pop(from_index)
        nodes.insert(to_index, moved)

    # @raise_exception("Failed to increment parent node count.")
    # def increment_parent_node_count(
    #     self,
    #     node: dict,
    #     nodes: List[dict],
    #     parent_node_count: int,
    # ):
    #     if node.get("parentId"):
    #         parent_node_count += 1
    #         parentNode = next(
    #             (n for n in nodes if n["id"] == node["parentId"]),
    #             None,
    #         )
    #         if not parentNode:
    #             raise ValueError(f'Parent node ({node["parentId"]}) not found.')
    #         return self.increment_parent_node_count(
    #             node=parentNode,
    #             nodes=nodes,
    #             parent_node_count=parent_node_count,
    #         )
    #     return parent_node_count
