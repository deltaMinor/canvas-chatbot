import logging
from functools import partial
from typing import TYPE_CHECKING

from engine_libs.lib.bases import LLMSingleTurnBase

from shared_libs.decorators import raise_exception

if TYPE_CHECKING:
    from engine_libs.lib.llm_prompt_builder import LLMPromptBuilder

logger = logging.getLogger(__name__)


class LLMDataflowSingle(LLMSingleTurnBase):
    def __init__(self, prompt: "LLMPromptBuilder"):
        self.promptsClass = prompt
        self.prompt_template_str = self.promptsClass.prompt[0]
        self.image_url = None

    @raise_exception(
        "Failed to set system in llm dataflow single prompt.",
        exception_logger=logger,
    )
    def set_system(self, user_story: str, architecture_diagram_json: dict):
        prompt = str(self.prompt_template_str)
        self.final_message = partial(
            prompt.format,
            user_story=user_story,
            architecture_diagram_json=architecture_diagram_json,
        )
