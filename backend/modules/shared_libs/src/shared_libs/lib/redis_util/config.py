import os
from urllib.parse import urlparse


class RedisConfig:
    """
    Redis configuration constants loaded from environment variables.

    This class provides centralized access to Redis configuration values
    making it portable and decoupled from framework-specific configuration.
    """

    # Redis URL for direct connection
    URL_BASE: str = os.environ.get("REDIS_URL_BASE", "redis://tm-redis:6379/")

    # Parse URL_BASE to extract host and port
    _parsed_url = urlparse(URL_BASE)

    # Redis connection settings derived from URL_BASE
    HOST: str = _parsed_url.hostname or "tm-redis"
    PORT: int = _parsed_url.port or int(
        os.environ.get("REDIS_PORT_SELF_MANAGED", "6379")
    )
    PASSWORD: str | None = os.environ.get("REDIS_PASSWORD")
    REQUIRE_TLS: bool = os.environ.get("REQUIRE_REDIS_TLS", "false").lower() == "true"

    # Redis authentication requirement
    REQUIRE_AUTH: bool = os.environ.get("REQUIRE_REDIS_AUTH", "false").lower() == "true"

    # Redis connection pool settings
    MAX_CONNECTIONS: int = int(os.environ.get("REDIS_MAX_CONNECTIONS", "20"))
    SOCKET_CONNECT_TIMEOUT: int = int(
        os.environ.get("REDIS_SOCKET_CONNECT_TIMEOUT", "5")
    )
    SOCKET_TIMEOUT: int = int(os.environ.get("REDIS_SOCKET_TIMEOUT", "5"))
    RETRY_ON_TIMEOUT: bool = (
        os.environ.get("REDIS_RETRY_ON_TIMEOUT", "true").lower() == "true"
    )
    HEALTH_CHECK_INTERVAL: int = int(
        os.environ.get("REDIS_HEALTH_CHECK_INTERVAL", "30")
    )

    # Redis key settings
    JWKS_REDIS_KEY: str = os.environ.get("REDIS_JWKS_KEY", "jwks")
    TOKEN_REDIS_KEY_PREFIX: str = os.environ.get("REDIS_TOKEN_KEY_PREFIX", "token:")
    SESSION_REDIS_KEY_PREFIX: str = os.environ.get(
        "REDIS_SESSION_KEY_PREFIX", "session:"
    )
    TOKEN_EXPIRY: int = int(
        os.environ.get("REDIS_TOKEN_EXPIRY", "3600")
    )  # Default 1 hour
    DOC_EXPIRY: int = int(
        os.environ.get("REDIS_DOC_EXPIRY", "2592000")
    )  # Default 30 days

    # Redis database settings
    DEFAULT_DB: int = int(os.environ.get("REDIS_DEFAULT_DB", "0"))
    AUTH_DB: int = int(os.environ.get("REDIS_AUTH_DB", "0"))
    ADMIN_DB: int = int(os.environ.get("REDIS_ADMIN_DB", "0"))
    APPLICATION_DB: int = int(os.environ.get("REDIS_APPLICATION_DB", "0"))
    ARCHITECTURE_DIAGRAM_DB: int = int(
        os.environ.get("REDIS_ARCHITECTURE_DIAGRAM_DB", "0")
    )
    KNOWLEDGE_BASE_DB: int = int(os.environ.get("REDIS_KNOWLEDGE_BASE_DB", "0"))
    RISK_REGISTER_DB: int = int(os.environ.get("REDIS_RISK_REGISTER_DB", "0"))

    @classmethod
    def get_connection_config(cls, db: int | None = None) -> dict:
        """
        Get Redis connection configuration dictionary.

        Args:
            db (int, optional): Database number to use

        Returns:
            dict: Redis connection configuration
        """
        config = {
            "host": cls.HOST,
            "port": cls.PORT,
            "password": cls.PASSWORD,
            "ssl": cls.REQUIRE_TLS,
            "decode_responses": True,
            "socket_connect_timeout": cls.SOCKET_CONNECT_TIMEOUT,
            "socket_timeout": cls.SOCKET_TIMEOUT,
            "retry_on_timeout": cls.RETRY_ON_TIMEOUT,
            "health_check_interval": cls.HEALTH_CHECK_INTERVAL,
            "max_connections": cls.MAX_CONNECTIONS,
        }

        if db is not None:
            config["db"] = db

        return config

    @classmethod
    def get_service_db(cls, service_name: str) -> int:
        """
        Get the Redis database number for a specific service.

        Args:
            service_name (str): Name of the service

        Returns:
            int: Database number for the service
        """
        service_db_map = {
            "default": cls.DEFAULT_DB,
            "authentication": cls.AUTH_DB,
            "admin": cls.ADMIN_DB,
            "application": cls.APPLICATION_DB,
            "architecture_diagram": cls.ARCHITECTURE_DIAGRAM_DB,
            "knowledge_base": cls.KNOWLEDGE_BASE_DB,
            "risk_register": cls.RISK_REGISTER_DB,
        }

        return service_db_map.get(service_name, cls.DEFAULT_DB)

    @classmethod
    def get_full_redis_url(cls, db: int | None = None) -> str:
        """
        Get complete Redis URL with authentication credentials.

        Args:
            db (int, optional): Database number to use

        Returns:
            str: Complete Redis URL with username/password if configured
        """
        # Parse the base URL to extract components
        parsed = urlparse(cls.URL_BASE)

        # Build URL components
        scheme = parsed.scheme or "redis"
        hostname = parsed.hostname or cls.HOST
        port = parsed.port or cls.PORT

        # Handle authentication
        netloc = hostname
        if port:
            netloc = f"{hostname}:{port}"

        # Add authentication if credentials are provided
        if cls.PASSWORD:
            netloc = f":{cls.PASSWORD}@{netloc}"

        # Build the complete URL
        url = f"{scheme}://{netloc}"

        # Add database if specified
        if db is not None:
            url = f"{url}/{db}"

        return url

    @classmethod
    def get_redis_url(cls, db: int | None = None) -> str:
        """
        Get Redis URL for direct connection.

        Args:
            db (int, optional): Database number to use

        Returns:
            str: Redis connection URL
        """
        if db is not None:
            return f"{cls.URL_BASE.rstrip('/')}/{db}"
        return cls.URL_BASE.rstrip("/")

    @classmethod
    def is_auth_required(cls) -> bool:
        """
        Check if Redis authentication is required.

        Returns:
            bool: True if authentication is required
        """
        return cls.REQUIRE_AUTH
