import logging
import uuid
from typing import TYPE_CHECKING

from shared_libs.decorators import raise_exception
from shared_libs.models.base_models import CanvasBaseModel, ProjectRiskScenario
from shared_libs.types.enum import (
    AttackFlowEngineVersion,
    CanvasType,
    KnowledgebaseSource,
)

from .bundle_processor import BundleProcessor
from .canvas_generator import CanvasGenerator

if TYPE_CHECKING:
    from shared_libs.models.database_models import ProjectADModel

logger = logging.getLogger(__name__)

THREAT_SCENARIO_REF_REMOVE_KEYS = [
    "recommendedMitigationMeasures",
    "recommendedMitigationMeasuresHidden",
    "recommendedMitigationMeasuresParsed",
    "mappingToATK",
    "mappingToIM8",
    "solutionDetails",
    "ruleExplanation",
    "actualMitigationMeasures",
    "prompts",
    "responseAndRecoverPlantreatmentComments",
    "reviewComments",
    "reviewedBy",
    "reviewdOn",
    "submittedForReviewBy",
    "submittedForReviewOn",
    "ref",
]

class CanvasUpdater:
    @raise_exception(
        "Failed to initialize ThreatScenarioViewUpdater.",
        exception_logger=logger,
    )
    def __init__(
        self,
        project_ad_model: "ProjectADModel",
    ):
        self.project_ad_model = project_ad_model
        self.canvas_generator = CanvasGenerator(project_ad_model)
        self.bundle_processor = BundleProcessor()

    @raise_exception(
        "Failed to process scenarios in ad updater.", exception_logger=logger
    )
    def process_scenario_models(
        self, scenario_models: list["ProjectRiskScenario"]
    ) -> None:
        scenario_models = self.get_filtered_scenario_models(scenario_models)
        to_bundle = []
        others = []
        for s in scenario_models:
            if s.category == AttackFlowEngineVersion.v1.value:
                to_bundle.append(s)
            else:
                others.append(s)

        bundled = self.bundle_processor.bundle_threat_scenarios(to_bundle)

        return bundled + others

    @raise_exception("Failed to init canvases.", exception_logger=logger)
    def get_base_canvases(self) -> None:
        filter_types = [CanvasType.architecture.value]

        return [
            _ for _ in self.project_ad_model.canvas if _.canvas_type in filter_types
        ]

    @raise_exception(
        "Failed to init threat scenarios.",
        exception_logger=logger,
    )
    def get_filtered_scenario_models(
        self, scenario_models: list["ProjectRiskScenario"]
    ) -> None:
        model_sources = [
            KnowledgebaseSource.threatScenario.value,
            KnowledgebaseSource.llm.value,
        ]
        return [
            _
            for _ in scenario_models
            if _.knowledgebaseSource in model_sources and len(_.attackPaths) > 0
        ]

    @raise_exception(
        "Failed to add attack flow canvas views.",
        exception_logger=logger,
    )
    def convert_scenario_models_to_canvases(
        self, scenario_models: list["ProjectRiskScenario"]
    ) -> None:
        # With only the architecture canvas type remaining, there is no longer
        # a dedicated threat-scenario or LLM canvas to render risk scenarios
        # onto, so no canvases are generated here.
        return []

    # =======================================================================
    # Run
    # =======================================================================
    @raise_exception("Failed to add scenarios to canvas.", exception_logger=logger)
    def update_canvas(
        self,
        scenario_models: list["ProjectRiskScenario"],
        add_to_existing: bool = False,
    ) -> list["CanvasBaseModel"]:
        scenario_models = self.process_scenario_models(
            scenario_models
        )  # threat scenario, llm

        canvases_to_add = self.convert_scenario_models_to_canvases(scenario_models)
        canvases_to_add = self.canvas_generator.process_scenario_canvases(
            canvases_to_add
        )

        if add_to_existing:
            canvases = self.project_ad_model.canvas + canvases_to_add
        else:
            base_canvases = self.get_base_canvases()  # ad, dataflow
            canvases = base_canvases + canvases_to_add
        return canvases
