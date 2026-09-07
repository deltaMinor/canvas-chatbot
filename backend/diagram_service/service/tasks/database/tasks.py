import logging

from celery import shared_task

from shared_libs.constants.database import RESERVED_DB_KEYS
from shared_libs.decorators import raise_exception
from shared_libs.domain import (
    DatabaseLogService,
    KbToscaService,
    MasterADTemplateService,
    ProjectADFileService,
    ProjectADService,
)
from shared_libs.infrastructure.file_repository.service import FileRepository
from shared_libs.infrastructure.file_repository_collection import (
    FileRepositoryCollection,
)
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.infrastructure.repository.service import Repository
from shared_libs.infrastructure.repository_collection import RepositoryCollection
from shared_libs.infrastructure.worker_client.application_task import ApplicationTask
from shared_libs.lib.model_util.model_validation_util import ModelValidationUtil
from shared_libs.lib.task_util.task_query_result_builder import TaskQueryResultBuilder
from shared_libs.lib.task_util.task_result_builder import TaskResultBuilder
from shared_libs.models.base_models import (
    DomainFileRepositoryDeleteOneModel,
    DomainFileRepositoryInsertOneModel,
    DomainFileRepositoryQueryModel,
    DomainFileRepositoryUpdateOneModel,
    DomainRepositoryQueryModel,
    DomainRepositoryUpdateOneModel,
    ProducerDataModel,
)
from shared_libs.models.database_models import (
    KbToscaModel,
    MasterADTemplateModel,
    ProjectADModel,
)
from shared_libs.producers.producer_data import (
    producer_data_database_log_ad,
    producer_data_kb_tosca,
    producer_data_master_ad_template,
    producer_data_project_ad,
    producer_data_project_ad_file,
    producer_data_project_ad_file_module,
    producer_data_project_ad_file_terraform,
)
from shared_libs.templates.message_template import success
from shared_libs.types.auditLog import AuditLogTargetKey
from shared_libs.types.enum import Collection

logger = logging.getLogger(__name__)


def is_projected_query(domain_query_model: DomainRepositoryQueryModel) -> bool:
    return bool(domain_query_model.projection)


@raise_exception(
    "Failed to check architecture diagram service worker health.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.check_health",
    queue="diagram_queue",
)
def check_health(self, body):
    return success(
        "Success. Architecture diagram service worker is healthy.",
        None,
    )


@raise_exception(
    "Failed to complete get project ad task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_get_project_ad_task",
    queue="diagram_queue",
)
def create_get_project_ad_task(self, body):
    from main import celery_app
    from service.tasks.client import tm_db_client

    project_ad_service = ProjectADService(
        repository=Repository(
            collection=RepositoryCollection(
                database=tm_db_client,
                name=Collection.project_ad.value,
            )
        )
    )
    db_log_ad_service = DatabaseLogService(
        repository=RemoteRepository(
            producer=Producer(
                producer_data_model=ProducerDataModel(
                    **producer_data_database_log_ad,
                ),
                celery_app=celery_app,
            ),
        )
    )

    domain_query_model = DomainRepositoryQueryModel(**body)
    res = project_ad_service.get_one(
        **domain_query_model.model_dump(),
    )
    if not res:
        return success(
            "Project architecture diagram is retrieved successfully.",
            TaskQueryResultBuilder.resolve(
                res,
                ProducerDataModel(**producer_data_project_ad),
            ),
        )

    if is_projected_query(domain_query_model):
        return success(
            "Project architecture diagram is retrieved successfully.",
            TaskQueryResultBuilder.resolve(
                res,
                ProducerDataModel(**producer_data_project_ad),
            ),
        )

    # Patch model if required
    project_ad_model = ProjectADModel(**res)

    def get_filter_func(
        model: ProjectADModel,
    ):
        return {"project_id": model.project_id}

    validation_util = ModelValidationUtil(
        domain_service=project_ad_service,
        db_log_service=db_log_ad_service,
    )
    validation_util.process_model(
        model=project_ad_model,
        get_filter_func=get_filter_func,
        targetKey=AuditLogTargetKey.project_ad.value,
        log_collection_name=Collection.project_ad_log.value,
    )

    return success(
        "Project architecture diagram is retrieved successfully.",
        TaskQueryResultBuilder.resolve(
            res,
            ProducerDataModel(**producer_data_project_ad),
        ),
    )


@raise_exception(
    "Failed to complete get project ads task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_get_project_ads_task",
    queue="diagram_queue",
)
def create_get_project_ads_task(self, body):
    from service.tasks.client import tm_db_client

    project_ad_service = ProjectADService(
        repository=Repository(
            collection=RepositoryCollection(
                database=tm_db_client,
                name=Collection.project_ad.value,
            )
        )
    )

    domain_query_model = DomainRepositoryQueryModel(**body)
    res = project_ad_service.get_many(
        **domain_query_model.model_dump(),
    )
    return success(
        "Project architecture diagrams are retrieved successfully.",
        TaskQueryResultBuilder.resolve(
            res,
            ProducerDataModel(**producer_data_project_ad),
        ),
    )


@raise_exception(
    "Failed to complete update project ad task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_update_project_ad_task",
    queue="diagram_queue",
)
def create_update_project_ad_task(self, body):
    from service.tasks.client import tm_db_client

    project_ad_service = ProjectADService(
        repository=Repository(
            collection=RepositoryCollection(
                database=tm_db_client,
                name=Collection.project_ad.value,
            )
        )
    )

    domain_model = DomainRepositoryUpdateOneModel(**body)
    domain_model.payload = {
        k: v
        for k, v in domain_model.payload.items()
        if k.split(".")[0] in ProjectADModel.model_fields.keys()
        and k.split(".")[0] not in RESERVED_DB_KEYS
    }

    res = project_ad_service.update_one(
        **domain_model.model_dump(),
    )
    return success(
        "Project architecture diagram is updated successfully.",
        TaskResultBuilder.resolve(res),
    )


@raise_exception(
    "Failed to complete delete project ads task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_delete_project_ads_task",
    queue="diagram_queue",
)
def create_delete_project_ads_task(self, body):
    from service.tasks.client import tm_db_client

    project_ad_service = ProjectADService(
        repository=Repository(
            collection=RepositoryCollection(
                database=tm_db_client,
                name=Collection.project_ad.value,
            )
        )
    )

    res = project_ad_service.delete_many(**body)
    return success(
        "Project architecture diagrams are removed successfully.",
        TaskResultBuilder.resolve(res),
    )


######################################################################


@raise_exception(
    "Failed to complete get master ad template task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_get_master_ad_template_task",
    queue="diagram_queue",
)
def create_get_master_ad_template_task(self, body):
    from main import celery_app
    from service.tasks.client import tm_db_client

    master_ad_template_service = MasterADTemplateService(
        repository=Repository(
            collection=RepositoryCollection(
                database=tm_db_client,
                name=Collection.master_ad_template.value,
            )
        )
    )
    db_log_ad_service = DatabaseLogService(
        repository=RemoteRepository(
            producer=Producer(
                producer_data_model=ProducerDataModel(
                    **producer_data_database_log_ad,
                ),
                celery_app=celery_app,
            ),
        )
    )

    domain_query_model = DomainRepositoryQueryModel(**body)
    res = master_ad_template_service.get_one(
        **domain_query_model.model_dump(),
    )
    if not res:
        return success(
            "Master AD template is retrieved successfully.",
            TaskQueryResultBuilder.resolve(
                res,
                ProducerDataModel(**producer_data_master_ad_template),
            ),
        )

    if is_projected_query(domain_query_model):
        return success(
            "Master AD template is retrieved successfully.",
            TaskQueryResultBuilder.resolve(
                res,
                ProducerDataModel(**producer_data_master_ad_template),
            ),
        )

    # Patch model if required
    master_ad_template_model = MasterADTemplateModel(**res)

    def get_filter_func(
        model: MasterADTemplateModel,
    ):
        return {"templateId": model.templateId}

    validation_util = ModelValidationUtil(
        domain_service=master_ad_template_service,
        db_log_service=db_log_ad_service,
    )
    validation_util.process_model(
        model=master_ad_template_model,
        get_filter_func=get_filter_func,
        targetKey=AuditLogTargetKey.master_ad_template.value,
        log_collection_name=Collection.master_ad_template_log.value,
    )

    return success(
        "Master AD template is retrieved successfully.",
        TaskQueryResultBuilder.resolve(
            res,
            ProducerDataModel(**producer_data_master_ad_template),
        ),
    )


@raise_exception(
    "Failed to complete get master ad templates task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_get_master_ad_templates_task",
    queue="diagram_queue",
)
def create_get_master_ad_templates_task(self, body):
    from main import celery_app
    from service.tasks.client import tm_db_client

    master_ad_template_service = MasterADTemplateService(
        repository=Repository(
            collection=RepositoryCollection(
                database=tm_db_client,
                name=Collection.master_ad_template.value,
            )
        )
    )
    db_log_ad_service = DatabaseLogService(
        repository=RemoteRepository(
            producer=Producer(
                producer_data_model=ProducerDataModel(
                    **producer_data_database_log_ad,
                ),
                celery_app=celery_app,
            ),
        )
    )

    domain_query_model = DomainRepositoryQueryModel(**body)
    res = master_ad_template_service.get_many(
        **domain_query_model.model_dump(),
    )

    if is_projected_query(domain_query_model):
        return success(
            "Master AD templates are retrieved successfully.",
            TaskQueryResultBuilder.resolve(
                res,
                ProducerDataModel(**producer_data_master_ad_template),
            ),
        )

    # Patch model if required
    master_ad_template_models = [MasterADTemplateModel(**_) for _ in res]

    def get_filter_func(
        model: MasterADTemplateModel,
    ):
        return {"templateId": model.templateId}

    validation_util = ModelValidationUtil(
        domain_service=master_ad_template_service,
        db_log_service=db_log_ad_service,
    )
    validation_util.process_models(
        models=master_ad_template_models,
        get_filter_func=get_filter_func,
        targetKey=AuditLogTargetKey.master_ad_template.value,
        log_collection_name=Collection.master_ad_template_log.value,
    )

    return success(
        "Master AD templates are retrieved successfully.",
        TaskQueryResultBuilder.resolve(
            res,
            ProducerDataModel(**producer_data_master_ad_template),
        ),
    )


######################################################################


@raise_exception(
    "Failed to complete get Kb TOSCA task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_get_kb_tosca_task",
    queue="diagram_queue",
)
def create_get_kb_tosca_task(self, body):
    from main import celery_app
    from service.tasks.client import tm_db_client

    kb_tosca_service = KbToscaService(
        repository=Repository(
            collection=RepositoryCollection(
                database=tm_db_client,
                name=Collection.kb_tosca.value,
            )
        )
    )
    db_log_ad_service = DatabaseLogService(
        repository=RemoteRepository(
            producer=Producer(
                producer_data_model=ProducerDataModel(
                    **producer_data_database_log_ad,
                ),
                celery_app=celery_app,
            ),
        )
    )

    domain_query_model = DomainRepositoryQueryModel(**body)
    res = kb_tosca_service.get_one(
        **domain_query_model.model_dump(),
    )
    if not res:
        return success(
            "Kb TOSCA is retrieved successfully.",
            TaskQueryResultBuilder.resolve(
                res,
                ProducerDataModel(**producer_data_kb_tosca),
            ),
        )

    if is_projected_query(domain_query_model):
        return success(
            "Kb TOSCA is retrieved successfully.",
            TaskQueryResultBuilder.resolve(
                res,
                ProducerDataModel(**producer_data_kb_tosca),
            ),
        )

    # Patch model if required
    kb_tosca_model = KbToscaModel(**res)

    def get_filter_func(
        model: KbToscaModel,
    ):
        return {"schema_": model.schema_}

    validation_util = ModelValidationUtil(
        domain_service=kb_tosca_service,
        db_log_service=db_log_ad_service,
    )
    validation_util.process_model(
        model=kb_tosca_model,
        get_filter_func=get_filter_func,
        targetKey=AuditLogTargetKey.kb_tosca.value,
        log_collection_name=Collection.kb_tosca_log.value,
    )

    return success(
        "Kb TOSCA is retrieved successfully.",
        TaskQueryResultBuilder.resolve(
            res,
            ProducerDataModel(**producer_data_kb_tosca),
        ),
    )


######################################################################


@raise_exception(
    "Failed to complete get project diagram file task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_get_project_diagram_file_task",
    queue="diagram_queue",
)
def create_get_project_diagram_file_task(self, body):
    from service.tasks.client import tm_db_client

    project_diagram_file_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_query_model = DomainFileRepositoryQueryModel(**body)
    res = project_diagram_file_service.get_many_files(
        **domain_query_model.model_dump(),
    )

    return success(
        "Project diagram file is retrieved successfully.",
        TaskQueryResultBuilder.resolve(
            res,
            ProducerDataModel(**producer_data_project_ad_file),
            DataModelCls=None,
            type="file",
        ),
    )


@raise_exception(
    "Failed to complete update project diagram file task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_update_project_diagram_file_task",
    queue="diagram_queue",
)
def create_update_project_diagram_file_task(self, body):
    from service.tasks.client import tm_db_client

    project_diagram_file_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_model = DomainFileRepositoryInsertOneModel(**body)
    res = project_diagram_file_service.insert_one_file(
        **domain_model.model_dump(),
    )
    return success(
        "Project diagram file is updated successfully.",
        res,
    )


@raise_exception(
    "Failed to complete delete project diagram file task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_delete_project_diagram_file_task",
    queue="diagram_queue",
)
def create_delete_project_diagram_file_task(self, body):
    from service.tasks.client import tm_db_client

    project_diagram_file_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_delete_model = DomainFileRepositoryDeleteOneModel(**body)
    res = project_diagram_file_service.delete_many_files(
        **domain_delete_model.model_dump(),
    )
    return success(
        "Project diagram file is removed successfully.",
        res,
    )


######################################################################


@raise_exception(
    "Failed to complete get terraform files task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_get_terraform_files_task",
    queue="diagram_queue",
)
def create_get_terraform_files_task(self, body):
    from service.tasks.client import tm_db_client

    file_terraform_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_query_model = DomainFileRepositoryQueryModel(**body)
    res = file_terraform_service.get_many_files(**domain_query_model.model_dump())
    return success(
        "Project terraform files are retrieved successfully.",
        TaskQueryResultBuilder.resolve(
            res,
            ProducerDataModel(**producer_data_project_ad_file_terraform),
            DataModelCls=None,
            type="file",
        ),
    )


@raise_exception(
    "Failed to complete insert terraform file task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_insert_terraform_file_task",
    queue="diagram_queue",
)
def create_insert_terraform_file_task(self, body):
    from service.tasks.client import tm_db_client

    file_terraform_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_insert_model = DomainFileRepositoryInsertOneModel(**body)
    res = file_terraform_service.insert_one_file(**domain_insert_model.model_dump())
    return success(
        "Project terraform files are inserted successfully.",
        res,
    )


@raise_exception(
    "Failed to complete delete terraform file(s) task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_delete_terraform_files_task",
    queue="diagram_queue",
)
def create_delete_terraform_files_task(self, body):
    from service.tasks.client import tm_db_client

    file_terraform_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_delete_model = DomainFileRepositoryDeleteOneModel(**body)
    res = file_terraform_service.delete_many_files(**domain_delete_model.model_dump())
    return success(
        "Project terraform files are removed successfully.",
        res,
    )


######################################################################


@raise_exception(
    "Failed to complete get module file(s) task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_get_module_files_task",
    queue="diagram_queue",
)
def create_get_module_files_task(self, body):
    from service.tasks.client import tm_db_client

    file_module_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_query_model = DomainFileRepositoryQueryModel(**body)
    res = file_module_service.get_many_files(
        **domain_query_model.model_dump(),
    )
    return success(
        "Project module files are retrieved successfully.",
        TaskQueryResultBuilder.resolve(
            res,
            ProducerDataModel(**producer_data_project_ad_file_module),
            DataModelCls=None,
            type="file",
        ),
    )


@raise_exception(
    "Failed to complete insert module file task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_insert_module_file_task",
    queue="diagram_queue",
)
def create_insert_module_file_task(self, body):
    from service.tasks.client import tm_db_client

    file_module_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_insert_model = DomainFileRepositoryInsertOneModel(**body)
    res = file_module_service.insert_one_file(
        **domain_insert_model.model_dump(),
    )
    return success(
        "Project module files are inserted successfully.",
        res,
    )


@raise_exception(
    "Failed to complete delete module file(s) task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_delete_module_files_task",
    queue="diagram_queue",
)
def create_delete_module_files_task(self, body):
    from service.tasks.client import tm_db_client

    file_module_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_delete_model = DomainFileRepositoryDeleteOneModel(**body)
    res = file_module_service.delete_many_files(
        **domain_delete_model.model_dump(),
    )
    return success(
        "Project module files are removed successfully.",
        res,
    )


######################################################################


@raise_exception(
    "Failed to complete get project architecture diagram file(s) task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_get_project_ad_files_task",
    queue="diagram_queue",
)
def create_get_project_ad_files_task(self, body):
    from service.tasks.client import tm_db_client

    project_ad_file_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_query_model = DomainFileRepositoryQueryModel(**body)
    res = project_ad_file_service.get_many_files(**domain_query_model.model_dump())
    return success(
        "Project architecture diagram files are retrieved successfully.",
        TaskQueryResultBuilder.resolve(
            res,
            ProducerDataModel(**producer_data_project_ad_file),
            DataModelCls=None,
            type="file",
        ),
    )


@raise_exception(
    "Failed to complete insert project architecture diagram file task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_insert_project_ad_file_task",
    queue="diagram_queue",
)
def create_insert_project_ad_file_task(self, body):
    from service.tasks.client import tm_db_client

    project_ad_file_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_insert_model = DomainFileRepositoryInsertOneModel(**body)
    res = project_ad_file_service.insert_one_file(**domain_insert_model.model_dump())
    return success(
        "Project architecture diagram file is inserted successfully.",
        res,
    )


@raise_exception(
    "Failed to complete rename project architecture diagram file task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_rename_project_ad_file_task",
    queue="diagram_queue",
)
def create_rename_project_ad_file_task(self, body):
    from service.tasks.client import tm_db_client

    project_ad_file_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_rename_model = DomainFileRepositoryUpdateOneModel(**body)
    res = project_ad_file_service.rename_one_file(**domain_rename_model.model_dump())
    return success(
        "Project architecture diagram file is renamed successfully.",
        res,
    )


@raise_exception(
    "Failed to complete delete project architecture diagram file(s) task.",
    exception_logger=logger,
)
@shared_task(
    base=ApplicationTask,
    bind=True,
    name="diagram.create_delete_project_ad_files_task",
    queue="diagram_queue",
)
def create_delete_project_ad_files_task(self, body):
    from service.tasks.client import tm_db_client

    project_ad_file_service = ProjectADFileService(
        repository=FileRepository(
            collection=FileRepositoryCollection(
                database=tm_db_client,
                collection=Collection.project_ad_file.value,
            ),
        )
    )

    domain_delete_model = DomainFileRepositoryDeleteOneModel(**body)
    res = project_ad_file_service.delete_many_files(**domain_delete_model.model_dump())
    return success(
        "Project architecture diagram files are removed successfully.",
        res,
    )


######################################################################
