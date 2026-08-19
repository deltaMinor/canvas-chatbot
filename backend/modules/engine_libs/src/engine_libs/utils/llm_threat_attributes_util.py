"""Threat-attribute utility helpers.

Lives in engine_libs so the questionnaire-load path (``LLMUtil``) can fill
framework-aware placeholders at save time without dragging langchain / LLM
client imports into the request thread.  The worker path imports the same
helpers so the prompt the LLM sees is identical to what the questionnaire
renders.

``register_libs.utils.llm_threat_attributes_util`` re-exports this class so
existing register_libs callers need no changes.
"""

from __future__ import annotations

import json
import logging
from typing import TYPE_CHECKING, Any

from engine_libs.config.framework_config import (
    FRAMEWORK_LABEL_TO_ENUM,
    FRAMEWORK_ORDER,
)
from pydantic import ValidationError

from shared_libs.exceptions.api_exceptions import NotFound
from shared_libs.models.base_models.project import DisplayFrameworksSettings

if TYPE_CHECKING:
    from shared_libs.domain import ProjectService

logger = logging.getLogger(__name__)


class LLMThreatAttributesUtil:
    """Utility methods for threat-attribute prompt assembly and normalization."""

    @staticmethod
    def get_enabled_frameworks(
        display_frameworks,
    ) -> list[tuple[str, str, str, str, str]]:
        return [
            entry
            for entry in FRAMEWORK_ORDER
            if getattr(display_frameworks, entry[0], False)
        ]

    @staticmethod
    def build_intro_list(enabled: list[tuple[str, str, str, str, str]]) -> str:
        if not enabled:
            return ""
        lines = []
        for index, (_, label, _instr, _key, _suffix) in enumerate(enabled, start=3):
            lines.append(f"{index}. {label}")
        return "\n" + "\n".join(lines)

    @staticmethod
    def build_instructions_list(enabled: list[tuple[str, str, str, str, str]]) -> str:
        if not enabled:
            return ""
        return "\n" + "\n".join(f"- {instr}" for _, _, instr, _, _ in enabled)

    @staticmethod
    def build_result_struc(enabled: list[tuple[str, str, str, str, str]]) -> str:
        schema: dict[str, Any] = {
            "threats": [
                {
                    "threat_id": "string",
                    "impact_score": "integer 1-5",
                    "likelihood_score": "integer 1-5",
                    "reasoning": "string (brief explanation of impact and likelihood)",
                }
            ]
        }
        for _, _, _, json_key, _ in enabled:
            schema["threats"][0][json_key] = ["string"]
        return json.dumps(schema, indent=2)

    @staticmethod
    def clamp_score(value, default: int = 0) -> int:
        try:
            score = int(value)
        except (TypeError, ValueError):
            return default
        if score < 1:
            return 1
        if score > 5:
            return 5
        return score

    @staticmethod
    def as_str_list(value) -> list[str]:
        """Coerce *value* to ``list[str]``.

        The canonical shape is ``list[str]``.  A bare ``str`` is a legacy
        caller shape — a warning is emitted so the root cause can be fixed.
        Unexpected types return ``[]`` with a warning.
        """
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        if isinstance(value, str):
            if value.strip():
                logger.warning(
                    "as_str_list: received str '%s' instead of list[str]."
                    " Caller should wrap in a list.",
                    value[:80],
                )
                return [value.strip()]
            return []
        if value is not None:
            logger.warning(
                "as_str_list: unexpected type %s — returning [].",
                type(value).__name__,
            )
        return []

    @staticmethod
    def validate_framework_labels(
        framework_attr: str, labels: list[str]
    ) -> tuple[list[str], list[str]]:
        mapping = FRAMEWORK_LABEL_TO_ENUM.get(framework_attr)
        if not mapping:
            return list(labels), []
        valid: list[str] = []
        seen: set[str] = set()
        issues: list[str] = []
        for label in labels:
            enum_key = mapping.get(label)
            if enum_key is None:
                issues.append(
                    f"{framework_attr}: invalid label '{label}' (not in allowed set)"
                )
                continue
            if enum_key in seen:
                continue
            seen.add(enum_key)
            valid.append(enum_key)
        return valid, issues

    @staticmethod
    def load_display_frameworks(
        project_service: ProjectService | None,
        project_id: str,
        user_info: dict | None,
    ) -> DisplayFrameworksSettings:
        if project_service is None:
            logger.info(
                "No ProjectService available; using default displayFrameworks "
                "for project %s (stride only).",
                project_id,
            )
            return DisplayFrameworksSettings()
        try:
            db_project = project_service.get_one(
                {"project_id": project_id},
                raise_if_not_found=True,
                user_info=user_info,
            )
        except NotFound as exc:
            logger.warning(
                "Project %s not found while loading displayFrameworks; "
                "defaulting to stride-only: %s",
                project_id,
                exc,
            )
            return DisplayFrameworksSettings()
        project_settings = (db_project or {}).get("project_settings") or {}
        df_raw = project_settings.get("displayFrameworks") or {}
        try:
            return DisplayFrameworksSettings(**df_raw)
        except ValidationError as exc:
            logger.warning(
                "Stored displayFrameworks for project %s is malformed; "
                "defaulting to stride-only: %s",
                project_id,
                exc,
            )
            return DisplayFrameworksSettings()
