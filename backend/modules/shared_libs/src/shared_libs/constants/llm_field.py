"""Canonical identifiers for the LLM assessment configuration questionnaire.

These constants are shared across engine_libs, risk_register_service, and
application_service.  All other modules must import from here; local
re-definitions should be removed.
"""

#: ``fieldId`` of the single-select (radio) question where the user picks the
#: LLM model for a project's assessment run.
LLM_MODEL_FIELD_ID = "field_d3cfa8fbc2814677a320a9"

#: ``fieldId`` of the multi-select question that controls which threat
#: frameworks are active for a project's LLM run.
LLM_ENABLED_FRAMEWORKS_FIELD_ID = "field_8bf2a0f4f90a4d71a5bb1a"

#: Sentinel stored in ``question.properties.valuePolicy``.  A question
#: carrying this policy is always overwritten by the system and rendered
#: as disabled so the user cannot override it.
LLM_VALUE_POLICY_SYS_DEFINED = "system_defined"
