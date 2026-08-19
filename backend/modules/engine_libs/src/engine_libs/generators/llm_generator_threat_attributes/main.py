import json
import logging
import os
from datetime import datetime

from engine_libs.config.path_config import KB_LLM_PROMPT
from engine_libs.generators.llm_generator_threat_attributes.llm_generator_threat_attributes import (
    LLMThreatAttributesGenerator,
)
from engine_libs.utils.llm_threat_attributes_util import LLMThreatAttributesUtil

from shared_libs.lib.global_shared_util import GlobalSharedUtil
from shared_libs.models.base_models.project import DisplayFrameworksSettings
from shared_libs.models.llm_generator_context import GeneratorConfiguration
from shared_libs.types.enum import LLM, PromptRole, PromptType

logger = logging.getLogger(__name__)


def setup_loggers() -> None:
    handler = logging.StreamHandler()
    app_logger_level = os.environ.get("APP_LOGGER_LEVEL", logging.DEBUG)
    logger.setLevel(app_logger_level)
    logger.addHandler(handler)


def _build_attributes_configuration() -> GeneratorConfiguration:
    return GeneratorConfiguration.model_validate(
        {
            "role_label": PromptRole.projectManager.value,
            "llm": LLM.openai_gpt_5_2_api.value,
            "prompt_type": PromptType.threat_attributes.value,
            "attributesPrompt": [],
        }
    )


def _default_scenario_payload() -> dict:
    return {
        "threats": [
            {
                "threat_id": "local-threat-1",
                "threat_name": "Local test scenario",
                "description": "Example scenario for local attributes generation.",
                "attack_path": [],
                "recommended_mitigations": [],
            }
        ]
    }


def _read_payload_from_env() -> dict:
    raw_payload = os.environ.get("LLM_THREAT_ATTRIBUTES_SCENARIO_JSON", "").strip()
    if not raw_payload:
        return _default_scenario_payload()
    try:
        parsed = json.loads(raw_payload)
        if isinstance(parsed, dict):
            return parsed
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Failed to parse LLM_THREAT_ATTRIBUTES_SCENARIO_JSON; "
            "using default payload: %s",
            exc,
        )
    return _default_scenario_payload()


def _read_display_frameworks_from_env() -> DisplayFrameworksSettings:
    raw = os.environ.get("LLM_DISPLAY_FRAMEWORKS_JSON", "").strip()
    if not raw:
        return DisplayFrameworksSettings()
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            return DisplayFrameworksSettings(**parsed)
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Failed to parse LLM_DISPLAY_FRAMEWORKS_JSON; using defaults: %s",
            exc,
        )
    return DisplayFrameworksSettings()


def main() -> None:
    setup_loggers()
    logger.info("[ RR-LLM ] Running LLM threat attributes generator...")

    kb_llm_prompt_data = GlobalSharedUtil.read_data_from_json(str(KB_LLM_PROMPT)) or {}
    prompts_dict = kb_llm_prompt_data.get("prompt_template_lines", {})
    display_frameworks = _read_display_frameworks_from_env()

    generator = LLMThreatAttributesGenerator(
        configuration=_build_attributes_configuration(),
        prompts_dict=prompts_dict,
        display_frameworks=display_frameworks,
        project_id="local-dev-project",
    )
    result = generator.generate_for_scenario(
        scenario_payload=_read_payload_from_env(),
        max_tries=3,
    )

    if result:
        quality_checks = {}
        for framework_attr, json_key in generator.enabled_framework_attrs:
            labels = LLMThreatAttributesUtil.as_str_list(result.get(json_key))
            valid_labels, issues = LLMThreatAttributesUtil.validate_framework_labels(
                framework_attr, labels
            )
            quality_checks[framework_attr] = {
                "input": labels,
                "valid": valid_labels,
                "issues": issues,
            }
        if quality_checks:
            result["quality_checks"] = quality_checks

    timestamp = int(datetime.now().timestamp())
    GlobalSharedUtil.write_to_file(f"threat_attributes_llm_{timestamp}", result)
    logger.info("[ RR-LLM ] Threat attributes generated.")


if __name__ == "__main__":
    main()
