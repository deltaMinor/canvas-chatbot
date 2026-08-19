import logging
import os
from datetime import datetime

from engine_libs.config.path_config import (
    ARCHITECTURE_DIAGRAM_FILE,
    CONCEPTION_QUESTIONNAIRE_FILE,
    KB_LLM_PROMPT,
    KB_MITRE,
    KB_QUESTION_TO_MODEL_FILE,
)
from engine_libs.generators.llm_generator_risk_scenario.llm_generator_risk_scenario import (
    LLMRiskScenarioGenerator,
)
from engine_libs.lib.project_input_model_extractor import ProjectInputModelExtractor

from shared_libs.lib.global_shared_util import GlobalSharedUtil
from shared_libs.models.base_models.mitre import MitreParsedDocs
from shared_libs.models.llm_generator_context import GeneratorConfiguration
from shared_libs.types.enum import LLM, PromptRole, PromptType

logger = logging.getLogger(__name__)


class _NoOpRegisterUpdater:
    def update_assessment_progress(self, *_args, **_kwargs) -> None:
        return None


def setup_loggers() -> None:
    handler = logging.StreamHandler()
    app_logger_level = os.environ.get("APP_LOGGER_LEVEL", logging.DEBUG)
    logger.setLevel(app_logger_level)
    logger.addHandler(handler)


def _build_risk_scenario_configuration() -> GeneratorConfiguration:
    return GeneratorConfiguration.model_validate(
        {
            "role_label": PromptRole.projectManager.value,
            "llm": LLM.openai_gpt_5_2_api.value,
            "prompt_type": PromptType.single.value,
            "prompt": [],
            "systemDescription": "",
        }
    )


def _read_mitre_parsed_docs() -> MitreParsedDocs:
    kb_mitre_data = GlobalSharedUtil.read_data_from_json(str(KB_MITRE)) or {}
    mitre_payload = kb_mitre_data.get("mitre_parsed_docs") or kb_mitre_data
    return MitreParsedDocs.model_validate(mitre_payload)


def main() -> None:
    setup_loggers()
    logger.info("[ RR-LLM ] Running LLM risk scenario generator...")

    project_cq_dict = GlobalSharedUtil.read_data_from_json(
        str(CONCEPTION_QUESTIONNAIRE_FILE)
    )
    project_ad_dict = GlobalSharedUtil.read_data_from_json(
        str(ARCHITECTURE_DIAGRAM_FILE)
    )
    question_to_model = GlobalSharedUtil.read_data_from_json(
        str(KB_QUESTION_TO_MODEL_FILE)
    )
    kb_llm_prompt_data = GlobalSharedUtil.read_data_from_json(str(KB_LLM_PROMPT)) or {}
    prompts_dict = kb_llm_prompt_data.get("prompt_template_lines", {})

    project_input_model_extractor = ProjectInputModelExtractor(
        project_ad=project_ad_dict,
        project_cq=project_cq_dict,
        question_to_model=question_to_model,
    )
    project_input_model = (
        project_input_model_extractor.get_project_input_model().project_input_model_dict
    )

    configuration = _build_risk_scenario_configuration()
    system_description = os.environ.get("LLM_SYSTEM_DESCRIPTION", "").strip()
    if system_description:
        configuration.systemDescription = system_description

    generator = LLMRiskScenarioGenerator(
        configuration=configuration,
        prompts_dict=prompts_dict,
        project_input_model=project_input_model,
        mitre_parsed_docs=_read_mitre_parsed_docs(),
        project_register_updater=_NoOpRegisterUpdater(),
        project_id=str(project_ad_dict.get("project_id", "local-project")),
    )
    result = generator.generate()

    timestamp = int(datetime.now().timestamp())
    GlobalSharedUtil.write_to_file(f"risk_scenarios_llm_{timestamp}", result)
    logger.info("[ RR-LLM ] Risk scenario output count=%s", len(result))


if __name__ == "__main__":
    main()
