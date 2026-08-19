"""
Onboarding step configuration constants.

This module contains mappings and constants related to onboarding steps,
including step type mappings for different onboarding step names.
"""

# Mapping from step_name to step_type
# step_type indicates the type of step (e.g., "tnc" for Terms and Conditions)
STEP_TYPE_MAPPING: dict[str, str | None] = {
    "welcome": None,
    "free_trial_tnc": "tnc",
    "general_tnc": "tnc",
}
