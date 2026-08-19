import json
import logging
from typing import TYPE_CHECKING, cast

from engine_libs.config.llm_config import (
    LLM_MITIGATION_DESC_ALIASES,
    LLM_MITIGATION_ID_ALIASES,
    LLM_MITIGATION_LIST_KEYS,
    LLM_MITIGATION_MAX_DEBUG_SAMPLE_CHARS,
    LLM_MITIGATION_NAME_ALIASES,
)
from engine_libs.lib.bases.llm_generator_base import LLMGeneratorBase
from engine_libs.lib.llm_prompt_builder import LLMPromptBuilder
from engine_libs.llm_runtime.context import LlmTaskContext
from engine_libs.llm_runtime.resolver import LlmExecutionResolver
from langchain_core.messages import HumanMessage

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.llm_generator_context import (
    GeneratorConfiguration,
    LLMGeneratorRuntimeContext,
)

from .llm_single_mitigation import LLMMitigationSingle

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from shared_libs.protocols import LlmMongoStoreProtocol


class LLMMitigationGenerator(LLMGeneratorBase):
    """Generate MITRE ATT&CK mitigations for a single risk scenario.

    The LLM context window is limited, so the orchestrator instantiates this
    once and calls :meth:`generate_for_scenario` once per scenario rather than
    bundling every scenario into one prompt.
    """

    @staticmethod
    def _first_alias(d: dict, keys: tuple[str, ...]) -> str:
        for k in keys:
            v = d.get(k)
            if v:
                return str(v).strip()
        return ""

    @classmethod
    def _normalise_mitigation(cls, mit: dict) -> dict:
        """Rewrite an LLM mitigation dict to the canonical alias keys."""
        normalised = dict(mit)
        normalised["mitre_mitigation_id"] = cls._first_alias(
            mit, LLM_MITIGATION_ID_ALIASES
        )
        normalised["mitre_mitigation_name"] = cls._first_alias(
            mit, LLM_MITIGATION_NAME_ALIASES
        )
        normalised["mitre_mitigation_description"] = cls._first_alias(
            mit, LLM_MITIGATION_DESC_ALIASES
        )
        return normalised

    @staticmethod
    def _step_technique_id(step: dict) -> str:
        tech = step.get("mitre_attack_technique") or {}
        if isinstance(tech, dict):
            tid = (tech.get("technique_id") or tech.get("techniqueId") or "").strip()
            if tid:
                return tid
        return str(step.get("technique_id") or step.get("techniqueId") or "").strip()

    @classmethod
    def _extract_mitigations(cls, result: dict) -> list[dict]:
        mitigations: list[dict] = []
        seen_pairs: set[tuple[str, str]] = set()

        def _collect(mit: dict, technique_id: str) -> None:
            if not isinstance(mit, dict):
                return
            canonical = cls._normalise_mitigation(mit)
            canonical["for_technique_id"] = technique_id
            mid = canonical.get("mitre_mitigation_id", "")
            if mid:
                key = (mid, technique_id)
                if key in seen_pairs:
                    return
                seen_pairs.add(key)
            mitigations.append(canonical)

        def _collect_from(container: dict, technique_id: str) -> None:
            for key in LLM_MITIGATION_LIST_KEYS:
                for mit in container.get(key, []) or []:
                    _collect(mit, technique_id)

        for threat in result.get("threats", []) or []:
            if not isinstance(threat, dict):
                continue
            _collect_from(threat, "")
            for step in threat.get("attack_path", []) or []:
                if not isinstance(step, dict):
                    continue
                _collect_from(step, cls._step_technique_id(step))
        return mitigations

    @staticmethod
    def _truncate_for_log(
        value: str, max_chars: int = LLM_MITIGATION_MAX_DEBUG_SAMPLE_CHARS
    ) -> str:
        if len(value) <= max_chars:
            return value
        return f"{value[:max_chars]} ...[truncated {len(value) - max_chars} chars]"

    @classmethod
    def _safe_ai_message_text(cls, ai_message) -> str:
        content = getattr(ai_message, "content", "")
        if isinstance(content, str):
            return cls._truncate_for_log(content)
        try:
            return cls._truncate_for_log(json.dumps(content, ensure_ascii=False))
        except TypeError:
            return cls._truncate_for_log(str(content))

    def __init__(
        self,
        configuration: GeneratorConfiguration,
        prompts_dict: dict,
        project_id: str = "",
        task_context: LlmTaskContext | None = None,
        assessment_id: str = "",
        trusted_backend_context: bool = False,
        *,
        mongo_store: "LlmMongoStoreProtocol | None" = None,
    ):
        from shared_libs.models.llm_generator_context import LLMGeneratorContext

        logger.debug("[ RR-LLM ] Initialising LLM Mitigation Generator...")
        decision = LlmExecutionResolver.resolve_execution(
            requested_llm=configuration.llm,
            execution_mode=None,
            trusted_backend_context=trusted_backend_context,
        )
        super().__init__(
            context=LLMGeneratorContext(
                configuration=configuration,
                llm_key=configuration.llm,
                generator=LLMMitigationSingle(
                    prompts=LLMPromptBuilder(
                        configuration.role_label,
                        prompts_dict,
                        configuration.mitigationPrompt,
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

    @raise_exception(
        "Failed to generate mitigations for scenario.",
        exception_logger=logger,
    )
    def generate_for_scenario(
        self,
        scenario_payload: dict,
        max_tries: int = 1,
    ) -> list[dict]:
        """Return the LLM-emitted mitigation list for one scenario.

        The prompt asks for ``{"threats": [{"mitigation": [...]}]}``; in
        practice models also place mitigations under ``attack_path[*]`` and
        rename keys (see ``_extract_mitigations``). We accept both shapes and
        flatten into a single per-scenario list.

        Two retry triggers:
          1. ``extract_json`` failed (no JSON parsed at all) — try again.
          2. JSON parsed but yielded zero mitigations — models occasionally
             return ``{"threats": [{"mitigation": []}]}`` for no obvious
             reason; a second sample usually gets a populated list.
        """
        scenario_json = json.dumps(scenario_payload, ensure_ascii=False, indent=2)
        gen_option = cast(LLMMitigationSingle, self.llm_generator)
        final_message = gen_option.format_for_scenario(scenario_json)

        mitigations: list[dict] = []
        last_extract_error: Exception | None = None
        for attempt in range(1, max_tries + 1):
            message = HumanMessage(content=[{"type": "text", "text": final_message}])
            ai_message = self.llm.invoke([message])
            try:
                result = self.llm.extract_json(ai_message)
            except Exception as exc:  # noqa: BLE001
                last_extract_error = exc
                logger.warning(
                    "Failed to extract JSON for mitigations: %s. raw_output_sample=%s",
                    exc,
                    self._safe_ai_message_text(ai_message),
                )
                continue
            if not isinstance(result, dict):
                logger.info(
                    "[ RR-LLM ] Mitigation parse-nondict for threat_id=%s attempt=%s/%s raw_output_sample=%s",
                    ((scenario_payload.get("threats") or [{}])[0] or {}).get(
                        "threat_id"
                    )
                    or "unknown",
                    attempt,
                    max_tries,
                    self._safe_ai_message_text(ai_message),
                )
                continue
            mitigations = self._extract_mitigations(result)
            if mitigations:
                return mitigations
            logger.info(
                "[ RR-LLM ] Mitigation parse-empty for threat_id=%s attempt=%s/%s raw_output_sample=%s parsed_json_sample=%s",
                ((scenario_payload.get("threats") or [{}])[0] or {}).get("threat_id")
                or "unknown",
                attempt,
                max_tries,
                self._safe_ai_message_text(ai_message),
                self._truncate_for_log(json.dumps(result, ensure_ascii=False)),
            )
            if attempt < max_tries:
                logger.warning(
                    "Mitigation generator parsed 0 entries on attempt %s/%s; retrying.",
                    attempt,
                    max_tries,
                )

        threat_id = ((scenario_payload.get("threats") or [{}])[0] or {}).get(
            "threat_id"
        ) or "unknown"
        extract_error_suffix = (
            f" Last extract error: {last_extract_error}" if last_extract_error else ""
        )
        raise BadRequest(
            "LLM mitigation generation produced no usable entries after "
            f"{max_tries} attempts for threat_id={threat_id}."
            f"{extract_error_suffix}"
        )
