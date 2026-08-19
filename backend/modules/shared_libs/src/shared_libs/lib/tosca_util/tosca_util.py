import logging
from functools import cached_property

from shared_libs.config import DEFAULT_TZINFO
from shared_libs.decorators import raise_exception
from shared_libs.domain.kb_tosca.service.service import KbToscaService
from shared_libs.models.base_models.tosca import ToscaMappingModel
from shared_libs.models.database_models import KbToscaModel

TZINFO = DEFAULT_TZINFO

logger = logging.getLogger(__name__)


class ToscaUtil:
    def __init__(
        self,
        kb_tosca_service: "KbToscaService",
        user_info: dict,
    ):
        self.kb_tosca_service = kb_tosca_service
        self.user_info = user_info

    @cached_property
    @raise_exception(
        "Failed to retrieve kb tosca model cache.",
        exception_logger=logger,
    )
    def kb_tosca_model(self) -> KbToscaModel:
        return self.get_kb_tosca_model()

    @raise_exception(
        "Failed to retrieve kb tosca model.",
        exception_logger=logger,
    )
    def get_kb_tosca_model(self) -> "KbToscaModel":
        db_kb_tosca = self.kb_tosca_service.get_one(
            {"schema_": self.kb_tosca_service.SCHEMA},
            user_info=self.user_info,
            raise_if_not_found=True,
        )
        return KbToscaModel(**db_kb_tosca)

    @raise_exception("Failed to get tosca_mapping.")
    def get_tosca_mapping(self) -> dict[str, str]:

        tosca_mapping: ToscaMappingModel = self.kb_tosca_model.tosca_mapping

        enumerated_tosca_mapping = {}
        for v in tosca_mapping.mapping_to_individual.model_dump().values():
            enumerated_tosca_mapping = {**enumerated_tosca_mapping, **v}
        for v in tosca_mapping.mapping_to_class.model_dump().values():
            enumerated_tosca_mapping = {**enumerated_tosca_mapping, **v}

        return enumerated_tosca_mapping
