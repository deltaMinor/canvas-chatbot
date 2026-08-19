from django.conf import settings
from shared_libs.middleware.health_check import get_health_check_middleware

SERVICE_ENDPOINT_PREFIX = settings.SERVICE_ENDPOINT_PREFIX

health_check_middleware = get_health_check_middleware(
    PREFIX=SERVICE_ENDPOINT_PREFIX,
)
