"""
Project Input Model Extractor

Converts project questionnaires and architecture diagrams into structured project input models
using ontology-based processing for risk assessment and analysis.
"""

import logging
from typing import Any

from engine_libs.lib.bases import ModelExtractorBase
from engine_libs.lib.tosca_ontology_loader import ToscaOntologyLoader

from shared_libs.decorators import raise_exception
from shared_libs.protocols import (
    DiagramExtractorProtocol,
    ModelExtractionProtocol,
    OntologyModelProtocol,
    ProjectInputModelProtocol,
    QuestionnaireExtractorProtocol,
)

from .extractors import DiagramExtractor, QuestionnaireExtractor
from .ontology_model import OntologyModel
from .project_input_model import ProjectInputModel

logger = logging.getLogger(__name__)


class ProjectInputModelExtractor:
    """
    Extracts project input models from questionnaires and architecture diagrams.

    Orchestrates the extraction process by initializing ontology models, processing
    questionnaire responses, and processing architecture diagrams into a comprehensive model.
    """

    # ============================================================================
    # INITIALIZATION
    # ============================================================================

    def __init__(
        self,
        question_to_model: dict[str, Any],
        project_cq: dict[str, Any],
        project_ad: dict[str, Any],
    ) -> None:
        """
        Initialize the extractor with questionnaire and diagram data.

        Args:
            question_to_model: Mapping between questions and model elements
            project_cq: Questionnaire responses
            project_ad: Architecture diagram data
        """
        self.ontology_model: OntologyModelProtocol | None = None
        self.project_input_model: ProjectInputModelProtocol | None = None
        self.project_cq: dict[str, Any] = project_cq
        self.project_ad: dict[str, Any] = project_ad
        self.question_to_model: dict[str, Any] = question_to_model

        self._initialize_extractor()
        logger.debug(
            "[ RR-PROJECT-MODEL ] Project input model extractor initialized successfully."
        )

    # ============================================================================
    # PUBLIC API METHODS
    # ============================================================================

    @raise_exception(
        "Failed to initialize project model through model extraction.",
        exception_logger=logger,
    )
    def get_project_input_model(self) -> "ProjectInputModelProtocol":
        """
        Extract and build the complete project input model from questionnaire and diagram data.

        Returns:
            ProjectInputModelProtocol: The complete project input model
        """
        model_extraction = self._create_model_extraction()
        self._process_questionnaire_data(model_extraction)
        self._process_diagram_data(model_extraction)

        # Optional: Complete access control mappings
        # self._update_project_input_model_after_extraction()

        logger.debug("[ RR-PROJECT-MODEL ] Project input model extraction completed")
        return model_extraction.project_input_model

    # ============================================================================
    # PRIVATE HELPER METHODS
    # ============================================================================

    @raise_exception(
        "Failed to initialize extractor components.",
        exception_logger=logger,
    )
    def _initialize_extractor(self) -> None:
        """
        Initialize the extractor components.

        Sets up the ontology model and project input model.
        """

        self._init_ontology()
        self.project_input_model = ProjectInputModel(ontology_model=self.ontology_model)

    @raise_exception(
        "Failed to update project model after extraction",
        exception_logger=logger,
    )
    def _update_project_input_model_after_extraction(self):
        """
        Complete access control mappings after extraction.
        """
        self.project_input_model.complete_access_control_mapping()

    @raise_exception(
        "Failed to initialize ontology.",
        exception_logger=logger,
    )
    def _init_ontology(self) -> None:
        """
        Initialize ontology model by loading TOSCA and SODALITE ontology files.

        Delegates to ToscaOntologyLoader which is the single owner of the
        TOSCA_BUILTINS_XML / SODALITE_METAMODEL_XML path constants and the
        owlready2 search-path registration side effects.
        """
        ontology = self._load_ontology_from_files()
        self.ontology_model = OntologyModel(ontology=ontology)

    @raise_exception(
        "Failed to initialize model extraction for questionnaire.",
        exception_logger=logger,
    )
    def _init_model_extraction_questionnaire(
        self,
        model_extraction: "ModelExtractionProtocol",
        questionnaire: dict[str, Any],
        extraction_logic_questionnaire: Any,
    ) -> None:
        """
        Process questionnaire responses using extraction logic.

        Args:
            model_extraction: The model extraction object
            questionnaire: The questionnaire response data
            extraction_logic_questionnaire: Extraction logic configuration
        """
        questionnaire_extraction = self._create_questionnaire_extractor(
            model_extraction
        )
        questionnaire_extraction.init_questionnaire(
            questionnaire=questionnaire,
            extraction_logic=extraction_logic_questionnaire,
        )

    @raise_exception(
        "Failed to initialize model extraction for diagram.",
        exception_logger=logger,
    )
    def _init_model_extraction_diagram(
        self,
        model_extraction: "ModelExtractionProtocol",
        diagram: dict[str, Any],
        extraction_logic_diagram: Any,
    ) -> None:
        """
        Process architecture diagrams using extraction logic.

        Args:
            model_extraction: The model extraction object
            diagram: The architecture diagram data
            extraction_logic_diagram: Extraction logic configuration
        """
        diagram_extraction = self._create_diagram_extractor(model_extraction)
        diagram_extraction.init_diagrams(
            diagram=diagram,
            extraction_logic=extraction_logic_diagram,
        )

    @raise_exception(
        "Failed to load ontology from files.",
        exception_logger=logger,
    )
    def _load_ontology_from_files(self) -> Any:
        """
        Load TOSCA and SODALITE ontologies via ToscaOntologyLoader.

        Returns:
            Loaded ontology object
        """
        return ToscaOntologyLoader().load_for_extractor()

    @raise_exception(
        "Failed to create model extraction instance.",
        exception_logger=logger,
    )
    def _create_model_extraction(self) -> "ModelExtractionProtocol":
        """
        Create a model extraction instance.

        Returns:
            ModelExtractionProtocol instance for processing data
        """

        return ModelExtractorBase(project_input_model=self.project_input_model)

    @raise_exception(
        "Failed to process questionnaire data.",
        exception_logger=logger,
    )
    def _process_questionnaire_data(
        self,
        model_extraction: "ModelExtractionProtocol",
    ) -> None:
        """
        Process questionnaire responses using extraction logic.

        Args:
            model_extraction: The model extraction instance
        """
        self._init_model_extraction_questionnaire(
            model_extraction=model_extraction,
            questionnaire=self.project_cq,
            extraction_logic_questionnaire=self.question_to_model["questions"],
        )

    @raise_exception(
        "Failed to process diagram data.",
        exception_logger=logger,
    )
    def _process_diagram_data(
        self,
        model_extraction: "ModelExtractionProtocol",
    ) -> None:
        """
        Process architecture diagrams using extraction logic.

        Args:
            model_extraction: The model extraction instance
        """
        self._init_model_extraction_diagram(
            model_extraction=model_extraction,
            diagram=self.project_ad,
            extraction_logic_diagram=self.question_to_model["diagram"],
        )

    @raise_exception(
        "Failed to create questionnaire extractor.",
        exception_logger=logger,
    )
    def _create_questionnaire_extractor(
        self,
        model_extraction: "ModelExtractionProtocol",
    ) -> QuestionnaireExtractorProtocol:
        """
        Create a questionnaire extractor instance.

        Args:
            model_extraction: The model extraction instance

        Returns:
            QuestionnaireExtractorProtocol instance
        """

        return QuestionnaireExtractor(
            project_input_model=model_extraction.project_input_model
        )

    @raise_exception(
        "Failed to create diagram extractor.",
        exception_logger=logger,
    )
    def _create_diagram_extractor(
        self,
        model_extraction: "ModelExtractionProtocol",
    ) -> "DiagramExtractorProtocol":
        """
        Create a diagram extractor instance.

        Args:
            model_extraction: The model extraction instance

        Returns:
            DiagramExtractorProtocol instance
        """

        return DiagramExtractor(
            project_input_model=model_extraction.project_input_model
        )
