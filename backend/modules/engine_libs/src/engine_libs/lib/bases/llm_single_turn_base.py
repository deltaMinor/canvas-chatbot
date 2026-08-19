"""Single-turn LLM orchestration helpers.

This module provides :class:`LLMSingleTurnBase`, a reusable base used by
single-request generation flows. It builds multimodal message payloads for
supported LLM adapters and centralizes one-shot invocation patterns.
"""

import logging
from collections.abc import Callable
from typing import Any, cast

from langchain_core.messages import HumanMessage

from shared_libs.decorators import raise_exception
from shared_libs.protocols import LlmModelInstanceProtocol

logger = logging.getLogger(__name__)


class LLMSingleTurnBase:
    """Base class for single-turn prompt execution against polling LLM adapters.

    Attributes:
        final_message: Callable used to build the final text prompt.
        image_url: Optional image URL for multimodal prompts.
    """

    def __init__(self):
        """Initialize default prompt builder and optional image state."""
        self.final_message: Callable[..., str] = lambda **_: ""
        self.image_url: str | None = None

    @raise_exception(
        "Failed to generate path in LLM Generation Single class.",
        exception_logger=logger,
    )
    def generate_path(
        self,
        llm_model: LlmModelInstanceProtocol,
        output_json_struc: str,
        image_url: str | None = None,
    ) -> dict[str, Any] | list[Any] | None:
        """Generate structured output from a single LLM call.

        Builds a text prompt from ``self.final_message`` and optionally attaches an
        image URL as multimodal input, then invokes the provided model and parses
        JSON from its response.

        Args:
            llm_model: Target LLM adapter implementing ``invoke`` and ``extract_json``.
            output_json_struc: String representation of the expected JSON structure.
            image_url: Optional image URL to include with the prompt.

        Returns:
            Parsed JSON dictionary/list when extraction succeeds, otherwise ``None``.
        """
        final_message = self.final_message(result_struc=output_json_struc)
        if "json" not in final_message.lower():
            final_message = (
                f"{final_message}\n\nReturn the response as valid JSON only."
            )

        message_content: list[dict[str, Any]] = [
            {"type": "text", "text": final_message}
        ]

        if image_url is not None:
            message_content.append(
                {
                    "type": "image_url",
                    "image_url": {"url": image_url},
                }
            )

        message = HumanMessage(
            content=cast(list[str | dict[Any, Any]], message_content)
        )
        m = llm_model.invoke([message])
        return llm_model.extract_json(m)

    @raise_exception(
        "Failed to generate threat impact in LLM Generation Single class.",
        exception_logger=logger,
    )
    def generate_threat_impact(
        self,
        llm_model: LlmModelInstanceProtocol,
        final_message: str,
    ) -> str:
        """Generate plain-text threat impact analysis from a single prompt.

        Args:
            llm_model: Target LLM adapter implementing ``invoke``.
            final_message: Final text prompt sent to the model.

        Returns:
            Response content converted to ``str``.
        """
        message_content: list[dict[str, Any]] = [
            {"type": "text", "text": final_message}
        ]
        message = HumanMessage(
            content=cast(list[str | dict[Any, Any]], message_content)
        )
        output = llm_model.invoke([message])
        return str(output.content)
