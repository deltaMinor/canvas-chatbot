from enum import Enum

app_logger = "app_logger"
app_admin_logger = "app_admin_logger"


class AppLoggerName(Enum):
    # ==============================
    # middleware
    # ==============================
    middleware_flush_session = f"{app_logger}.middleware.flush_session"
    middleware_session = f"{app_logger}.middleware.session"
    middleware_timer = f"{app_logger}.middleware.timer"

    # ==============================
    # decorators
    # ==============================
    perf_timer = f"{app_logger}.decorators.perf_timer"
    raise_exception = f"{app_logger}.decorators.raise_exception"

    # ==============================
    # exceptions
    # ==============================
    api_exceptions = f"{app_logger}.exceptions.api_exceptions"
    exceptions = f"{app_logger}.exceptions.exceptions"

    # ==============================
    # authorization
    # ==============================
    admin_authorization_manager = (
        f"{app_logger}.authorization.admin_authorization_manager"
    )
    authorization_manager = f"{app_logger}.authorization.authorization_manager"
    entitlement_constructor = f"{app_logger}.authorization.entitlement_constructor"
    permission_doc_constructor = (
        f"{app_logger}.authorization.permission_doc_constructor"
    )
    permission_manager = f"{app_logger}.authorization.permission_manager"

    # ==============================
    # domain
    # ==============================
    domain_shared_repository = f"{app_logger}.domain.shared.repository"
    domain_shared_redis_repository = f"{app_logger}.domain.shared.redis_repository"
    domain_shared_file_repository = f"{app_logger}.domain.shared.file_repository"
    domain_token_redis_service = f"{app_logger}.domain.token.service.redis_service"
    # ==============================
    domain_kb_attack_graph_rule = f"{app_logger}.domain.kb_attack_graph_rule"
    domain_database_log = f"{app_logger}.domain.database_log"
    domain_kb_attack_flow = f"{app_logger}.domain.kb_attack_flow"
    domain_kb_generation_rule = f"{app_logger}.domain.kb_generation_rule"
    domain_kb_generation_rules_library = (
        f"{app_logger}.domain.kb_generation_rules_library"
    )
    domain_kb_llm_prompt = f"{app_logger}.domain.kb_llm_prompt"
    domain_kb_owasp_register = f"{app_logger}.domain.kb_owasp_register"
    domain_kb_priority_rules = f"{app_logger}.domain.kb_priority_rules"
    domain_kb_question_to_model = f"{app_logger}.domain.kb_question_to_model"
    domain_kb_assessment_config = f"{app_logger}.domain.kb_assessment_config"
    domain_kb_register_mapping = f"{app_logger}.domain.kb_register_mapping"
    domain_kb_tosca = f"{app_logger}.domain.kb_tosca"
    domain_master_ad_template = f"{app_logger}.domain.master_ad_template"
    domain_master_cq = f"{app_logger}.domain.master_cq"
    domain_master_cq_template = f"{app_logger}.domain.master_cq_template"
    domain_master_mitigation = f"{app_logger}.domain.master_mitigation"
    domain_master_register = f"{app_logger}.domain.master_register"
    domain_project = f"{app_logger}.domain.project"
    domain_project_ad = f"{app_logger}.domain.project_ad"
    domain_project_cq = f"{app_logger}.domain.project_cq"
    domain_project_cq_template = f"{app_logger}.domain.project_cq_template"
    domain_project_diagram_file = f"{app_logger}.domain.project_diagram_file"
    domain_project_register = f"{app_logger}.domain.project_register"
    domain_project_register_history = f"{app_logger}.domain.project_register_history"
    domain_resource_tag = f"{app_logger}.domain.resource_tag"
    domain_token = f"{app_logger}.domain.token"
    domain_user = f"{app_logger}.domain.user"
    domain_user_permission_doc = f"{app_logger}.domain.user_permission_doc"
    domain_user_policy_doc = f"{app_logger}.domain.user_policy_doc"
    domain_user_role_doc = f"{app_logger}.domain.user_role_doc"

    # ==============================
    # producers
    # ==============================
    authentication_producer = f"{app_logger}.producers.authentication_producer"
    llm_producer = f"{app_logger}.producers.llm_producer"
    engine_main_producer = f"{app_logger}.producers.engine_main_producer"
    engine_pipeline_producer = f"{app_logger}.producers.engine_pipeline_producer"
    engine_ext_producer = f"{app_logger}.producers.engine_ext_producer"
    # ==============================
    # infrastructure
    # ==============================
    #
    file_repository = f"{app_logger}.infrastructure.file_repository"
    remote_file_repository = f"{app_logger}.infrastructure.remote_file_repository"
    remote_file_repository_direct = (
        f"{app_logger}.infrastructure.remote_file_repository_direct"
    )
    #
    repository = f"{app_logger}.infrastructure.repository"
    remote_repository = f"{app_logger}.infrastructure.remote_repository"
    remote_repository_direct = f"{app_logger}.infrastructure.remote_repository_direct"
    #
    redis_repository = f"{app_logger}.infrastructure.redis_repository"
    #
    producer = f"{app_logger}.infrastructure.producer"
    worker_client = f"{app_logger}.infrastructure.worker_client"
    database_client = f"{app_logger}.infrastructure.database_client"
    #
    file_repository_collection = (
        f"{app_logger}.infrastructure.file_repository_collection"
    )
    repository_collection = f"{app_logger}.infrastructure.repository_collection"
    repository_thread_manager = f"{app_logger}.infrastructure.repository_thread_manager"
    repository_watcher = f"{app_logger}.infrastructure.repository_watcher"

    # ==============================
    # lib
    # ==============================
    admin_user_factory = f"{app_logger}.lib.admin_user_factory"
    attack_util = f"{app_logger}.lib.attack_util"
    authentication_service = f"{app_logger}.lib.authentication_service"
    database_log_task_processor = f"{app_logger}.lib.database_log_task_processor"
    diagram_cacti_optimizer = f"{app_logger}.lib.diagram_cacti_optimizer"
    diagram_dot_parser = f"{app_logger}.lib.diagram_dot_parser"
    diagram_node_optimizer = f"{app_logger}.lib.diagram_node_optimizer"
    diagram_node_properties = f"{app_logger}.lib.diagram_node_properties"
    email_service = f"{app_logger}.lib.email_service"
    generic_data_store = f"{app_logger}.lib.generic_data_store"
    model_validation_util = f"{app_logger}.lib.model_validation_util"
    model_validators = f"{app_logger}.lib.model_validators"
    project_cq_patcher = f"{app_logger}.lib.project_cq_patcher"
    project_creation_manager = f"{app_logger}.lib.project_creation_manager"
    resource_tag_consolidator = f"{app_logger}.lib.resource_tag_consolidator"
    resource_tag_manager = f"{app_logger}.lib.resource_tag_manager"
    resource_tag_util = f"{app_logger}.lib.resource_tag_util"
    service_env_processor = f"{app_logger}.lib.service_env_processor"
    service_initiator = f"{app_logger}.lib.service_initiator"
    string_validator = f"{app_logger}.lib.string_validator"
    task_batch_helper = f"{app_logger}.lib.task_batch_helper"
    user_activity_master_timer = f"{app_logger}.lib.user_activity_master_timer"
    # encryption_services
    data_encryption_service = f"{app_logger}.lib.data_encryption_service"
    encryption_service = f"{app_logger}.lib.encryption_service"
    password_encryption_service = f"{app_logger}.lib.password_encryption_service"
    token_encryption_service = f"{app_logger}.lib.token_encryption_service"
    # diagram_util
    canvas_node_sorter = f"{app_logger}.lib.canvas_node_sorter"
    card_node_processor = f"{app_logger}.lib.card_node_processor"
    diagram_canvas_factory = f"{app_logger}.lib.diagram_canvas_factory"
    # task_util
    task_query_result_builder = f"{app_logger}.lib.task_query_result_builder"
    task_result_builder = f"{app_logger}.lib.task_result_builder"
    # url_resolver_util
    url_resolver_util = f"{app_logger}.lib.url_resolver_util"

    # ==============================
    # application
    # ==============================
    # application_service
    application_service_application = (
        f"{app_logger}.application_service.service.application"
    )
    application_service_lib = f"{app_logger}.application_service.service.lib"
    application_service_tasks = f"{app_logger}.application_service.service.tasks"
    # diagram_service
    ad_service_application = f"{app_logger}.diagram_service.service.application"
    ad_service_lib = f"{app_logger}.diagram_service.service.lib"
    ad_service_tasks = f"{app_logger}.diagram_service.service.tasks"
    # authentication_service
    auth_service_application = (
        f"{app_logger}.authentication_service.service.application"
    )
    auth_service_lib = f"{app_logger}.authentication_service.service.lib"
    auth_service_tasks = f"{app_logger}.authentication_service.service.tasks"
    # risk_register_service
    rr_service_application = f"{app_logger}.risk_register_service.service.application"
    rr_service_lib = f"{app_logger}.risk_register_service.service.lib"
    rr_service_tasks = f"{app_logger}.risk_register_service.service.tasks"

    # ==============================
    # django_admin
    # ==============================
    application_service_django_admin_app = (
        f"{app_admin_logger}.application_service.django_admin.app"
    )
    ad_service_django_admin_app = f"{app_admin_logger}.diagram_service.django_admin.app"
    auth_service_django_admin_app = (
        f"{app_admin_logger}.authentication_service.django_admin.app"
    )
    rr_service_django_admin_app = (
        f"{app_admin_logger}.risk_register_service.django_admin.app"
    )
