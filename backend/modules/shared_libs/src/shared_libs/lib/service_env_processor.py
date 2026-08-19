import logging

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class ServiceEnvProcessor:
    ALLOWED_HOSTS = []
    CORS_ALLOWED_ORIGINS = []

    def __init__(self, env_dict: dict):
        self.env_dict = env_dict

    @raise_exception(
        "Failed to retrieve list of hosts from string.",
        exception_logger=logger,
    )
    def get_hosts_from_string(
        self,
        env_key: str,
        default_str: str = "",
    ):
        env_str = self.env_dict.get(env_key, default_str)
        return env_str.split(",") if env_str else []
