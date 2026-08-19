from typing import Any, Protocol

from .justifier_graph_protocol import JustifierGraphProtocol


class JustifierProtocol(Protocol):
    """Structural interface for a justifier/attack-graph generator engine."""

    cve_dict: dict[str, Any] | None
    G: JustifierGraphProtocol

    def run(self, justify_input: str) -> None:
        """Run the justification engine against the given XSB input."""
        ...

    def generate_attack_graph(self) -> str:
        """Return the resulting attack graph rendered as a DOT string."""
        ...


__all__ = ["JustifierProtocol"]
