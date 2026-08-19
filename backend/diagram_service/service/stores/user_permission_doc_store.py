from main import celery_app

from shared_libs.domain import UserPermissionDocService
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.lib.generic_data_store import GenericDataStore
from shared_libs.models.base_models import ProducerDataModel
from shared_libs.producers.producer_data import producer_data_user_permission_doc

USER_PERMISSION_DOC_TTL_SECONDS = 60

user_permission_doc_store = GenericDataStore(
    default_ttl_seconds=USER_PERMISSION_DOC_TTL_SECONDS,
    domain_service=UserPermissionDocService(
        repository=RemoteRepository(
            producer=Producer(
                producer_data_model=ProducerDataModel(
                    **producer_data_user_permission_doc,
                ),
                celery_app=celery_app,
            ),
        )
    ),
)
