"""Prompt template assembly helpers for LLM generators.

This module provides the ``LLMPromptBuilder`` class used by LLM generators to build the
final prompt text from configurable prompt fragments (typically loaded from
``kb_llm_prompt``-style config JSON).

What this is used for:
- Normalizing role + prompt fragments into per-phase prompt strings.
- Replacing common placeholders such as ``{role}``.
- Exposing assembled prompt phases via ``Prompts.prompt`` for downstream
  generator classes (for example scenario, mitigation, and threat-attribute
  single-turn generators).

How it is used:
1. A generator creates ``LLMPromptBuilder(role, prompts_dict, prompt)``.
2. ``prompts_dict`` fields are attached as attributes on the instance so
   generators can reference reusable prompt constants.
3. ``prompt`` (list of phases, each phase is a list of prompt
   chunks) is flattened into ``self.prompt`` where each entry is one phase.
4. Generators consume ``self.prompt[0]`` (or multiple phases where applicable)
   and fill runtime placeholders (for example scenario JSON, schema, or system
   description) before invoking the LLM.
"""

import logging

from shared_libs.decorators import raise_exception

from .llm_prompt_util import LLMPromptUtil

logger = logging.getLogger(__name__)


class LLMPromptBuilder:
    """Build phase-based prompt strings from configured prompt fragments.

    The object holds:
    - ``prompt_role``: role string used for ``{role}`` replacement.
    - dynamic attributes copied from ``prompts_dict`` (for reusable snippets).
    - ``prompt``: assembled list[str] where each item is a full prompt phase.
    """

    input_system_img: str
    input_system_diagram_img: str
    input_system_str: str
    input_temp_general: str
    input_temp_system_desc: str

    def __init__(
        self,
        role: str,
        prompts_dict: dict,
        prompt: list,
    ):
        logger.debug("[ RR-LLM ] Initialising prompts from prompt input dictionary....")
        self.init_role(role)
        self.init_prompts_dict(prompts_dict)
        self.prompt = self.get_prompt(prompt)

    @raise_exception(
        "Failed to init role.",
        exception_logger=logger,
    )
    def init_role(self, role: str):
        self.prompt_role = role

    @raise_exception(
        "Failed to init prompts.",
        exception_logger=logger,
    )
    def init_prompts_dict(self, prompts_dict: dict):
        self.assign_attributes_from_dict(prompts_dict)

    def assign_attributes_from_dict(self, input_data: dict):
        for key, value in input_data.items():
            setattr(self, key, value)

    @raise_exception(
        "Failed to get prompts.",
        exception_logger=logger,
    )
    def get_prompt(self, prompt: list):
        output = []
        for phase_list in prompt:
            phase_line = ""
            for r in phase_list:
                user_input = r.get("userInput", "")
                if "{role}" in user_input:
                    user_input = user_input.replace("{role}", self.prompt_role)
                phase_line += " " + user_input
            output.append(phase_line)

        return output

    @raise_exception(
        "Failed to combine inputs.",
        exception_logger=logger,
    )
    @staticmethod
    def combine_inputs(list_input: dict):
        start_input = "You are given"
        for i in list_input:
            inp = i[13:-1]
            start_input += inp + ", "
        start_input = LLMPromptUtil.add_word_and_to_sentence(start_input[:-2])

        return start_input + "."
