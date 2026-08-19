"""LLM pipeline configuration constants.

Constants are grouped into four concerns:

- **Questionnaire / form mechanics** — field IDs, precondition type strings,
  and framework option IDs that wire the LLM settings form together.
- **LLM value policy** — sentinel strings that distinguish user-editable
  values from system-controlled ones.
- **Mitigation parsing** — key / alias tables used when normalising the
  raw JSON the LLM returns for MITRE mitigation references.
- **Progress reporting** — threshold percentages for the two-stage LLM
  pipeline progress bar (path generation → LLM scoring).
- **Prompt utilities** — regex and retry constants used during prompt
  assembly and LLM output post-processing.
"""

from __future__ import annotations

import re

from shared_libs.constants.llm_field import (
    LLM_ENABLED_FRAMEWORKS_FIELD_ID,
    LLM_VALUE_POLICY_SYS_DEFINED,
)
from shared_libs.types.enum import AssessmentLifecycle, ProgressStage

# Re-exported so existing importers of this module keep working unchanged.
__all__ = [
    "LLM_ENABLED_FRAMEWORKS_FIELD_ID",
    "LLM_VALUE_POLICY_SYS_DEFINED",
]

# ---------------------------------------------------------------------------
# Questionnaire / form mechanics
# ---------------------------------------------------------------------------

#: Precondition type that triggers copying an options-group from a source
#: field into a dependent field.  Matched against ``preCondition.type`` in
#: the KB LLM question model.
COPY_OPTIONS_GROUP_FROM_FIELD_PRECONDITION_TYPE = "copyOptionsGroupFromField"

#: Maps each ``DisplayFrameworksSettings`` attribute to the ``optionId`` of
#: the corresponding radio/checkbox option in the framework-selector question.
#: Used by ``LLMUtil._build_enabled_framework_options`` to build the saved
#: value list when the LLM settings form is initialised.
FRAMEWORK_OPTION_ID_BY_SETTINGS_ATTR = {
    "stride": "option_pvb2surn9bydsyyf16mpoj",
    "owasp": "option_9nyw932k7y2d3m4kp21hfn",
    "tm": "option_x6lhsetjrsmfr5v3yb7hry",
    "scanHp": "option_v1dmovcnnyx934t0n7v3lk",
    "rapids": "option_kqboqgj0gcn9dje22dk5gb",
    "owaspAi": "option_k0dcaow4xzeqlepdlcgau1",
}

# ---------------------------------------------------------------------------
# Mitigation parsing
# ---------------------------------------------------------------------------

#: Keys the LLM may use for the mitigation array
LLM_MITIGATION_LIST_KEYS: tuple[str, ...] = ("mitigation", "mitigations", "controls")

#: Alternative field names the LLM may use for the MITRE mitigation ID.
LLM_MITIGATION_ID_ALIASES: tuple[str, ...] = ("mitre_mitigation_id", "mitre_id")

#: Alternative field names the LLM may use for the MITRE mitigation name.
LLM_MITIGATION_NAME_ALIASES: tuple[str, ...] = (
    "mitre_mitigation_name",
    "mitre_name",
)

#: Alternative field names the LLM may use for the mitigation description.
LLM_MITIGATION_DESC_ALIASES: tuple[str, ...] = (
    "mitre_mitigation_description",
    "mitre_description",
)

#: Maximum number of characters included in debug log samples of raw LLM
#: mitigation output. Each parse-failure log line embeds up to two of these
#: samples (raw + parsed), so keep this small enough that one log line stays
#: readable rather than dumping the full LLM response.
LLM_MITIGATION_MAX_DEBUG_SAMPLE_CHARS = 300

# ---------------------------------------------------------------------------
# Progress reporting
# ---------------------------------------------------------------------------

#: Percentage thresholds for the two-stage LLM progress bar.
#: ``path`` — min progress interpolated during attack-path generation.
#: ``llm``  — max progress interpolated during attack-path generation;
#:            also emitted after the LLM scoring / quality-check pass.
#: Must stay in sync with AssessmentLifecycle.with_ai["engine_llm"] in
#: risk_register_service/config/lib_config.py.
PROGRESS_THRESHOLDS: dict[AssessmentLifecycle, dict[str, dict[ProgressStage, int]]] = {
    AssessmentLifecycle.with_ai: {
        "engine_llm": {
            ProgressStage.path: 15,
            ProgressStage.llm: 55,
        },
    },
    AssessmentLifecycle.with_ai_and_pentest: {
        "engine_llm": {
            ProgressStage.path: 15,
            ProgressStage.llm: 55,
        },
    },
}

# ---------------------------------------------------------------------------
# Prompt utilities
# ---------------------------------------------------------------------------

#: Matches a trailing parenthetical appended by the LLM to a node name,
#: e.g. ``"Mobile Application (node_abc__option_xyz)"``.  Used to strip the
#: internal ID fragment before storing or comparing names.
PAREN_SUFFIX_RE = re.compile(r"\s*\(([^()]+)\)\s*$")

#: Maximum number of times the threat-impact generator will retry an LLM
#: call before giving up and returning a partial result.
THREAT_IMPACT_MAX_TRIES = 3
