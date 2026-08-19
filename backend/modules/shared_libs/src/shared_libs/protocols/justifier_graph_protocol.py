from typing import Any, Protocol


class JustifierGraphProtocol(Protocol):
    """Structural interface for the justifier's resulting attack graph.

    Describes the minimal `networkx`-like surface that
    `ArchitectureProcessor._append_attack_flow_mapping` needs from
    `JustifierMain.G`.
    """

    def has_node(self, node_id: str) -> bool:
        """Return True if the given node id exists in the graph."""
        ...

    def add_node(self, node_id: str, **attributes: Any) -> None:
        """Add a node with the given attributes to the graph."""
        ...

    def add_edge(self, source_id: str, target_id: str) -> None:
        """Add a directed edge between two nodes in the graph."""
        ...


__all__ = ["JustifierGraphProtocol"]
