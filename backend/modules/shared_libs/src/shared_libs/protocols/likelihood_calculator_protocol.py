from typing import Protocol


class LikelihoodCalculatorProtocol(Protocol):
    """Structural interface for a likelihood/probability calculator."""

    def calculate_probability(self, likelihoods: list[int]) -> float:
        """Combine a list of likelihood scores into a single probability."""
        ...

    def probability_to_scaled_likelihood(self, probability: float) -> float | None:
        """Convert a probability back into a scaled likelihood score."""
        ...


__all__ = ["LikelihoodCalculatorProtocol"]
