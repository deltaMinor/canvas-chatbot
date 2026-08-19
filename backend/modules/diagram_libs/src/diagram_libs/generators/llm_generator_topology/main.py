import logging
import os
from datetime import datetime
from typing import Any

from engine_libs.config.path_config import (
    ARCHITECTURE_DIAGRAM_FILE,
    KB_LLM_PROMPT,
    KB_QUESTION_TO_MODEL_FILE,
)

from shared_libs.lib.global_shared_util import GlobalSharedUtil
from shared_libs.models.llm_generator_context import GeneratorConfiguration
from shared_libs.types.enum import LLM, LLMGenerationOption, PromptRole

from .llm_generator_topology import LLMTopologyGenerator

logger = logging.getLogger(__name__)


class _InMemoryService:
    def __init__(self, payload: dict[str, Any]):
        self._payload = payload

    def get_one(self, *_args: Any, **_kwargs: Any) -> dict[str, Any]:
        return self._payload


class _InMemoryRegisterDataStore:
    def __init__(
        self,
        *,
        question_to_model: dict[str, Any],
        llm_prompt_template_lines: dict[str, Any],
    ) -> None:
        self.question_to_model = question_to_model
        self.llm_prompt_template_lines = llm_prompt_template_lines


def setup_loggers() -> None:
    handler = logging.StreamHandler()
    app_logger_level = os.environ.get("APP_LOGGER_LEVEL", logging.DEBUG)
    logger.setLevel(app_logger_level)
    logger.addHandler(handler)


def _build_topology_configuration() -> GeneratorConfiguration:
    return GeneratorConfiguration.model_validate(
        {
            "role_label": PromptRole.projectManager.value,
            "llm": LLM.openai_gpt_5_2_api.value,
            "generationOption": LLMGenerationOption.diagram.value,
            "prompt": [],
            "diagram_image": "",
            "diagram_layout_hints": {},
            "icon_list": [],
            "cluster_icon_list": [],
        }
    )


def main() -> None:
    setup_loggers()

    project_ad_dict = GlobalSharedUtil.read_data_from_json(
        str(ARCHITECTURE_DIAGRAM_FILE)
    )
    question_to_model = GlobalSharedUtil.read_data_from_json(
        str(KB_QUESTION_TO_MODEL_FILE)
    )
    kb_llm_prompt_data = GlobalSharedUtil.read_data_from_json(str(KB_LLM_PROMPT)) or {}
    prompts_dict = kb_llm_prompt_data.get("prompt_template_lines", {})

    register_data_store = _InMemoryRegisterDataStore(
        question_to_model=question_to_model or {},
        llm_prompt_template_lines=prompts_dict,
    )
    project_ad_service = _InMemoryService(payload=project_ad_dict or {})

    project_id = str(project_ad_dict.get("project_id", "local-project"))

    logger.info("[ RR-LLM ] Running project-level LLM topology generator...")
    topology_generator = LLMTopologyGenerator(
        project_id=project_id,
        user_info={},
        configuration=_build_topology_configuration().model_dump(),
        tosca_mapping={},
        project_ad_service=project_ad_service,  # type: ignore[arg-type]
        register_data_store=register_data_store,
        task_context=None,
        mongo_store=None,  # type: ignore[arg-type]
    )
    topology_generator.run()

    timestamp = int(datetime.now().timestamp())
    GlobalSharedUtil.write_to_file(
        f"topology_llm_{timestamp}", topology_generator.project_ad_model.model_dump()
    )


if __name__ == "__main__":
    main()
