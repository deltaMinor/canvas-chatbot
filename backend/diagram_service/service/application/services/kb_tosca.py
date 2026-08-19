import logging

from celery import Celery
from django.conf import settings

from shared_libs.decorators import raise_exception, verify_params
from shared_libs.domain import KbToscaService
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.models.base_models import ProducerDataModel
from shared_libs.models.database_models import KbToscaModel
from shared_libs.producers.authentication_producer import AuthenticationProducer
from shared_libs.producers.producer_data import producer_data_kb_tosca

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
    @verify_params(key_list=["auth_producer", "permissions"])
    def get_kb_tosca_model(
        self,
        auth_producer: AuthenticationProducer,
        permissions: list[str],
    ) -> KbToscaModel:
        """Retrieves Kb TOSCA models.

        This method retrieves Kb TOSCA model from the database. It first verifies
        standalone authorization using the provided AuthenticationProducer and permissions.

        Args:
            auth_producer (AuthenticationProducer): The AuthenticationProducer to use for verifying
            standalone authorization.
            permissions (List[str]): The permissions to verify for standalone authorization.

        Returns:
            KbToscaModel: The retrieved Kb TOSCA model.
        """
        self.verify_permissions(
            auth_producer=auth_producer,
            permissions=permissions,
        )

        db_kb_tosca = self.get_one(
            {"schema_": self.SCHEMA},
            user_info=auth_producer.user_info,
            raise_if_not_found=True,
        )
        kb_tosca_model = KbToscaModel(**db_kb_tosca)
        return kb_tosca_model
