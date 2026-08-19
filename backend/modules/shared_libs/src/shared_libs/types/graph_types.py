from typing import Any, Protocol

__all__ = ["GraphConstructProtocol"]


class GraphConstructProtocol(Protocol):
    """Structural contract for graph construct objects.

    Provides the two directed graphs used by path-filtering and related
    graph-analysis utilities.  The concrete graph type is intentionally
    left as ``Any`` so this protocol stays independent of any graph
    library (e.g. networkx) that is not a shared_libs dependency.
    """

    data_flow_graph: Any
    child_of_graph: Any
