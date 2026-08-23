"""
Django settings for diagram_service project.

This module contains all Django configuration settings for the architecture diagram service,
including database connections, middleware, security settings, and external service
integrations.

Architecture:
- Microservice: Architecture Diagram Service
- Database: MongoDB with Redis caching
- Message Queue: RabbitMQ
- Authentication: JWT-based with session management
- API Documentation: Swagger/OpenAPI via drf-yasg

Environment Variables:
=====================

Credentials:
- SECRET_KEY: Django secret key for cryptographic signing

Service Configuration:
- DJANGO_SERVICE_AD_PORT_EXPOSED: Port number for the architecture diagram service

Database Configuration:
- DB_URL_MONGODB: MongoDB connection URL
- AD_DB_NAME: Architecture diagram-specific database name
- DB_USERNAME: Database username
- DB_PASSWORD: Database password
- REQUIRE_DB_AUTH: Enable/disable database authentication

Redis Configuration:
- REDIS_URL_BASE: Base Redis connection URL
- REDIS_PASSWORD: Redis password
- REQUIRE_REDIS_AUTH: Enable/disable Redis authentication
- REQUIRE_REDIS_TLS: Enable/disable TLS for Redis connections

Message Queue Configuration:
- MQ_URL_BASE_PRIMARY: Primary RabbitMQ connection URL
- MQ_URL_BASE_SECONDARY: Optional fallback RabbitMQ connection URL
- REQUIRE_MQ_TLS: Enable/disable TLS for RabbitMQ connections
- MQ_USERNAME: RabbitMQ username
- MQ_PASSWORD: RabbitMQ password
- REQUIRE_MQ_AUTH: Enable/disable MQ authentication

Security Configuration:
- DEBUG: Enable/disable debug mode
- ALLOWED_HOSTS: List of allowed hostnames
- CORS_ALLOW_ALL_ORIGINS: Allow all CORS origins
- CORS_ALLOWED_ORIGIN_HOSTS: Specific CORS allowed origins

Application Configuration:
- REACT_URL: Frontend React application URL
- REACT_PORT: Frontend React application port
- ENV_TYPE: Environment type (dev, staging, prod)

Performance Configuration:
- LOG_PERF_TIMER: Enable performance timing logs
- SESSION_EXPIRE_SECONDS: Session expiration time
- TASK_TIME_LIMIT: Celery task time limit
- TASK_WAIT_RESULT_TIMEOUT: Celery result wait timeout

For more information on Django settings, see:
https://docs.djangoproject.com/en/5.2/topics/settings/
"""

# Standard library imports
import logging
import os
import ssl
from pathlib import Path

# Third-party imports
from dotenv import load_dotenv

# Load environment variables from a `.env` file in this directory (i.e.
# `diagram_service/.env`) if one exists, *without* overriding any variables
# already set in the real process environment (e.g. by `docker compose`'s
# `env_file:`/`environment:`, or variables you've exported yourself). This
# demo removed the original multi-service Taskfile/task-runner scripts that
# used to source `.env` files before starting each process, so this is the
# replacement for that - copy `../.backend.local.dev.env` to `.env` here (or
# create your own) and it will be picked up automatically by both
# `python -m scripts.uvicorn.server` and `celery -A main worker ...`.
#
# IMPORTANT: this must run before any of the `shared_libs` imports below,
# several of which read environment variables as class-level attributes at
# *import time* (module load), not lazily - so loading `.env` after
# importing them would be too late and they'd silently fall back to their
# hardcoded defaults instead.
load_dotenv(Path(__file__).resolve().parent.parent / ".env", override=False)

# Third-party imports (continued)
import pytz
from django.core.management.commands.runserver import Command as runserver

# Local imports
from shared_libs.lib.mq_endpoint_resolver import resolve_mq_endpoint_from_env
from shared_libs.lib.redis_util import RedisConfig
from shared_libs.lib.service_env_processor import ServiceEnvProcessor
from shared_libs.lib.url_resolver_util.aws_url_resolver import UrlConstructor
from shared_libs.logger.custom_logging import get_custom_logging
from shared_libs.logger.setup import setup_app_logger

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================

# Configure logging with custom formatters and handlers
APP_LOGGER_LEVEL = os.environ.get("APP_LOGGER_LEVEL", "INFO")
LOGGING = get_custom_logging(APP_LOGGER_LEVEL)
setup_app_logger(APP_LOGGER_LEVEL)

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

# Django secret key for cryptographic signing
# WARNING: This is a development key. Use environment variable in production.
SECRET_KEY = "django-insecure-xn)+e@#npe0ytses$eq1(+u+gqc$2kf@idgi-zu059qnsumdjq"


# =============================================================================
# SERVICE CONFIGURATION
# =============================================================================

# Service identification and networking
DJANGO_SERVICE_NAME = os.environ.get("DJANGO_SERVICE_AD_NAME")
DJANGO_SERVICE_PORT = os.environ.get("DJANGO_SERVICE_AD_PORT_EXPOSED")

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

# MongoDB connection configuration
DB_URL_BASE = os.environ.get("DB_URL_MONGODB")
DB_NAME = os.environ.get("AD_DB_NAME")

# Database connection URL constructor with authentication support
db_url_constructor = UrlConstructor(
    base_url=DB_URL_BASE,
    require_auth=os.environ.get("REQUIRE_DB_AUTH", "FALSE"),
    username=os.environ.get("DB_USERNAME", ""),
    password=os.environ.get("DB_PASSWORD", ""),
)
DB_URL = db_url_constructor.resolved_url

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================

# Redis connection URL using centralized RedisConfig
REDIS_URL = RedisConfig.get_full_redis_url()

# Redis TLS configuration
REQUIRE_REDIS_TLS = RedisConfig.REQUIRE_TLS

# =============================================================================
# MESSAGE QUEUE CONFIGURATION
# =============================================================================

# RabbitMQ connection configuration
MQ_URL_BASE_PRIMARY = os.environ.get("MQ_URL_BASE_PRIMARY")
MQ_URL_BASE_SECONDARY = os.environ.get("MQ_URL_BASE_SECONDARY")

# NOTE: this demo initially tried to drop RabbitMQ entirely by relying on
# Celery's "always eager" mode. That does NOT work here: the
# `Producer`/`RemoteRepository` pattern used throughout this codebase (see
# shared_libs.infrastructure.producer.service) dispatches tasks via
# `celery_app.send_task(name, ...)` by task *name* rather than by calling an
# imported Task object's `.delay()`, and Celery's eager mode has no effect
# on `send_task` (it still tries to publish to a real broker). So a real,
# reachable RabbitMQ - plus a Celery worker actually consuming
# `diagram_queue` - is a genuine requirement, not just legacy scaffolding.
# See the root README for how to run both locally.
mq_endpoint_resolution = resolve_mq_endpoint_from_env()
MQ_URL = mq_endpoint_resolution.url
MQ_TLS_CA_PATH = mq_endpoint_resolution.tls_ca_path


# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================

# Environment and region settings
ENV_TYPE = os.environ.get("ENV_TYPE")

# Frontend integration settings
REACT_PORT = int(os.environ.get("REACT_PORT", 3000))
REACT_URL = os.environ.get("REACT_URL", "http://127.0.0.1:3000")

# LLM defaults for architecture generation workers.
DEFAULT_LLM_MODEL = os.environ.get("DEFAULT_LLM_MODEL", "openai_gpt_5_2_api")
DIAGRAM_LLM_MODEL = os.environ.get("DIAGRAM_LLM_MODEL", DEFAULT_LLM_MODEL)
DATAFLOW_LLM_MODEL = os.environ.get("DATAFLOW_LLM_MODEL", DEFAULT_LLM_MODEL)

# =============================================================================
# PERFORMANCE CONFIGURATION
# =============================================================================

# Performance monitoring and optimization
LOG_PERF_TIMER = bool(os.environ.get("LOG_PERF_TIMER") == "TRUE")

# Redis caching configuration
# 30 days


# Session management
SESSION_EXPIRE_SECONDS = int(
    os.environ.get("SESSION_EXPIRE_SECONDS", 60 * 30)
)  # 30 minutes

# Celery task configuration
TASK_TIME_LIMIT = int(os.environ.get("TASK_TIME_LIMIT", 60 * 5))  # 5 minutes
TASK_WAIT_RESULT_TIMEOUT = int(
    os.environ.get("TASK_WAIT_RESULT_TIMEOUT", 60 * 5)
)  # 5 minutes

# Health check and debugging
SKIP_HEALTH_CHECK = bool(int(os.environ.get("SKIP_HEALTH_CHECK", 0)))
WRITE_ENGINE_RESULT_TO_FILE = bool(
    os.environ.get("WRITE_ENGINE_RESULT_TO_FILE") == "TRUE"
)

# Collection Management
DISABLE_MASTER_REGISTER = bool(os.environ.get("DISABLE_MASTER_REGISTER") == "TRUE")
DISABLE_KB_IM8 = bool(os.environ.get("DISABLE_KB_IM8") == "TRUE")


# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

# Django security settings
X_FRAME_OPTIONS = "DENY"  # Prevent clickjacking attacks
CORS_ALLOW_CREDENTIALS = True  # Allow credentials in CORS requests

# Environment-based security configuration
DEBUG = bool(int(os.environ.get("DEBUG", 1)))
CORS_ALLOW_ALL_ORIGINS = bool(int(os.environ.get("CORS_ALLOW_ALL_ORIGINS", 0)))

# Environment processor for parsing host lists
service_env_processor = ServiceEnvProcessor(os.environ)

# Allowed hosts configuration
ALLOWED_HOSTS = service_env_processor.get_hosts_from_string(
    env_key="ALLOWED_HOSTS",
)

# CORS allowed origins configuration
CORS_ALLOWED_ORIGINS = service_env_processor.get_hosts_from_string(
    env_key="CORS_ALLOWED_ORIGIN_HOSTS",
)

# Load balancer IP list (if required)
if os.environ.get("REQUIRE_LB_IP_LIST") == "TRUE":
    ALLOWED_HOSTS += service_env_processor.get_hosts_from_string(
        env_key="LB_IP_LIST",
    )


# =============================================================================
# DJANGO CORE CONFIGURATION
# =============================================================================

# Base directory for the Django project
BASE_DIR = Path(__file__).resolve().parent.parent

# Set BASE_DIR in environment for shared libraries
os.environ.setdefault("BASE_DIR", str(BASE_DIR))

# URL configuration
ROOT_URLCONF = "main.urls"

# WSGI / ASGI applications
WSGI_APPLICATION = "main.wsgi.application"
ASGI_APPLICATION = "main.asgi.application"

# Service endpoint prefix for API routing
SERVICE_ENDPOINT_PREFIX = "/api/v1/architecture_diagram"

# =============================================================================
# DJANGO FRAMEWORK SETTINGS
# =============================================================================

# Internationalization settings
APP_TIME_ZONE = "UTC"
TIME_ZONE = "UTC"
LANGUAGE_CODE = "en-us"
TZINFO = pytz.utc

# Django behavior settings
APPEND_SLASH = False
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# =============================================================================
# CELERY CONFIGURATION
# =============================================================================

# Celery timezone and UTC settings
CELERY_ENABLE_UTC = True
CELERY_TIMEZONE = "UTC"

# Celery connection retry configuration
CELERY_MQ_CONNECTION_MAX_RETRIES = 100
CELERY_MQ_CONNECTION_RETRY_INTERVAL = 60
CELERY_MQ_CONNECTION_RETRY_ON_STARTUP = True

# Celery automatic configuration (namespace: CELERY)
CELERY_RESULT_EXPIRES = int(os.environ.get("CELERY_RESULT_EXPIRES", 120))
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_MAX_RETRIES = 100
CELERY_BROKER_CONNECTION_RETRY_INTERVAL = 60
CELERY_TASK_DEFAULT_DELIVERY_MODE = "persistent"
CELERY_CONTROL_QUEUE_EXCLUSIVE = True
CELERY_EVENT_QUEUE_EXCLUSIVE = True
if MQ_TLS_CA_PATH:
    CELERY_BROKER_USE_SSL = {
        "ca_certs": MQ_TLS_CA_PATH,
        "cert_reqs": ssl.CERT_REQUIRED,
    }


# =============================================================================
# DJANGO APPLICATIONS CONFIGURATION
# =============================================================================

# List of Django applications installed in this project
# Order matters: Django processes apps in the order they appear
INSTALLED_APPS = [
    # Django built-in applications
    "django.contrib.contenttypes",  # Content type framework
    "django.contrib.sessions",  # Session framework
    "django.contrib.messages",  # Message framework
    "django.contrib.staticfiles",  # Static file serving
    # Local applications
    "service",  # Main business logic application
    # Third-party applications
    "rest_framework",  # Django REST Framework
    "corsheaders",  # CORS handling
    "drf_yasg",  # Swagger/OpenAPI documentation
]

# =============================================================================
# DJANGO MIDDLEWARE CONFIGURATION
# =============================================================================

# Middleware stack optimized for performance and security
# Order is critical: middleware processes requests in order and responses in reverse order
MIDDLEWARE = [
    # 1. Performance monitoring (first to measure everything)
    "shared_libs.middleware.timer.PerformanceTimerMiddleware",
    # 2. Health check middleware (early health check handling)
    "middleware.health_check.health_check_middleware",
    # 3. Security headers (early security measures)
    "django.middleware.security.SecurityMiddleware",
    # 4. CORS handling
    "corsheaders.middleware.CorsMiddleware",
    # 5. Session management 
    "django.contrib.sessions.middleware.SessionMiddleware",
    # 6. Common middleware (URL processing, trailing slash handling)
    "django.middleware.common.CommonMiddleware",
    # 7. Message framework
    "django.contrib.messages.middleware.MessageMiddleware",
    # 8. Clickjacking protection (final security layer)
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# =============================================================================
# DJANGO TEMPLATES CONFIGURATION
# =============================================================================

# Template engine configuration
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# =============================================================================
# DJANGO REST FRAMEWORK CONFIGURATION
# =============================================================================

# REST Framework settings for API development
REST_FRAMEWORK = {
    # Pagination settings
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
    # Custom exception handling
    "EXCEPTION_HANDLER": "shared_libs.exceptions.api_exceptions.custom_exception_handler",
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "UNAUTHENTICATED_USER": None,
    "UNAUTHENTICATED_TOKEN": None,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/min",  # 60 requests per minute per client IP
        "user": "600/min",  # Used only by views with an explicit UserRateThrottle
    },
}

# =============================================================================
# STATIC FILES CONFIGURATION
# =============================================================================

# Static files URL and directories
STATIC_URL = "/static/"

# =============================================================================
# API DOCUMENTATION CONFIGURATION
# =============================================================================

# Swagger/OpenAPI documentation settings
SWAGGER_SETTINGS = {
    "SECURITY_DEFINITIONS": {
        "JWT": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
        },
    },
}

# =============================================================================
# SESSION CONFIGURATION
# =============================================================================

# Session management settings
SESSION_COOKIE_AGE = int(SESSION_EXPIRE_SECONDS)
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_SAVE_EVERY_REQUEST = True

# =============================================================================
# CACHE CONFIGURATION
# =============================================================================

# Redis cache configuration for Django
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "IGNORE_EXCEPTIONS": True,  # Ignore cache errors to prevent app crashes
            "CONNECTION_POOL_KWARGS": {
                "max_connections": 100,
                "retry_on_timeout": True,
            },
            "REDIS_CLIENT_KWARGS": {
                "ssl": RedisConfig.REQUIRE_TLS,
                "socket_timeout": 5,
            },
        },
    }
}

# =============================================================================
# LOGGING AND DEVELOPMENT CONFIGURATION
# =============================================================================

# Application logger configuration
logger = logging.getLogger(__name__)
logger_level = logging.getLevelName(logger.level)

# Log startup configuration for debugging
logger.info(
    f"[ ARCH-DIAGRAM ] Architecture Diagram Service Configuration:\n"
    f"  SERVICE_NAME: {DJANGO_SERVICE_NAME}\n"
    f"  PORT: {DJANGO_SERVICE_PORT}\n"
    f"  ENV_TYPE: {ENV_TYPE}\n"
    f"  DEBUG: {DEBUG}\n"
    f"  ALLOWED_HOSTS: {ALLOWED_HOSTS}\n"
    f"  CORS_ALLOW_ALL_ORIGINS: {CORS_ALLOW_ALL_ORIGINS}\n"
    f"  CORS_ALLOWED_ORIGINS: {CORS_ALLOWED_ORIGINS}\n"
    f"  REACT_URL: {REACT_URL}\n"
    f"  REACT_PORT: {REACT_PORT}\n"
    f"  DB_URL_BASE: {DB_URL_BASE}\n"
    f"  DB_NAME: {DB_NAME}\n"
    f"  REDIS_URL_BASE: {RedisConfig.URL_BASE}\n"
    f"  REDIS_TLS: {RedisConfig.REQUIRE_TLS}\n"
    f"  MQ_URL_BASE_PRIMARY: {MQ_URL_BASE_PRIMARY}\n"
    f"  MQ_URL_BASE_SECONDARY: {MQ_URL_BASE_SECONDARY}\n"
    f"  SESSION_EXPIRE_SECONDS: {SESSION_EXPIRE_SECONDS}\n"
    f"  LOG_LEVEL: {logger_level}\n"
    f"  LOG_PROPAGATE: {logger.propagate}\n"
    f"  LOG_PERFORMANCE: {LOG_PERF_TIMER}"
)

# Development server configuration
runserver.default_port = int(DJANGO_SERVICE_PORT)
