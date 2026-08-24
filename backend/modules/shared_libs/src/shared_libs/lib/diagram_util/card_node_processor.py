import logging

from shared_libs.decorators import raise_exception
from shared_libs.models.database_models import KbToscaModel, ProjectADModel

from .card_node_builder import CardNodeBuilder

logger = logging.getLogger(__name__)


class CardNodeProcessor:
    """Synchronize questionnaire card data into project diagram card nodes.

    With only the architecture canvas type remaining, there is no longer a
    dedicated data-flow canvas for this processor to generate or maintain.
    The class is kept as a stable entry point for callers, but no longer
    performs any data-flow-canvas-specific mutation of the project diagram.
    """

    def __init__(
        self,
        values: dict,
        project_ad_model: "ProjectADModel",
        kb_tosca_model: "KbToscaModel",
    ):
        """Create a processor for one project diagram update.

        Args:
            values: Submitted questionnaire values containing user story cards.
            project_ad_model: Project architecture diagram model to mutate.
            kb_tosca_model: TOSCA knowledge-base model used for schema and
                mapping metadata on generated data-flow nodes.
        """
        self.project_ad_model = project_ad_model
        self.card_node_builder = CardNodeBuilder(
            values=values,
            project_ad_model=project_ad_model,
        )
        self.tosca_schema = kb_tosca_model.schema_
        self.tosca_mapping = {}
        for (
            _,
            v,
        ) in kb_tosca_model.tosca_mapping.mapping_to_individual.model_dump().items():
            self.tosca_mapping = {**self.tosca_mapping, **v}

    @raise_exception(
        "Failed to update project ad model.",
        exception_logger=logger,
    )
    def update_project_ad_model(self):
        """No-op: retained for backward compatibility with existing callers.

        This previously reconciled user-story-card-driven data-flow canvases.
        Data-flow canvases no longer exist, so there is nothing to reconcile.
        """
        return

    @raise_exception(
        "Failed to populate hidden data flow nodes onto canvas.",
        exception_logger=logger,
    )
    def populate_data_flow_node(self):
        """No-op: retained for backward compatibility with existing callers.

        This previously populated hidden user/device/interface nodes on
        data-flow canvases. Data-flow canvases no longer exist, so there is
        nothing to populate.
        """
        return
