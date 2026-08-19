"""Common base utilities for LLM wrappers.

This module defines :class:`GeneralLLMBase`, a lightweight foundation class used by
different LLM runtime implementations. It centralizes shared behaviors such as:

- invoking an attached LLM client,
- extracting JSON payloads from model responses,
- validating response payloads against JSON schemas, and
- attempting schema-aware repair for malformed JSON outputs.
"""

import logging
from typing import Any

from engine_libs.utils.llm_model_util import LLMModelUtil
from jsonschema import validate

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class GeneralLLMBase:
    """Base class for LLM integrations with JSON extraction and validation helpers.

    Attributes:
        response_mode: Optional response mode used by downstream model adapters.
        name: Optional human-readable model/client name.
        llm: Underlying model client implementing ``invoke(message)``.
        repair_prompt: Prompt template used to ask an LLM to repair invalid JSON.
    """

    repair_prompt = """
      The input JSON needs to follow a particular format. The current errors with it are:\
      {error}\
      Repair the given JSON into the following format and return the repaired JSON.\
      Required format: {json_struc}\
      Input JSON: {input_json}
    """

    def __init__(self, response_mode: str | None, name: str | None = None):
        """Initialize common LLM wrapper state.

        Args:
            response_mode: Optional response mode expected by the target model.
            name: Optional label for the configured LLM instance.
        """
        self.response_mode = response_mode
        self.name = name
        self.llm: Any = None

    @raise_exception(
        "Failed to invoke llm model.",
        exception_logger=logger,
    )
    def invoke(self, message):
        """Invoke the configured LLM client with the provided message payload.

        Args:
            message: Message payload accepted by the underlying ``self.llm`` client.

        Returns:
            The raw response returned by ``self.llm.invoke``.
        """
        return self.llm.invoke(message)

    def extract_json(self, ai_content):
        """Extract a JSON object/array from model output content.

        Args:
            ai_content: Model response object or plain content string.

        Returns:
            Parsed JSON-compatible value extracted from the response content.
        """
        return LLMModelUtil.extract_json_from_content(
            getattr(ai_content, "content", ai_content)
        )

    def extract_json_message(self, ai_content):
        """Compatibility wrapper for JSON extraction from model messages.

        Args:
            ai_content: Model response object or plain content string.

        Returns:
            Parsed JSON-compatible value extracted from message content.
        """
        return self.extract_json(ai_content)

    @raise_exception(
        "Failed to check non-empty json.",
        exception_logger=logger,
    )
    def check_nonempty_json(self, schema, returned_result):
        """Validate a returned JSON payload against a schema.

        Args:
            schema: JSON schema used for validation.
            returned_result: JSON payload produced by the model.

        Returns:
            ``True`` if the payload validates successfully, otherwise ``False``.
        """
        try:
            validate(instance=returned_result, schema=schema)
            return True
        except Exception:
            logger.info("[ RR-LLM ] Caught exception - Non empty json error...")
            return False

    @raise_exception(
        "Failed to repair json.",
        exception_logger=logger,
    )
    def repair_json(self, json_struc, schema, returned_result, example=None):
        """Repair invalid JSON by iteratively prompting the model until valid.

        Args:
            json_struc: Expected output structure description shown to the model.
            schema: JSON schema used to validate repaired output.
            returned_result: Initial model output to validate and potentially repair.
            example: Reserved optional example payload for future prompt tuning.

        Returns:
            A schema-valid JSON payload.
        """
        not_right_format = True
        while not_right_format:
            try:
                validate(instance=returned_result, schema=schema)
                return returned_result
            except Exception as e:
                result = self.invoke(
                    self.repair_prompt.format(
                        error=e,
                        json_struc=json_struc,
                        input_json=returned_result,
                    )
                )
                returned_result = self.extract_json(result)
