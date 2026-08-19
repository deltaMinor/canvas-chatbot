import json
import logging
from typing import TYPE_CHECKING, cast

from engine_libs.lib.bases.llm_generator_base import LLMGeneratorBase
from engine_libs.lib.llm_prompt_builder import LLMPromptBuilder
from engine_libs.llm_runtime.context import LlmTaskContext
from engine_libs.llm_runtime.resolver import LlmExecutionResolver
from engine_libs.utils.llm_threat_attributes_util import LLMThreatAttributesUtil
from langchain_core.messages import HumanMessage

from shared_libs.decorators import raise_exception
from shared_libs.models.base_models.project import DisplayFrameworksSettings
from shared_libs.models.llm_generator_context import (
    GeneratorConfiguration,
    LLMGeneratorRuntimeContext,
)

from .llm_single_threat_attributes import LLMThreatAttributesSingle

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from shared_libs.protocols import LlmMongoStoreProtocol


class LLMThreatAttributesGenerator(LLMGeneratorBase):
    """Step 3: per-scenario impact/likelihood + framework labels. Per-scenario invocation
    mirrors LLMMitigationGenerator to stay within context windows."""

    def __init__(
        self,
        configuration: GeneratorConfiguration,
        prompts_dict: dict,
        display_frameworks: DisplayFrameworksSettings,
        project_id: str = "",
        task_context: LlmTaskContext | None = None,
        assessment_id: str = "",
        trusted_backend_context: bool = False,
        *,
        mongo_store: "LlmMongoStoreProtocol | None" = None,
    ):
        from shared_libs.models.llm_generator_context import LLMGeneratorContext

        logger.debug("[ RR-LLM ] Initialising LLM Threat Attributes Generator...")
        decision = LlmExecutionResolver.resolve_execution(
            requested_llm=configuration.llm,
            execution_mode=None,
            trusted_backend_context=trusted_backend_context,
        )
        super().__init__(
            context=LLMGeneratorContext(
                configuration=configuration,
                llm_key=configuration.llm,
                generator=LLMThreatAttributesSingle(
                    prompts=LLMPromptBuilder(
                        configuration.role_label,
                        prompts_dict,
                        configuration.attributesPrompt,
                    ),
                ),
                runtime=LLMGeneratorRuntimeContext(
                    response_mode="json",
                    project_id=project_id,
                    task_context=task_context,
                    assessment_id=assessment_id,
                    decision=decision,
                    trusted_backend_context=trusted_backend_context,
                    mongo_store=mongo_store,
                ),
            ),
        )

        self.display_frameworks = display_frameworks
        self._enabled = LLMThreatAttributesUtil.get_enabled_frameworks(
            display_frameworks
        )

    @property
    def enabled_json_keys(self) -> list[str]:
        return [json_key for _, _, _, json_key, _ in self._enabled]

    @property
    def enabled_framework_attrs(self) -> list[tuple[str, str]]:
        return [(attr, json_key) for attr, _, _, json_key, _ in self._enabled]

    @staticmethod
    def _safe_ai_message_text(ai_message: object, max_chars: int = 300) -> str:
        content = getattr(ai_message, "content", "")
        text = content if isinstance(content, str) else str(content)
        if len(text) <= max_chars:
            return text
        return f"{text[:max_chars]} ...[truncated {len(text) - max_chars} chars]"

    @raise_exception(
        "Failed to generate threat attributes for scenario.",
        exception_logger=logger,
    )
    def generate_for_scenario(
        self,
        scenario_payload: dict,
        max_tries: int = 3,
    ) -> dict:
        """Return LLM-emitted attributes for one scenario, or {} on total failure.
        Retries on extract_json failure or missing impact_score."""
        scenario_json = json.dumps(scenario_payload, ensure_ascii=False, indent=2)
        gen_option = cast(LLMThreatAttributesSingle, self.llm_generator)
        final_message = gen_option.format_for_scenario(
            scenario_json=scenario_json,
            frameworks_intro_list=LLMThreatAttributesUtil.build_intro_list(
                self._enabled
            ),
            frameworks_instructions_list=LLMThreatAttributesUtil.build_instructions_list(
                self._enabled
            ),
            result_struc=LLMThreatAttributesUtil.build_result_struc(self._enabled),
        )

        threat_id = ""
        try:
            threat_id = (scenario_payload.get("threats") or [{}])[0].get(
                "threat_id", ""
            )
        except Exception:  # noqa: BLE001
            pass
        logger.debug(
            "[ RR-LLM ] Threat attributes final prompt (scenario=%s, frameworks=%s):\n%s",
            threat_id,
            self.enabled_json_keys,
            final_message,
        )

        for attempt in range(1, max_tries + 1):
            logger.debug("Generating threat attributes - attempt %s...", attempt)
            message = HumanMessage(content=[{"type": "text", "text": final_message}])
            ai_message = self.llm.invoke([message])
            try:
                result = self.llm.extract_json(ai_message)
            except Exception as exc:  # noqa: BLE001
                logger.warning(
                    "Failed to extract JSON for threat attributes: %s. raw_output_sample=%s",
                    exc,
                    self._safe_ai_message_text(ai_message),
                )
                continue
            if not isinstance(result, dict):
                logger.warning(
                    "Threat attributes parsed non-dict on attempt %s/%s. raw_output_sample=%s",
                    attempt,
                    max_tries,
                    self._safe_ai_message_text(ai_message),
                )
                continue
            threats = result.get("threats") or []
            if not threats or not isinstance(threats[0], dict):
                if attempt < max_tries:
                    logger.warning(
                        "Threat attributes parsed empty/invalid on attempt %s/%s; retrying.",
                        attempt,
                        max_tries,
                    )
                else:
                    logger.warning(
                        "Threat attributes parsed empty/invalid on final attempt %s/%s.",
                        attempt,
                        max_tries,
                    )
                continue
            attrs = threats[0]
            if not LLMThreatAttributesUtil.clamp_score(attrs.get("impact_score")):
                if attempt < max_tries:
                    logger.warning(
                        "Threat attributes missing impact_score on attempt %s/%s; retrying.",
                        attempt,
                        max_tries,
                    )
                else:
                    logger.warning(
                        "Threat attributes missing impact_score on final attempt %s/%s.",
                        attempt,
                        max_tries,
                    )
                continue
            return attrs
        return {}

    @staticmethod
    def clamp_score(value) -> int:
        return LLMThreatAttributesUtil.clamp_score(value)

    @staticmethod
    def as_str_list(value) -> list[str]:
        return LLMThreatAttributesUtil.as_str_list(value)
