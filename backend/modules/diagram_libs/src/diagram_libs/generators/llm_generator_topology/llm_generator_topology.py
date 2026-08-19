import logging
from functools import cached_property
from typing import TYPE_CHECKING, cast

from engine_libs.lib.bases.llm_generator_base import LLMGeneratorBase
from engine_libs.lib.llm_prompt_builder import LLMPromptBuilder
from engine_libs.llm_runtime.context import LlmTaskContext
from engine_libs.llm_runtime.resolver import LlmExecutionResolver
from engine_libs.struc import LLMReturnStructDiagram

from shared_libs.decorators import raise_exception
from shared_libs.domain import ProjectADService
from shared_libs.lib.diagram_util.diagram_nodes_reposition import DiagramNodesReposition
from shared_libs.models.database_models import ProjectADModel
from shared_libs.models.llm_generator_context import (
    GeneratorConfiguration,
    LLMGeneratorRuntimeContext,
)
from shared_libs.types.enum import CanvasType
from shared_libs.utils.diagram_output_parser import DiagramOutputParser

from .llm_single_topology import LLMTopologySingle

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from shared_libs.protocols import LlmMongoStoreProtocol


class _LLMTopologyWorker(LLMGeneratorBase):
    def __init__(
        self,
        configuration: GeneratorConfiguration,
        tosca_mapping: dict,
        prompts_dict: dict,
        project_id: str = "",
        task_context: LlmTaskContext | None = None,
        trusted_backend_context: bool = False,
        *,
        mongo_store: "LlmMongoStoreProtocol | None" = None,
    ):
        from shared_libs.models.llm_generator_context import LLMGeneratorContext

        logger.info("[ RR-LLM ] Initialising LLM topology worker...")
        decision = LlmExecutionResolver.resolve_execution(
            requested_llm=configuration.llm,
            execution_mode=None,
            trusted_backend_context=trusted_backend_context,
        )
        super().__init__(
            context=LLMGeneratorContext(
                configuration=configuration,
                llm_key=configuration.llm,
                generator=LLMTopologySingle(
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

        self.diagram_image: str | None = cfg.get("diagram_image")
        self.diagram_layout_hints = cfg.get("diagram_layout_hints", {})
        self.description: str | None = cfg.get("description")
        self.icon_list = cfg.get("icon_list", "")
        self.cluster_icon_list = cfg.get("cluster_icon_list", "")
        self.tosca_mapping = tosca_mapping

    @raise_exception(
        "Failed to generate llm topology.",
        exception_logger=logger,
    )
    def generate(self) -> dict:
        logger.info("[ RR-LLM ] [LLM Topology Generator] Setting system...")
        gen_option = cast(LLMTopologySingle, self.llm_generator)
        gen_option.set_system(
            diagram_image=self.diagram_image,
            description=self.description,
            icon_list=self.icon_list,
            cluster_icon_list=self.cluster_icon_list,
        )

        logger.info("[ RR-LLM ] [LLM Topology Generator] Generating paths...")
        result = self.generate_paths(
            schema=LLMReturnStructDiagram.schema,
            path_struc=LLMReturnStructDiagram.diagram_struc,
            max_tries=2,
        )
        if not isinstance(result, dict):
            result = {}

        # parse output
        parser = DiagramOutputParser()
        parsed_result = parser.parse_diagram_output(
            result,
            self.tosca_mapping,
            layout_hints=self.diagram_layout_hints,
        )

        repositioner = DiagramNodesReposition()
        repositioned_nodes = repositioner.reposition_nodes(
            parsed_result["nodes"],
            parsed_result["edges"],
        )

        return {
            "nodes": repositioned_nodes,
            "edges": parsed_result["edges"],
        }


class LLMTopologyGenerator:
    @raise_exception(
        "Failed to initialize LLMTopologyGenerator.",
        exception_logger=logger,
    )
    def __init__(
        self,
        project_id: str,
        user_info: dict,
        configuration: dict,
        tosca_mapping: dict,
        project_ad_service: ProjectADService,
        register_data_store,
        task_context: LlmTaskContext | None = None,
        *,
        mongo_store: "LlmMongoStoreProtocol | None" = None,
    ):
        self.project_id = project_id
        self.user_info = user_info
        self.project_ad_service = project_ad_service
        self.task_context = task_context
        self.mongo_store = mongo_store
        self.register_data_store = register_data_store

        logger.info("[ RR-CORE ] Getting project model...")
        prompts_dict = self.register_data_store.llm_prompt_template_lines or {}
        logger.info("[ RR-CORE ] Initialising llm generator...")
        generator_configuration = GeneratorConfiguration.model_validate(configuration)
        self.llm_generator = _LLMTopologyWorker(
            configuration=generator_configuration,
            tosca_mapping=tosca_mapping,
            prompts_dict=prompts_dict,
            project_id=self.project_id,
            task_context=self.task_context,
            mongo_store=self.mongo_store,
        )

    @cached_property
    @raise_exception(
        "Failed to retrieve project ad model.",
        exception_logger=logger,
    )
    def project_ad_model(self):
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
        "Failed to get LLM generated architecture diagram model.",
        exception_logger=logger,
    )
    def get_llm_generated_architecture_diagram_model(self) -> ProjectADModel:
        result = self.llm_generator.generate()
        project_ad = self.project_ad_model.model_dump()

        for canvas in project_ad["canvas"]:
            if canvas.get("canvas_type") == CanvasType.architecture.value:
                canvas["nodes"] = result.get("nodes", [])
                canvas["edges"] = result.get("edges", [])

        return ProjectADModel(**project_ad)

    @raise_exception(
        "Failed to retrieve generated project register model.",
        exception_logger=logger,
    )
    def run(self):
        self.project_ad_model = self.get_llm_generated_architecture_diagram_model()
