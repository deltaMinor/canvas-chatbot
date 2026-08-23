import logging

from celery import Celery
from django.conf import settings

from shared_libs.decorators import raise_exception
from shared_libs.domain import KbToscaService
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.models.base_models import ProducerDataModel
from shared_libs.models.database_models import KbToscaModel
from shared_libs.producers.producer_data import producer_data_kb_tosca
from shared_libs.constants import SYSTEM_USER_INFO

TZINFO = settings.TZINFO
logger = logging.getLogger(__name__)


class KbToscaApplicationService(KbToscaService):
    def __init__(
        self,
        celery_app: Celery,
        *args,
        **kwargs,
    ):
        super().__init__(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_kb_tosca,
                    ),
                    celery_app=celery_app,
                ),
            )
        )

    @raise_exception(
        "Failed to retrieve Kb TOSCA models.",
        exception_logger=logger,
    )
    def get_kb_tosca_model(
        self,
    ) -> KbToscaModel:
        """Retrieves Kb TOSCA models.

        This method retrieves Kb TOSCA model from the database. It first verifies
        standalone authorization.

        Args:
            permissions (List[str]): The permissions to verify for standalone authorization.

        Returns:
            KbToscaModel: The retrieved Kb TOSCA model.
        """
        db_kb_tosca = self.get_one(
            {"schema_": self.SCHEMA},
            user_info=SYSTEM_USER_INFO,
            raise_if_not_found=True,
        )
        kb_tosca_model = KbToscaModel(**db_kb_tosca)
        return kb_tosca_model
