import logging
from typing import TYPE_CHECKING

from engine_libs.config.llm_config import THREAT_IMPACT_MAX_TRIES
from engine_libs.lib.bases.llm_generator_base import LLMGeneratorBase
from engine_libs.llm_runtime.resolver import LlmExecutionResolver

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.llm_generator_context import (
    GeneratorConfiguration,
    LLMGeneratorRuntimeContext,
)

from .llm_single_threat_impact import LLMThreatImpactSingle

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from shared_libs.protocols import LlmMongoStoreProtocol


class LLMThreatImpactGenerator(LLMGeneratorBase):
    def __init__(
        self,
        configuration: "GeneratorConfiguration",
        project_id: str,
        trusted_backend_context: bool = False,
        *,
        mongo_store: "LlmMongoStoreProtocol | None" = None,
    ):
        from shared_libs.models.llm_generator_context import LLMGeneratorContext

        logger.info("[ RR-LLM ] Initialising LLM Threat Impact Generator...")
        decision = LlmExecutionResolver.resolve_execution(
            requested_llm=configuration.llm,
            execution_mode=None,
            trusted_backend_context=trusted_backend_context,
        )

        super().__init__(
            context=LLMGeneratorContext(
                configuration=configuration,
                llm_key=configuration.llm,
                generator=LLMThreatImpactSingle(),
                runtime=LLMGeneratorRuntimeContext(
                    response_mode="text",
                    project_id=project_id,
                    decision=decision,
                    trusted_backend_context=trusted_backend_context,
                    mongo_store=mongo_store,
                ),
            ),
        )
        self._assert_max_tries_positive(max_tries=THREAT_IMPACT_MAX_TRIES)
        self._assert_llm_initialized(llm=self.llm)

    @raise_exception(
        "Failed to run llm risk scenario generator.",
        exception_logger=logger,
    )
    def generate(self, final_message: str) -> str:
        logger.info("[ RR-LLM ] Generating threat impact...")
        result = ""
        num_tries = 0
        while not result and num_tries < THREAT_IMPACT_MAX_TRIES:
            logger.info(
                "[ RR-LLM ] Generating threat impact - attempt %s..",
                num_tries + 1,
            )
            result = self.llm_generator.generate_threat_impact(
                llm_model=self.llm,
                final_message=final_message,
            )
            num_tries += 1

        return result

    @classmethod
    def _assert_max_tries_positive(cls, *, max_tries: int) -> None:
        if max_tries > 0:
            return
        raise BadRequest("max_tries must be greater than 0.")

    @staticmethod
    def _assert_llm_initialized(*, llm: object | None) -> None:
        if llm is None:
            raise BadRequest("LLM is not initialized.")
