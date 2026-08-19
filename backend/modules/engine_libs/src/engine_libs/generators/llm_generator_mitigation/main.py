import json
import logging
import os
from datetime import datetime

from engine_libs.config.path_config import KB_LLM_PROMPT
from engine_libs.generators.llm_generator_mitigation.llm_generator_mitigation import (
    LLMMitigationGenerator,
)

from shared_libs.lib.global_shared_util import GlobalSharedUtil
from shared_libs.models.llm_generator_context import GeneratorConfiguration
from shared_libs.types.enum import LLM, PromptRole, PromptType

logger = logging.getLogger(__name__)


def setup_loggers() -> None:
    handler = logging.StreamHandler()
    app_logger_level = os.environ.get("APP_LOGGER_LEVEL", logging.DEBUG)
    logger.setLevel(app_logger_level)
    logger.addHandler(handler)


def _build_mitigation_configuration() -> GeneratorConfiguration:
    return GeneratorConfiguration.model_validate(
        {
            "role_label": PromptRole.projectManager.value,
            "llm": LLM.openai_gpt_5_2_api.value,
            "prompt_type": PromptType.mitigation.value,
            "mitigationPrompt": [],
        }
    )


def _default_scenario_payload() -> dict:
    return {
        "threats": [
            {
                "threat_id": "local-threat-1",
                "threat_name": "Local test scenario",
                "description": "Example scenario for local mitigation generation.",
                "attack_path": [],
            }
        ]
    }


def _read_payload_from_env() -> dict:
    raw_payload = os.environ.get("LLM_MITIGATION_SCENARIO_JSON", "").strip()
    if not raw_payload:
        return _default_scenario_payload()
    try:
        parsed = json.loads(raw_payload)
        if isinstance(parsed, dict):
            return parsed
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Failed to parse LLM_MITIGATION_SCENARIO_JSON; using default payload: %s",
            exc,
        )
    return _default_scenario_payload()


def main() -> None:
    setup_loggers()
    logger.info("[ RR-LLM ] Running LLM mitigation generator...")

    kb_llm_prompt_data = GlobalSharedUtil.read_data_from_json(str(KB_LLM_PROMPT)) or {}
    prompts_dict = kb_llm_prompt_data.get("prompt_template_lines", {})

    generator = LLMMitigationGenerator(
        configuration=_build_mitigation_configuration(),
        prompts_dict=prompts_dict,
        project_id="local-dev-project",
    )
    result = generator.generate_for_scenario(
        scenario_payload=_read_payload_from_env(),
        max_tries=1,
    )

    timestamp = int(datetime.now().timestamp())
    GlobalSharedUtil.write_to_file(f"mitigation_llm_{timestamp}", result)
    logger.info("[ RR-LLM ] Mitigation output count=%s", len(result))


if __name__ == "__main__":
    main()
