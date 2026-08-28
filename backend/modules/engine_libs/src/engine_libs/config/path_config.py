"""Filesystem paths used throughout engine_libs and its dependents.

Three root anchors are resolved at import time:

``ENGINE_LIBS_ROOT``
    The ``engine_libs`` package directory (parent of this config package).
    Used as the base for bundled assets such as the TOSCA ontology files.

``PROJECT_ROOT``
    Walked up from this file until a ``mongodb/data`` sibling is found — the
    conventional monorepo root.  Falls back to six levels up if the marker
    directory is absent (e.g. inside a docker image or CI).

``CONFIG_DIR``
    The directory that contains this file, used as the base for the local
    ``data_test/`` and ``results/`` scratch directories which are created on
    import if they do not yet exist.
"""

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Package-relative paths (resolved from engine_libs source tree)
# ---------------------------------------------------------------------------

ENGINE_LIBS_ROOT = Path(__file__).resolve().parents[1]

#: Directory that contains the bundled OWL / XML ontology files.
ONTOLOGY_DIR = ENGINE_LIBS_ROOT / "ontology"

#: TOSCA built-ins ontology — loaded exclusively by ``ToscaOntologyLoader``.
TOSCA_BUILTINS_XML = ONTOLOGY_DIR / "tosca-builtins.xml"

#: SODALITE meta-model ontology used during TOSCA validation.
SODALITE_METAMODEL_XML = ONTOLOGY_DIR / "sodalite-metamodel.xml"


# ---------------------------------------------------------------------------
# Project-root resolution
# ---------------------------------------------------------------------------


def _find_project_root() -> Path:
    """Walk up the directory tree until the ``mongodb/data`` marker is found.

    Returns the deepest ancestor that contains ``mongodb/data``.  Falls back
    to six levels above this file when no such ancestor exists (CI / Docker).
    """
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / "mongodb" / "data").is_dir():
            return parent
    return current.parents[5]


PROJECT_ROOT = _find_project_root()

# ---------------------------------------------------------------------------
# Data directories derived from PROJECT_ROOT
# ---------------------------------------------------------------------------

#: Shared MongoDB data directory at the monorepo root.
MONGODB_DATA_DIR = PROJECT_ROOT / "mongodb" / "data"

#: Seeded risk-register JSON fixtures read by standalone engine scripts.
RR_DATA_DIR = MONGODB_DATA_DIR / "risk_register_service"

# ---------------------------------------------------------------------------
# Config-relative scratch directories (created on import)
# ---------------------------------------------------------------------------

CONFIG_DIR = Path(__file__).resolve().parent

#: Local scratch directory for test input fixtures (project_ad, prompts, etc.).
DATA_TEST_DIR = CONFIG_DIR / "data_test"

#: Local scratch directory for benchmark / generation result dumps.
DATA_RESULTS_DIR = CONFIG_DIR / "results"

os.makedirs(DATA_TEST_DIR, exist_ok=True)
os.makedirs(DATA_RESULTS_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Fixture file paths used by standalone engine entry-points
# ---------------------------------------------------------------------------

KB_LLM_PROMPT = RR_DATA_DIR / "kb_llm_prompt.json"
KB_MITRE = RR_DATA_DIR / "kb_mitre.json"
KB_QUESTION_TO_MODEL_FILE = RR_DATA_DIR / "kb_question_to_model.json"
DATAFLOW_PROMPT = DATA_TEST_DIR / "dataflow_prompt.json"
ARCHITECTURE_DIAGRAM_FILE = DATA_TEST_DIR / "project_ad.json"

__all__ = [
    "ENGINE_LIBS_ROOT",
    "ONTOLOGY_DIR",
    "TOSCA_BUILTINS_XML",
    "SODALITE_METAMODEL_XML",
    "PROJECT_ROOT",
    "MONGODB_DATA_DIR",
    "RR_DATA_DIR",
    "CONFIG_DIR",
    "DATA_TEST_DIR",
    "DATA_RESULTS_DIR",
    "KB_LLM_PROMPT",
    "KB_MITRE",
    "KB_QUESTION_TO_MODEL_FILE",
    "DATAFLOW_PROMPT",
    "ARCHITECTURE_DIAGRAM_FILE",
]
