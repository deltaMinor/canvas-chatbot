import logging
import os

from engine_libs.llm_runtime.config import (
    ALL_MODELS,
    API_MODELS,
    BATCH_MODELS,
    BEDROCK_BATCH_MODELS,
    BEDROCK_MODELS,
    LOCAL_MODELS,
    get_allowed_models,
    get_model_execution_modes,
    parse_execution_mode,
)

from shared_libs.constants.llm import (
    LLM_API_CATALOG,
    LLM_BATCH_CATALOG,
    LLM_BEDROCK_BATCH_CATALOG,
    LLM_BEDROCK_CATALOG,
    LLM_LOCAL_CATALOG,
    LlmCatalogEntry,
)
from shared_libs.domain import KbAssessmentConfigService
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.llm_execution_decision import LlmExecutionDecision
from shared_libs.types import LlmExecutionMode

logger = logging.getLogger(__name__)


class LlmExecutionResolver:
    @staticmethod
    def _env_bool(value: str) -> bool:
        return value.strip().lower() in {"1", "true", "yes", "on"}

    @classmethod
    def _resolve_catalog_env_fields(
        cls, *, model_config: LlmCatalogEntry
    ) -> LlmCatalogEntry:
        resolved: LlmCatalogEntry = dict(model_config)
        apikey_env = str(resolved.get("apikey", "")).strip()
        if apikey_env:
            resolved["apikey"] = os.getenv(apikey_env, "")
        local_url_env = str(resolved.get("local_url", "")).strip()
        if local_url_env:
            resolved["local_url"] = os.getenv(local_url_env, "")
        reasoning_value = resolved.get("reasoning")
        if isinstance(reasoning_value, str):
            resolved["reasoning"] = cls._env_bool(os.getenv(reasoning_value, ""))
        return resolved

    @classmethod
    def _get_mode_model_config(
        cls, *, canonical_llm: str, mode: LlmExecutionMode
    ) -> LlmCatalogEntry:
        model_config: LlmCatalogEntry
        if mode == LlmExecutionMode.API:
            model_config = LLM_API_CATALOG.get(canonical_llm, {})
        elif mode == LlmExecutionMode.LOCAL:
            model_config = LLM_LOCAL_CATALOG.get(canonical_llm, {})
        elif mode == LlmExecutionMode.BATCH:
            model_config = LLM_BATCH_CATALOG.get(canonical_llm, {})
        elif mode == LlmExecutionMode.BEDROCK:
            model_config = LLM_BEDROCK_CATALOG.get(canonical_llm, {})
        elif mode == LlmExecutionMode.BEDROCK_BATCH:
            model_config = LLM_BEDROCK_BATCH_CATALOG.get(canonical_llm, {})
        else:
            model_config = {}
        return cls._resolve_catalog_env_fields(model_config=model_config)

    @staticmethod
    def _assert_model_config_mapped(
        *, model_config: LlmCatalogEntry, canonical_llm: str, mode: LlmExecutionMode
    ) -> None:
        if model_config:
            return
        raise BadRequest(
            f"Model config is not mapped for mode={mode.value} model={canonical_llm}"
        )

    @staticmethod
    def _assert_model_id_configured(*, model_id: str | None, message: str) -> str:
        if model_id:
            return model_id
        raise BadRequest(message)

    @classmethod
    def _resolve_mode_and_source(
        cls,
        *,
        canonical_llm: str,
        execution_mode: str | None,
        trusted_backend_context: bool,
    ) -> tuple[LlmExecutionMode, str, str]:
        if execution_mode:
            if not trusted_backend_context:
                raise PermissionError("execution_mode override is not allowed")
            try:
                mode = cls._normalize_mode(parse_execution_mode(execution_mode))
            except ValueError as exc:
                raise BadRequest(str(exc)) from exc
            return mode, "override", "trusted backend override"

        try:
            mode = cls._normalize_mode(get_model_execution_modes()[canonical_llm])
        except ValueError as exc:
            raise BadRequest(str(exc)) from exc
        return mode, "env", "model preferred execution mode"

    @staticmethod
    def _assert_llm_enabled(*, canonical_llm: str) -> None:
        if canonical_llm in get_allowed_models():
            return
        raise BadRequest(f"LLM is not enabled: {canonical_llm}")

    @staticmethod
    def _assert_execution_mode_typed(
        *, mode: LlmExecutionMode | None
    ) -> LlmExecutionMode:
        if isinstance(mode, LlmExecutionMode):
            return mode
        raise BadRequest(
            f"LLM execution decision mode must be LlmExecutionMode, got {type(mode).__name__}."
        )

    @staticmethod
    def _normalize_mode(mode: LlmExecutionMode | str) -> LlmExecutionMode:
        """Resolve *mode* to a ``LlmExecutionMode`` enum member.

        The canonical input is a ``LlmExecutionMode`` instance.  A raw
        string is a legacy caller shape — a warning is emitted so the caller
        can be updated to pass the enum directly.
        """
        if isinstance(mode, LlmExecutionMode):
            return mode
        logger.warning(
            "_normalize_mode: received raw str '%s' instead of LlmExecutionMode enum."
            " Caller should pass the enum member directly.",
            mode,
        )
        mode_value = str(mode).strip().lower()
        for enum_mode in LlmExecutionMode:
            if enum_mode.value == mode_value:
                return enum_mode
        raise BadRequest(f"Unsupported execution mode: {mode}")

    @staticmethod
    def _get_option_id_to_canonical_llm_map(
        kb_assessment_config_service: KbAssessmentConfigService,
    ) -> dict[str, str]:
        """Build optionId -> canonical llm mapping from assessment config options."""
        mapping: dict[str, str] = {}

        def add_option(option: dict) -> None:
            option_id = str(option.get("optionId", "")).strip()
            canonical = str(option.get("canonicalName", "")).strip()
            if option_id and canonical:
                mapping[option_id] = canonical

        def add_field_options(field: dict) -> None:
            for option in field.get("options", []) or []:
                add_option(option)
            for group in field.get("optionsGroup", []) or []:
                for option in group.get("options", []) or []:
                    add_option(option)

        try:
            payload = kb_assessment_config_service.get_one(
                {"schema_": kb_assessment_config_service.SCHEMA},
                raise_if_not_found=True,
                user_info={},
            )
        except Exception:
            logger.warning(
                "[ RR-LLM-RUNTIME ] Failed to load kb_llm_prompt option mapping from domain service",
                exc_info=True,
            )
            return mapping

        for group_list in (payload.get("defaultOptionsGroup") or {}).values():
            for group in group_list or []:
                for option in group.get("options", []) or []:
                    add_option(option)

        for options in (payload.get("defaultOptions") or {}).values():
            for option in options or []:
                add_option(option)

        questions = payload.get("ai", {}).get("questions", [])
        for question in questions:
            field = question.get("field", {}) if isinstance(question, dict) else {}
            add_field_options(field)

        return mapping

    @classmethod
    def normalize_llm(
        cls,
        raw_llm: str,
        kb_assessment_config_service: KbAssessmentConfigService | None = None,
    ) -> str:
        canonical_llm = raw_llm
        if raw_llm not in ALL_MODELS:
            if kb_assessment_config_service is not None:
                canonical_llm = cls._get_option_id_to_canonical_llm_map(
                    kb_assessment_config_service
                ).get(
                    raw_llm,
                    raw_llm,
                )
        logger.debug(
            "[ RR-LLM-RUNTIME ] Normalizing LLM request: raw_llm=%s canonical_llm=%s",
            raw_llm,
            canonical_llm,
        )
        if canonical_llm in ALL_MODELS:
            return canonical_llm
        raise BadRequest(f"Unsupported LLM: {raw_llm}")

    @classmethod
    def resolve_execution(
        cls,
        *,
        requested_llm: str,
        kb_assessment_config_service: KbAssessmentConfigService | None = None,
        execution_mode: str | None = None,
        trusted_backend_context: bool = False,
    ) -> LlmExecutionDecision:
        canonical_llm = cls.normalize_llm(requested_llm, kb_assessment_config_service)

        cls._assert_llm_enabled(canonical_llm=canonical_llm)

        mode, source, reason = cls._resolve_mode_and_source(
            canonical_llm=canonical_llm,
            execution_mode=execution_mode,
            trusted_backend_context=trusted_backend_context,
        )

        if mode == LlmExecutionMode.API:
            if canonical_llm not in API_MODELS:
                raise BadRequest(
                    f"API execution is not configured for model: {canonical_llm}"
                )
            model_config = cls._get_mode_model_config(
                canonical_llm=canonical_llm, mode=mode
            )
            cls._assert_model_config_mapped(
                model_config=model_config,
                canonical_llm=canonical_llm,
                mode=mode,
            )
            cls._assert_model_id_configured(
                model_id=str(model_config.get("model_id", "")).strip(),
                message=f"API model_id is not configured for model: {canonical_llm}",
            )
        elif mode == LlmExecutionMode.LOCAL:
            if canonical_llm not in LOCAL_MODELS:
                raise BadRequest(
                    f"LOCAL execution is not configured for model: {canonical_llm}"
                )
            model_config = cls._get_mode_model_config(
                canonical_llm=canonical_llm, mode=mode
            )
            cls._assert_model_config_mapped(
                model_config=model_config,
                canonical_llm=canonical_llm,
                mode=mode,
            )
            cls._assert_model_id_configured(
                model_id=str(model_config.get("model_id", "")).strip(),
                message=(
                    f"LOCAL execution model_id is not configured for model: "
                    f"{canonical_llm}"
                ),
            )
        elif mode == LlmExecutionMode.BATCH:
            if canonical_llm not in BATCH_MODELS:
                raise BadRequest(
                    f"BATCH execution is not configured for model: {canonical_llm}"
                )
            model_config = cls._get_mode_model_config(
                canonical_llm=canonical_llm, mode=mode
            )
            cls._assert_model_config_mapped(
                model_config=model_config,
                canonical_llm=canonical_llm,
                mode=mode,
            )
            cls._assert_model_id_configured(
                model_id=str(model_config.get("model_id", "")).strip(),
                message=(
                    f"BATCH execution model_id is not configured for model: "
                    f"{canonical_llm}"
                ),
            )
        elif mode == LlmExecutionMode.BEDROCK:
            if canonical_llm not in BEDROCK_MODELS:
                raise BadRequest(
                    f"BEDROCK execution is not configured for model: {canonical_llm}"
                )
            model_config = cls._get_mode_model_config(
                canonical_llm=canonical_llm, mode=mode
            )
            cls._assert_model_config_mapped(
                model_config=model_config,
                canonical_llm=canonical_llm,
                mode=mode,
            )
            cls._assert_model_id_configured(
                model_id=str(model_config.get("model_id", "")).strip(),
                message=f"BEDROCK model_id is not configured for model: {canonical_llm}",
            )
        elif mode == LlmExecutionMode.BEDROCK_BATCH:
            if canonical_llm not in BEDROCK_BATCH_MODELS:
                raise BadRequest(
                    f"BEDROCK_BATCH execution is not configured for model: {canonical_llm}"
                )
            model_config = cls._get_mode_model_config(
                canonical_llm=canonical_llm, mode=mode
            )
            cls._assert_model_config_mapped(
                model_config=model_config,
                canonical_llm=canonical_llm,
                mode=mode,
            )
            cls._assert_model_id_configured(
                model_id=str(model_config.get("model_id", "")).strip(),
                message=(
                    f"BEDROCK_BATCH model_id is not configured for model: "
                    f"{canonical_llm}"
                ),
            )
        else:
            raise BadRequest(f"Unsupported execution mode: {mode}")

        return LlmExecutionDecision(
            requested_llm=requested_llm,
            canonical_llm=canonical_llm,
            llm_model_config=model_config,
            mode=cls._assert_execution_mode_typed(mode=mode),
            source=source,
            reason=reason,
        )
