from typing import Any, Protocol


class AttackFlowProtocol(Protocol):
    """Structural interface for an attack flow rule evaluator."""

    def get_attack_list(self, node_name: str) -> list[Any]:
        """Return the rule ids whose preconditions match the given node."""
        ...

    def get_postconditions(self, node_name: str, rule_id: Any) -> list[tuple[Any, ...]]:
        """Return the postconditions produced by a rule for the given node."""
        ...


__all__ = ["AttackFlowProtocol"]
