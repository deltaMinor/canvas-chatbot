import os
import ssl

from celery import Celery
from celery.signals import after_setup_logger, worker_ready
from django.conf import settings

from shared_libs.lib.amqp_compat import patch_amqp_logger_alias
from shared_libs.lib.celery_task_discovery import get_task_modules_for_worker

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "main.settings",
)
patch_amqp_logger_alias()

# Celery Init - with centralized Redis configuration
mq_url = settings.MQ_URL
redis_url = settings.REDIS_URL
require_redis_tls = settings.REQUIRE_REDIS_TLS

os.environ["CELERY_BROKER_URL"] = mq_url
os.environ["CELERY_RESULT_BACKEND"] = redis_url
app = Celery("diagram_service")

# Celery Config
app.config_from_object("django.conf:settings", namespace="CELERY")
app.conf.timezone = "UTC"  # type: ignore[attr-defined]
app.conf.enable_utc = True  # type: ignore[attr-defined]
if require_redis_tls:
    app.conf.redis_backend_use_ssl = {
        "ssl_cert_reqs": ssl.CERT_REQUIRED,
        # 'ssl_ca_certs': '/path/to/ca.crt',
        # 'ssl_certfile': '/path/to/tls.crt',
        # 'ssl_keyfile': '/path/to/tls.key'
    }


@after_setup_logger.connect
def setup_celery_logging(logger, *args, **kwargs):
    from shared_libs.logger.setup import setup_app_logger

    setup_app_logger(os.environ.get("APP_LOGGER_LEVEL", logger.level))


@worker_ready.connect
def on_worker_ready(sender=None, **kwargs):
    from shared_libs.infrastructure.database_client.worker_warmup import (
        warm_worker_mongo_connection,
    )
    from shared_libs.lib.health_status import (
        build_worker_service_name,
        start_periodic_health_publisher,
    )

    service_health_name = build_worker_service_name(sender)
    start_periodic_health_publisher(service_health_name)
    warm_worker_mongo_connection("service.tasks.client", sender=sender)


TASK_MODULES_BY_QUEUE = {
    "diagram_queue": [
        "service.tasks.database",
        "service.tasks.database_log",
    ],
    # This demo removes the standalone LLM-based "register data -> diagram"
    # generation pipeline (a different, older feature from the chatbot) and
    # the knowledge-base stores it alone depended on, so those task modules
    # are intentionally no longer auto-discovered/imported here.
}
app.autodiscover_tasks(get_task_modules_for_worker(TASK_MODULES_BY_QUEUE))
