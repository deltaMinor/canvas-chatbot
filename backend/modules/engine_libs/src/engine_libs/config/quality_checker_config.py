"""Configuration constants for ThreatQualityChecker and ThreatSccChecker."""

from __future__ import annotations

import re

# ---------------------------------------------------------------------------
# ThreatQualityChecker
# ---------------------------------------------------------------------------

#: Regex that matches a canonical MITRE ATT&CK technique ID (T####[.###]).
MITRE_ID_PATTERN: re.Pattern[str] = re.compile(r"^T\d{4}(\.\d{3})?$")

#: Loose UUID / uuid-fragment detector.  The LLM occasionally leaks
#: internal node IDs into the ``node`` (display name) field.
UUID_LIKE_PATTERN: re.Pattern[str] = re.compile(
    r"[0-9a-f]{4,}-[0-9a-f]{2,}", re.IGNORECASE
)

#: Minimum cosine similarity accepted as a confident embedding match.
#: Tuned for BAAI/bge-small-en-v1.5: unrelated short technical names sit
#: around 0.35, semantically close ones at 0.55+.
DEFAULT_MIN_SIM: float = 0.45

#: When a stored MITRE ID is still valid but the LLM's technique name
#: differs, tolerate the drift (synonym / MITRE rename) at or above this
#: threshold — keep the ID and normalise the name instead of swapping.
NAME_DRIFT_SIM: float = 0.7

#: Embedding correction confidence gate for primary search (missing/invalid id,
#: or technique by name). 
MATCH_CONFIDENT_SIM: float = 0.80
MATCH_MARGIN_MIN: float = 0.10

#: Sentence-transformer model used to build MITRE and node-name embeddings.
#: BAAI/bge-small-en-v1.5 is the same 384-dim size as all-MiniLM-L6-v2 but
#: consistently outperforms it on short technical text (MTEB retrieval/STS).
EMBED_MODEL_NAME: str = "BAAI/bge-small-en-v1.5"

# ---------------------------------------------------------------------------
# ThreatSccChecker
# ---------------------------------------------------------------------------

#: Scenario fields forwarded to the LLM quality-checker prompt.
SCENARIO_KEYS: tuple[str, ...] = (
    "risk_scenario",
    "key_risk",
    "attack_narrative",
    "attack_path",
)

QUALITY_CHECKER_PROMPT: str = """Quality Checker

You are an expert in threat modeling. You are given a threat scenario to evaluate its quality and to correct it where needed.

THREAT SCENARIO:
{threat_scenario}

ARCHITECTURE DIAGRAM:
{architecture_diagram}

**Things to consider**
1. Does the threat scenario describe a plausible attack campaign?
2. Does the threat scenario result in a SINGLE well-defined attacker goal that impacts the system? The last step in the attack path should be an Impact tactic.
3. Does the attack path correctly describe the threat scenario?
4. Does the attack path show a normal progression of the attacker?
5. Do the security controls in the architecture diagram prevent this threat scenario from happening? Things to check for include:
        Is the network segmented such that the attacker cannot move laterally in the threat scenario?
        Is there a traffic inspection or enforcement point that prevents malicious traffic in the threat scenario from being delivered?
        Are there components that enforce authentication and/or authorization that prevent the attacker in the threat scenario from obtaining privileged access?

Return a JSON with your recommendations to correct the threat scenario. If the security controls prevent this threat scenario from happening, then include in your recommendation that this threat scenario should be removed. DO NOT recommend any new security controls.

Output JSON structure:

{{"recommendation": str}}
"""

REGEN_PROMPT: str = """You are an expert in threat modeling. Apply the recommendation below to correct the threat scenario. Return the corrected threat scenario as JSON in exactly the same structure as the input - do not add, remove, or rename any fields.

Keep exactly one system component per attack-path step; do not combine multiple components into a single step.

Keep exactly one MITRE ATT&CK technique per step and use its official MITRE technique name, not an action description.

Each step's `attack_id` field MUST be a real MITRE technique id (T####/T####.###), never the threat/scenario number or a label such as `THREAT-2`. Keep the per-step ids distinct; if unsure of a step's id, leave it empty.

THREAT SCENARIO:
{threat_scenario}

RECOMMENDATION:
{recommendation}
"""


REPAIR_PROMPT: str = """You are an expert in threat modeling. The attack scenario below was auto-corrected by embedding search, but the steps under LOW-CONFIDENCE STEPS could not be matched with confidence: their similarity to the closest catalogue entry was too low, or the top two candidates were too close (small margin) to choose safely. Re-pick the correct value for ONLY those steps so each one fits THIS scenario; leave every other step unchanged. Use exactly one system component per step; never combine components.

Each low-confidence line gives the current value, the closest catalogue candidate with its similarity (sim, 0-1), the runner-up, and the margin between them. Treat these as hints about why the auto-match failed, not as the answer: pick the candidate only when it genuinely matches the step's role in the scenario, otherwise choose a better-fitting value.

Rules:
- system_component: For every step flagged for system_component, you MUST return a system_component chosen verbatim from ARCHITECTURE COMPONENTS — pick the single closest one; never omit it or leave it unfixed.
- technique_id / technique_name: use a real MITRE ATT&CK technique whose id matches the format T#### or T####.### (e.g. T1190) and whose name is its official technique name. Never output a descriptive or made-up id.

ATTACK SCENARIO:
{threat_scenario}

LOW-CONFIDENCE STEPS:
{weak_steps}

ARCHITECTURE COMPONENTS:
{components}

Return JSON: {{"fixes": [{{"step": int, "system_component": str, "technique_id": str, "technique_name": str}}]}}. Include only the fields that apply to each step (system_component for component fixes; technique_id + technique_name for technique fixes).
"""
