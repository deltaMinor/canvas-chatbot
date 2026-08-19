"""Runtime behaviour flags and algorithmic limits for engine_libs.

These constants control execution behaviour at a coarse level.  They are
intentionally kept as plain module-level values (not env-var reads) so that
unit tests can patch them in place without environment side-effects.

Usage pattern::

    from engine_libs.config.runtime_config import MODULE_TEST

    if not MODULE_TEST:
        # skips network / LLM calls in test mode
        ...
"""

from datetime import timezone, tzinfo

#: Default timezone applied to all datetime objects produced by engine_libs.
#: Services that need local time should convert at the boundary, not here.
DEFAULT_TZINFO: tzinfo = timezone.utc

#: When ``True`` the LLM pipeline skips real model calls and returns stub
#: data.  Set to ``True`` in unit tests; never set in production workers.
MODULE_TEST = False

#: Maximum number of ancestor hops the project-input-model extractor will
#: walk up the TOSCA node-type hierarchy before giving up.  Guards against
#: malformed ontologies with circular inheritance chains.
PROJECT_INPUT_MODEL_ANCESTOR_TRAVERSAL_MAX_STEPS = 50

#: Maximum edge hops allowed when traversing the architecture-diagram graph
#: (e.g. reachability / path-finding queries).  Prevents runaway traversal
#: on large or cyclic diagrams.
DIAGRAM_GRAPH_TRAVERSAL_MAX_STEPS = 50

#: Maximum number of LLM API calls that may be in-flight simultaneously when
#: per-scenario or per-path LLM loops are parallelised with ThreadPoolExecutor.
#: Keeps throughput high while avoiding rate-limit bursts on OpenAI / Gemini.
MAX_PARALLEL_LLM_CALLS = 5

__all__ = [
    "DEFAULT_TZINFO",
    "MODULE_TEST",
    "PROJECT_INPUT_MODEL_ANCESTOR_TRAVERSAL_MAX_STEPS",
    "DIAGRAM_GRAPH_TRAVERSAL_MAX_STEPS",
]
