import logging
from typing import TYPE_CHECKING, TypeVar

from engine_libs.config.runtime_config import MODULE_TEST
from engine_libs.llm_models import (
    BatchOllamaPollingLLM,
    BedrockBatchPollingLLM,
    BedrockPollingLLM,
    GeminiPollingLLM,
    LocalOllamaPollingLLM,
    OpenAIPollingLLM,
)

from shared_libs.constants.llm import resolve_llm_label
from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.lib.global_shared_util import GlobalSharedUtil
from shared_libs.models.llm_generator_context import LLMGeneratorContext
from shared_libs.models.mongo_polling_llm_context import MongoPollingLLMContext
from shared_libs.types import LlmExecutionMode

if TYPE_CHECKING:
    from engine_libs.llm_runtime.context import LlmTaskContext

    from shared_libs.models.llm_execution_decision import LlmExecutionDecision
    from shared_libs.models.llm_generator_context import LLMGeneratorRuntimeContext
    from shared_libs.protocols import (
        LLMGeneratorAdapterProtocol,
        LlmModelInstanceProtocol,
        LlmMongoStoreProtocol,
    )

T = TypeVar("T")

logger = logging.getLogger(__name__)


class LLMGeneratorBase:
    def __init__(
        self,
        context: "LLMGeneratorContext",
    ) -> None:
        from shared_libs.models.llm_generator_context import LLMGeneratorContext

        if not isinstance(context, LLMGeneratorContext):
            raise BadRequest("context must be an instance of LLMGeneratorContext.")

        # ====== INPUT ======
        self.context = context

        # ====== RUNTIME STATE ======
        self.llm: LlmModelInstanceProtocol | None = None
        self.llm_generator: LLMGeneratorAdapterProtocol = (
            self._assert_generator_required(generator=context.generator)
        )
        self.llm_progress = context.progress

        # ====== INITIALIZATION ======
        self.init_polling_llm(context=context)

    @raise_exception(
        "Failed to init llm.",
        exception_logger=logger,
    )
    def init_polling_llm(
        self,
        context: "LLMGeneratorContext",
    ) -> None:
        llm_value = context.configuration.llm
        self._assert_llm_option_required(type_option=llm_value)

        runtime_context: LLMGeneratorRuntimeContext = context.runtime
        task_context: LlmTaskContext | None = runtime_context.task_context
        project_id = runtime_context.project_id
        queue_name = task_context.queue_name if task_context else ""
        decision = self._assert_decision_required(decision=runtime_context.decision)

        task_name = task_context.task_name if task_context else ""
        task_type = task_context.task_type if task_context else ""
        self.llm_execution_decision = decision
        decision_mode = self._assert_execution_mode(mode=decision.mode)
        decision_mode_value = decision_mode.value

        logger.info(
            "[ RR-LLM ] Resolved LLM runtime: project_id=%s queue_name=%s task_name=%s task_type=%s requested_llm=%s canonical_llm=%s mode=%s model_id=%s source=%s reason=%s",
            project_id,
            queue_name,
            task_name,
            task_type,
            decision.requested_llm,
            decision.canonical_llm,
            decision_mode_value,
            decision.llm_model_config.get("model_id", ""),
            decision.source,
            decision.reason,
        )

        self.llm = self._build_polling_llm(context=context, decision=decision)

    @raise_exception(
        "Failed to build polling llm.",
        exception_logger=logger,
    )
    def _build_polling_llm(
        self,
        context: "LLMGeneratorContext",
        decision: "LlmExecutionDecision",
    ) -> "LlmModelInstanceProtocol":
        """Construct a polling LLM from a resolved execution decision."""
        runtime_context: LLMGeneratorRuntimeContext = context.runtime
        response_mode = runtime_context.response_mode
        task_context: LlmTaskContext | None = runtime_context.task_context
        project_id = runtime_context.project_id
        assessment_id = runtime_context.assessment_id
        mongo_store: LlmMongoStoreProtocol | None = runtime_context.mongo_store
        generation_heartbeat_getter = runtime_context.generation_heartbeat_getter
        progress_info_reporter = runtime_context.progress_info_reporter
        decision_mode = self._assert_execution_mode(mode=decision.mode)
        decision_mode_value = decision_mode.value
        llm_display_name = resolve_llm_label(
            runtime_model_key=decision.canonical_llm,
        )
        self._assert_polling_store_required(mongo_store=mongo_store)

        polling_context = MongoPollingLLMContext(
            response_mode=response_mode,
            canonical_llm=decision.canonical_llm,
            llm_model_config=decision.llm_model_config,
            name=llm_display_name,
            task_context=task_context,
            project_id=project_id,
            assessment_id=assessment_id,
            mongo_store=mongo_store,
            generation_heartbeat_getter=generation_heartbeat_getter,
            progress_info_reporter=progress_info_reporter,
        )

        if decision_mode == LlmExecutionMode.API:
            provider = (
                str(decision.llm_model_config.get("provider", "")).strip().lower()
            )
            if provider == "google":
                return GeminiPollingLLM(context=polling_context)
            if provider == "openai":
                return OpenAIPollingLLM(context=polling_context)
            raise BadRequest(
                f"API provider is not supported for model: {decision.canonical_llm}"
            )
        if decision_mode == LlmExecutionMode.LOCAL:
            return LocalOllamaPollingLLM(context=polling_context)
        if decision_mode == LlmExecutionMode.BATCH:
            return BatchOllamaPollingLLM(context=polling_context)
        if decision_mode == LlmExecutionMode.BEDROCK:
            return BedrockPollingLLM(context=polling_context)
        if decision_mode == LlmExecutionMode.BEDROCK_BATCH:
            return BedrockBatchPollingLLM(context=polling_context)
        raise BadRequest(f"LLM execution mode is not supported: {decision_mode_value}")

    @raise_exception(
        "Failed to build stage llm.",
        exception_logger=logger,
    )
    def build_stage_llm(
        self,
        stage_model_field: str,
    ) -> "LlmModelInstanceProtocol":
        """Return a polling LLM for one pipeline stage.

        Reuses :meth:`GeneratorConfiguration.for_stage` for the model-selection
        fallback.
        When the stage resolves to the generation model, the generation
        ``self.llm`` instance is reused instead of building a new one.
        """
        from engine_libs.llm_runtime.resolver import LlmExecutionResolver

        stage_config = self.context.configuration.for_stage(stage_model_field)
        requested = str(stage_config.llm or "")
        generation = str(self.context.configuration.llm or "")
        if not requested or requested == generation:
            return self._assert_llm_initialized(llm=self.llm)

        decision = LlmExecutionResolver.resolve_execution(
            requested_llm=requested,
            execution_mode=None,
            trusted_backend_context=self.context.runtime.trusted_backend_context,
        )
        return self._build_polling_llm(context=self.context, decision=decision)

    @staticmethod
    def _assert_generator_required(
        *, generator: "LLMGeneratorAdapterProtocol | None"
    ) -> "LLMGeneratorAdapterProtocol":
        if generator is not None:
            return generator
        raise BadRequest("context.generator is required.")

    @staticmethod
    def _assert_llm_initialized(
        *, llm: "LlmModelInstanceProtocol | None"
    ) -> "LlmModelInstanceProtocol":
        if llm is not None:
            return llm
        raise BadRequest("LLM is not initialized.")

    @staticmethod
    def _assert_llm_option_required(*, type_option: str) -> None:
        if type_option.strip():
            return
        raise BadRequest("configuration.llm is required.")

    @staticmethod
    def _assert_not_none(*, value: T | None, message: str) -> T:
        if value is not None:
            return value
        raise BadRequest(message)

    @staticmethod
    def _assert_decision_required(
        *, decision: "LlmExecutionDecision | None"
    ) -> "LlmExecutionDecision":
        if decision is not None:
            return decision
        raise BadRequest("context.runtime.decision is required.")

    @staticmethod
    def _assert_execution_mode(*, mode: LlmExecutionMode | None) -> LlmExecutionMode:
        if isinstance(mode, LlmExecutionMode):
            return mode
        raise BadRequest(
            f"context.runtime.decision.mode must be LlmExecutionMode, got {type(mode).__name__}."
        )

    @staticmethod
    def _assert_nonempty_string(*, value: str, message: str) -> None:
        if value.strip():
            return
        raise BadRequest(message)

    @staticmethod
    def _assert_polling_store_required(
        *, mongo_store: "LlmMongoStoreProtocol | None"
    ) -> None:
        if mongo_store is not None:
            return
        raise BadRequest("mongo_store is required for polling execution modes.")

    @raise_exception(
        "Failed to generate paths.",
        exception_logger=logger,
    )
    def generate_paths(
        self,
        schema: dict[str, object],
        path_struc: str,
        max_tries: int = 5,
    ) -> dict[str, object] | list[object]:
        llm = self._assert_llm_initialized(llm=self.llm)
        paths: dict[str, object] | list[object] = []
        num_tries = 0
        progress = 0

        while not llm.check_nonempty_json(schema, paths) and num_tries < max_tries:
            logger.info("[ RR-LLM ] Generating paths - attempt %s...", num_tries + 1)
            next_paths = self.llm_generator.generate_path(
                llm, path_struc, self.llm_generator.image_url
            )
            paths = self._assert_not_none(
                value=next_paths,
                message=f"LLM returned None for paths on attempt {num_tries + 1}.",
            )

            # Progress
            if self.llm_progress.track_progress:
                get_progress = GlobalSharedUtil.check_update_progress(
                    iteration=num_tries,
                    min_progress=self.llm_progress.min_progress or 0,
                    max_progress=self.llm_progress.max_progress or 0,
                    increment=1,
                    total_steps=max_tries,
                )
                if (
                    get_progress > progress
                    and not MODULE_TEST
                    and self.llm_progress.project_register_updater is not None
                ):
                    progress = get_progress
                    self.llm_progress.project_register_updater.update_assessment_progress(
                        get_progress,
                        progress_info="Generating LLM-assisted attack paths.",
                    )

            num_tries = num_tries + 1

        paths = self._assert_not_none(
            value=paths,
            message="LLM path output is None after retries.",
        )

        path_count = len(paths) if hasattr(paths, "__len__") else 0
        logger.info("[ RR-LLM ] LLM output path count=%s. Starting repair.", path_count)
        # Repair path if not in right format...
        repaired_paths = llm.repair_json(
            json_struc=path_struc, schema=schema, returned_result=paths
        )
        repaired_paths = self._assert_not_none(
            value=repaired_paths,
            message="Repaired paths returned None.",
        )
        logger.info(
            "[ RR-LLM ] LLM output repair complete. repaired_path_count=%s",
            len(repaired_paths) if hasattr(repaired_paths, "__len__") else 0,
        )

        return repaired_paths
