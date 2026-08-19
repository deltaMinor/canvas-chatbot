"""Base class for chain-style LLM generation flows."""

import time
from functools import partial
from typing import Any, cast

from engine_libs.lib.llm_prompt_builder import LLMPromptBuilder
from langchain_core.messages import BaseMessage, HumanMessage
from tqdm import tqdm

from shared_libs.protocols import LlmModelInstanceProtocol


class LLMChainBase:
    """Shared utilities for multi-stage chain generators."""

    def __init__(self, prompts: LLMPromptBuilder) -> None:
        self.promptsClass = prompts
        self.gen_option_prompt = self.promptsClass.prompt
        self.first_prompt_line = self.gen_option_prompt[0]
        self.list_prompt = self.gen_option_prompt[1:]
        self.llm: LlmModelInstanceProtocol | None = None
        self.image_url: str | None = None
        self.system_description: str | None = None
        self.final_message: Any | None = None
        self.summary_sender_name = "Summary Bot"

    def _get_result_struc_for_initial_prompt(self) -> Any:
        raise NotImplementedError

    def build_graph(self) -> Any:
        raise NotImplementedError

    def set_system(
        self,
        system_description: str | bytes | bytearray | memoryview,
        system_description_type: str,
    ) -> None:
        self.image_url = None
        if isinstance(system_description, str):
            system_description_text = system_description
        else:
            system_description_text = bytes(system_description).decode(
                "utf-8", errors="ignore"
            )

        system_description_explanation = (
            self.promptsClass.input_system_img
            if system_description_type == "image"
            else self.promptsClass.input_system_str
        ) + "."

        if system_description_type == "image":
            self.image_url = system_description_text
            self.final_message = partial(
                self.first_prompt_line.format,
                system_description_explanation=system_description_explanation,
            )

        if system_description_type == "text":
            self.system_description = system_description_text
            self.first_prompt_line += (
                self.promptsClass.input_temp_general
                + self.promptsClass.input_temp_system_desc
            )
            self.final_message = partial(
                self.first_prompt_line.format,
                system_description_explanation=system_description_explanation,
                system_description=system_description_text,
            )

    def _assert_system_set(self) -> None:
        if self.final_message is None:
            raise ValueError("System not set. Call set_system() first.")

    def _assert_llm_set(self) -> None:
        if self.llm is None:
            raise ValueError("LLM model not set.")

    def generate_path(
        self,
        llm_model: "LlmModelInstanceProtocol",
        output_json_struc: Any | None = None,
    ) -> dict[str, Any] | None:
        del output_json_struc
        self._assert_system_set()
        final_message = self.final_message(
            result_struc=self._get_result_struc_for_initial_prompt()
        )

        self.llm = llm_model
        graph = self.build_graph()

        message_content: list[dict[str, Any]] = [
            {"type": "text", "text": final_message}
        ]
        if self.image_url is not None:
            system_description = self.image_url
            message_content.append(
                {
                    "type": "image_url",
                    "image_url": {"url": self.image_url},
                }
            )
        else:
            system_description = self.system_description

        initial_messages = cast(
            list[BaseMessage],
            [
                HumanMessage(
                    content=cast(list[str | dict[Any, Any]], message_content),
                    additional_kwargs={"system_description": system_description},
                )
            ],
        )
        initial_state = {
            "messages": initial_messages,
            "formatted_messages": {},
            "system_description": system_description or "",
            "sender": "",
        }

        for stream_item in graph.stream(initial_state):
            if "__end__" in stream_item:
                continue
            for sender in stream_item:
                if (
                    sender == self.summary_sender_name
                    and "formatted_messages" in stream_item[sender]
                ):
                    return stream_item[sender]["formatted_messages"]
        return None

    def _agent_recurse_node(
        self,
        state: dict[str, Any],
        agent: Any,
        name: str,
        numtries: int = 10,
    ) -> dict[str, Any]:
        all_result: list[dict[str, Any]] = []
        all_message: list[str] = []

        list_messages = state["formatted_messages"]
        if isinstance(list_messages, dict):
            for message_key in list_messages.keys():
                message_value = list_messages[message_key]
                result = agent.invoke_agent_retries(
                    message_key,
                    message_value,
                    cast(dict[str, Any], state),
                    numtries=numtries,
                )
                if result is not None:
                    all_result.append(result)
                    all_message.append(message_key)

        return agent.construct_output(
            all_result, all_message, cast(dict[str, Any], state), name
        )

    def _first_agent_node(
        self,
        state: dict[str, Any],
        agent: Any,
        name: str,
        numtries: int = 10,
    ) -> dict[str, Any]:
        result: dict[str, Any] | None = None

        for _ in tqdm(range(numtries)):
            time.sleep(2)
            result = agent.invoke_agent(cast(dict[str, Any], state))
            if result is not None:
                break

        if result is None:
            result = {}

        return agent.construct_output(result, cast(dict[str, Any], state), name)
