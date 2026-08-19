import logging

from celery import shared_task

from shared_libs.decorators import raise_exception
from shared_libs.domain import DatabaseLogService
from shared_libs.infrastructure.repository.service import Repository
from shared_libs.infrastructure.repository_collection import RepositoryCollection
from shared_libs.infrastructure.worker_client.application_task import ApplicationTask
from shared_libs.lib.database_log_task_processor import DatabaseLogTaskProcessor
from shared_libs.lib.task_util.task_query_result_builder import TaskQueryResultBuilder
from shared_libs.lib.task_util.task_result_builder import TaskResultBuilder
from shared_libs.models.base_models import (
    CollectionDeleteMultipleModel,
    ProducerDataModel,
)
from shared_libs.producers.producer_data import producer_data_database_log_ad
from shared_libs.templates.message_template import success

logger = logging.getLogger(__name__)


@raise_exception(
    "Failed to complete get ad database logs task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_get_database_logs_task",
    queue="diagram_queue",
)
def create_get_database_logs_task(self, body):
    from service.tasks.client import tm_db_client

    collection_name = body["collection_name"]

    db_log_service = DatabaseLogService(
        repository=Repository(
            collection=RepositoryCollection(
                database=tm_db_client,
                name=collection_name,
            )
        )
    )

    log_task_processor = DatabaseLogTaskProcessor(
        service=db_log_service,
        targetKey=collection_name,
    )
    res = log_task_processor.get_many(body)

    return success(
        "Database logs are retrieved successfully.",
        TaskQueryResultBuilder.resolve(
            res,
            ProducerDataModel(**producer_data_database_log_ad),
        ),
    )


@raise_exception(
    "Failed to complete update ad database log task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_update_database_log_task",
    queue="diagram_queue",
)
def create_update_database_log_task(self, body):
    from service.tasks.client import tm_db_client

    collection_name = body["collection_name"]

    db_log_service = DatabaseLogService(
        repository=Repository(
            collection=RepositoryCollection(
                database=tm_db_client,
                name=collection_name,
            )
        )
    )

    log_task_processor = DatabaseLogTaskProcessor(
        service=db_log_service,
        targetKey=collection_name,
    )
    res = log_task_processor.update_one(body)

    return success(
        "Database log is updated successfully.",
        TaskResultBuilder.resolve(res),
    )


@raise_exception(
    "Failed to complete delete ad database logs task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_delete_database_logs_task",
    queue="diagram_queue",
)
def create_delete_database_logs_task(self, body):
    from service.tasks.client import tm_db_client

    collection_name = body["collection_name"]

    db_log_service = DatabaseLogService(
        repository=Repository(
            collection=RepositoryCollection(
                database=tm_db_client,
                name=collection_name,
            )
        )
    )
    res = db_log_service.delete_many(
        **CollectionDeleteMultipleModel(**body).model_dump(),
    )

    return success(
        "Database logs are deleted successfully.",
        TaskResultBuilder.resolve(res),
    )


######################################################################
