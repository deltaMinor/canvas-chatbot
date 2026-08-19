import logging
from functools import cached_property
from typing import TYPE_CHECKING, cast

from engine_libs.lib.bases.llm_generator_base import LLMGeneratorBase
from engine_libs.lib.llm_prompt_builder import LLMPromptBuilder
from engine_libs.lib.project_input_model_extractor import ProjectInputModelExtractor
from engine_libs.lib.system_description_extractor import (
    SystemDescriptionExtractor,
)
from engine_libs.llm_runtime.context import LlmTaskContext
from engine_libs.llm_runtime.resolver import LlmExecutionResolver
from engine_libs.struc import LLMReturnStructDataflow

from shared_libs.decorators import raise_exception
from shared_libs.domain import ProjectADService, ProjectCQService
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.database_models import ProjectADModel, ProjectCQModel
from shared_libs.models.llm_generator_context import (
    GeneratorConfiguration,
    LLMGeneratorRuntimeContext,
)
from shared_libs.utils.diagram_output_parser import DiagramOutputParser

from .llm_single_dataflow import LLMDataflowSingle

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from shared_libs.protocols import LlmMongoStoreProtocol


class _LLMDataflowWorker(LLMGeneratorBase):
    def __init__(
        self,
        configuration: "GeneratorConfiguration",
        project_input_model: dict,
        prompts_dict: dict,
        project_id: str = "",
        task_context: LlmTaskContext | None = None,
        trusted_backend_context: bool = False,
        *,
        mongo_store: "LlmMongoStoreProtocol | None" = None,
    ):
        from shared_libs.models.llm_generator_context import LLMGeneratorContext

        logger.info("[ RR-LLM ] Initialising LLM Dataflow worker...")
        decision = LlmExecutionResolver.resolve_execution(
            requested_llm=configuration.llm,
            execution_mode=None,
            trusted_backend_context=trusted_backend_context,
        )
        super().__init__(
            context=LLMGeneratorContext(
                configuration=configuration,
                llm_key=configuration.llm,
                generator=LLMDataflowSingle(
                    prompt=LLMPromptBuilder(
                        configuration.role_label,
                        prompts_dict,
                        configuration.prompt,
                    )
                ),
                runtime=LLMGeneratorRuntimeContext(
                    response_mode="json",
                    project_id=project_id,
                    task_context=task_context,
                    decision=decision,
                    trusted_backend_context=trusted_backend_context,
                    mongo_store=mongo_store,
                ),
            ),
        )
        cfg = configuration.model_dump()
        self.card_id = cfg.get("card_id", "")
        self.project_input_model = project_input_model

    @raise_exception(
        "Failed to generate dataflow using llm.",
        exception_logger=logger,
    )
    def generate(self) -> dict:
        logger.info("[ RR-LLM ] [LLM Dataflow Generator] Setting system...")
        system_desc = SystemDescriptionExtractor(self.project_input_model)
        all_userstory_desc = system_desc.all_userstories_dict()

        userstory_i_desc = "The user story card id is " + self.card_id + ". "
        userstory_i_desc += all_userstory_desc[self.card_id]

        gen_option = cast(LLMDataflowSingle, self.llm_generator)
        gen_option.set_system(
            user_story=userstory_i_desc,
            architecture_diagram_json=self.project_input_model["dataflow"],
        )
        logger.info("[ RR-LLM ] [LLM Dataflow Generator] Generating paths...")
        result = self.generate_paths(
            schema=LLMReturnStructDataflow.schema,
            path_struc=LLMReturnStructDataflow.dataflow_struc,
            max_tries=3,
        )
        if not isinstance(result, dict):
            result = {}

        parser = DiagramOutputParser()
        parsed_result = parser.parse_dataflow_output(
            result,
            self.project_input_model,
            card_id=self.card_id,
        )

        return parsed_result


class LLMDataflowGenerator:
    @raise_exception(
        "Failed to initialize LLMDataflowGenerator.",
        exception_logger=logger,
    )
    def __init__(
        self,
        project_id: str,
        canvas_id: str,
        user_info: dict,
        configuration: dict,
        project_ad_service: ProjectADService,
        project_cq_service: ProjectCQService,
        register_data_store,
        task_context: LlmTaskContext | None = None,
        *,
        mongo_store: "LlmMongoStoreProtocol | None" = None,
    ):
        self.project_id = project_id
        self.canvas_id = canvas_id
        self.user_info = user_info
        self.project_ad_service = project_ad_service
        self.project_cq_service = project_cq_service
        self.task_context = task_context
        self.mongo_store = mongo_store
        self.register_data_store = register_data_store
        question_to_model = self.register_data_store.question_to_model or {}

        self.project_input_model_extractor = ProjectInputModelExtractor(
            question_to_model=question_to_model,
            project_cq=self.project_cq_model.model_dump(),
            project_ad=self.project_ad_model.model_dump(),
        )
        project_input_model = (
            self.project_input_model_extractor.get_project_input_model()
        )
        configuration["card_id"] = self.get_ref_card_id()
        prompts_dict = self.register_data_store.llm_prompt_template_lines or {}
        logger.info("[ RR-CORE ] Initialising llm dataflow generator...")
        generator_configuration = GeneratorConfiguration.model_validate(configuration)
        self.llm_generator = _LLMDataflowWorker(
            configuration=generator_configuration,
            prompts_dict=prompts_dict,
            project_input_model=project_input_model.project_input_model_dict,
            project_id=self.project_id,
            task_context=self.task_context,
            mongo_store=self.mongo_store,
        )

    @cached_property
    @raise_exception("Failed to retrieve project cq model cache.")
    def project_cq_model(self) -> ProjectCQModel:
        return self.get_project_cq_model()

    @raise_exception(
        "Failed to retrieve project cq for register generation.",
        exception_logger=logger,
    )
    def get_project_cq_model(self) -> ProjectCQModel:
        project_cq: dict = self.project_cq_service.get_one(
            {"project_id": self.project_id},
            raise_if_not_found=True,
            user_info=self.user_info,
        )
        if not project_cq.get("isCompleted"):
            raise BadRequest(
                "The Conception Questionnaire must be submitted before this operation can proceed."
            )
        if not project_cq.get("values"):
            raise BadRequest("Project conception questionnaire values not found.")
        return ProjectCQModel(**project_cq)

    @cached_property
    @raise_exception(
        "Failed to retrieve project ad model.",
        exception_logger=logger,
    )
    def project_ad_model(self) -> ProjectADModel:
        return self.get_project_ad_model()

    @raise_exception(
        "Failed to retrieve project ad model for register generation.",
        exception_logger=logger,
    )
    def get_project_ad_model(self):
        project_ad = self.project_ad_service.get_one(
            {"project_id": self.project_id},
            raise_if_not_found=True,
            user_info=self.user_info,
        )
        return ProjectADModel(**project_ad)

    @raise_exception(
        "Failed to get reference card ID.",
        exception_logger=logger,
    )
    def get_ref_card_id(self) -> str:
        card_id = ""
        for canvas in self.project_ad_model.canvas or []:
            if canvas.canvas_id == self.canvas_id:
                card_id = (canvas.ref or {}).get("card_ref", {}).get("card_id", "")
                break
        return card_id

    @raise_exception(
        "Failed to get LLM generated dataflow diagram model.",
        exception_logger=logger,
    )
    def get_llm_generated_dataflow_diagram_model(self) -> ProjectADModel:
        result = self.llm_generator.generate()
        nodes_data_stored = result["nodes_data_stored"]
        updated_project_ad = self.project_ad_model

        for canvas in updated_project_ad.canvas or []:
            for c_node in canvas.nodes:
                if c_node.id in nodes_data_stored:
                    updated = set((c_node.data or {}).get("data_stored", []))
                    updated.update(nodes_data_stored[c_node.id])
                    c_node.data["data_stored"] = list(updated)  # type: ignore[index]
            if canvas.canvas_id == self.canvas_id:
                canvas.edges = result.get("edges", [])

        return updated_project_ad

    @raise_exception(
        "Failed to retrieve generated project register model.",
        exception_logger=logger,
    )
    def run(self) -> None:
        self.project_ad_model = self.get_llm_generated_dataflow_diagram_model()
