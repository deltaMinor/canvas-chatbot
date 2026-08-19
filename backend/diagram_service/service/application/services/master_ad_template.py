import logging

from celery import Celery
from django.conf import settings

from shared_libs.decorators import raise_exception, verify_params
from shared_libs.domain import MasterADTemplateService
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.models.base_models import ProducerDataModel
from shared_libs.models.database_models import MasterADTemplateModel
from shared_libs.producers.authentication_producer import AuthenticationProducer
from shared_libs.producers.producer_data import producer_data_master_ad_template

TZINFO = settings.TZINFO
logger = logging.getLogger(__name__)


class MasterADTemplateApplicationService(MasterADTemplateService):
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
                        **producer_data_master_ad_template,
                    ),
                    celery_app=celery_app,
                ),
            )
        )

    @raise_exception(
        "Failed to retrieve master diagram template models.",
        exception_logger=logger,
    )
    @verify_params(key_list=["auth_producer", "permissions"])
    def get_master_diagram_template_models(
        self,
        auth_producer: AuthenticationProducer,
        permissions: list[str],
    ) -> list[MasterADTemplateModel]:
        """Retrieves master diagram template models.

        This method retrieves master diagram template models from the database. It first verifies
        standalone authorization using the provided AuthenticationProducer and permissions.

        Args:
            auth_producer (AuthenticationProducer): The AuthenticationProducer to use for verifying
            standalone authorization.
            permissions (List[str]): The permissions to verify for standalone authorization.

        Returns:
            List[MasterADTemplateModel]: The retrieved master diagram template models.
        """
        self.verify_permissions(
            auth_producer=auth_producer,
            permissions=permissions,
        )

        db_master_diagram_template = self.get_many()
        return [MasterADTemplateModel(**_) for _ in db_master_diagram_template]
