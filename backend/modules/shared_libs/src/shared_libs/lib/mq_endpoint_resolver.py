import json
import logging
import os
import re
import ssl
import tempfile
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import quote, urlsplit

logger = logging.getLogger(__name__)


def load_rabbitmq_ca_crt(secret_id: str) -> str | None:
    try:
        import boto3

        response = boto3.client("secretsmanager").get_secret_value(SecretId=secret_id)
        payload = json.loads(response["SecretString"])
        ca_crt = payload.get("ca_crt")
        if not ca_crt:
            raise ValueError("ca_crt is missing")
        return ca_crt
    except Exception as exc:
        logger.warning(
            "RabbitMQ TLS CA retrieval failed for %s: %s: %s",
            secret_id,
            type(exc).__name__,
            exc,
        )
        return None


@dataclass(frozen=True)
class MQEndpointResolution:
    url: str
    endpoint_name: str
    tls_ca_path: str | None


class MQEndpointResolver:
    def __init__(
        self,
        primary_base_url: str,
        secondary_base_url: str | None,
        require_auth: str,
        username: str,
        password: str,
        require_tls: bool,
        ca_crt: str | None,
        connection_factory: Callable | None = None,
        connect_timeout: int = 5,
    ):
        self.primary_base_url = primary_base_url
        self.secondary_base_url = secondary_base_url
        self.require_auth = require_auth
        self.username = username
        self.password = password
        self.require_tls = require_tls
        self.ca_crt = ca_crt
        if connection_factory is None:
            from kombu import Connection

            connection_factory = Connection
        self.connection_factory = connection_factory
        self.connect_timeout = connect_timeout
        self.tls_ca_path = self._write_ca_bundle() if require_tls and ca_crt else None

    def resolve(self) -> MQEndpointResolution:
        endpoints = [("primary", self.primary_base_url)]
        if self.secondary_base_url:
            endpoints.append(("secondary", self.secondary_base_url))

        failures = []
        for endpoint_name, base_url in endpoints:
            try:
                url = self._build_url(base_url)
            except Exception as exc:
                logger.error(
                    "RabbitMQ %s URL construction failed: %s: %s",
                    endpoint_name,
                    type(exc).__name__,
                    exc,
                )
                failures.append(f"{endpoint_name}: {type(exc).__name__}: {exc}")
                continue

            try:
                self._probe(url)
            except Exception as exc:
                sanitized_url = self._sanitize_url_password(url)
                logger.warning(
                    "RabbitMQ %s connection failed for %s: %s: %s",
                    endpoint_name,
                    sanitized_url,
                    type(exc).__name__,
                    exc,
                )
                failures.append(f"{endpoint_name}: {type(exc).__name__}: {exc}")
                continue

            sanitized_url = self._sanitize_url_password(url)
            if endpoint_name == "primary":
                logger.info("RabbitMQ primary connection successful: %s", sanitized_url)
            else:
                logger.info(
                    "RabbitMQ primary connection failed; using secondary fallback: %s",
                    sanitized_url,
                )
            return MQEndpointResolution(url, endpoint_name, self.tls_ca_path)

        failure_reason = "; ".join(failures)
        logger.error("No configured RabbitMQ endpoint is reachable: %s", failure_reason)
        raise ConnectionError(
            f"No configured RabbitMQ endpoint is reachable: {failure_reason}"
        )

    def _build_url(self, base_url: str) -> str:
        if self.require_auth != "TRUE":
            return base_url

        scheme, authority = base_url.split("://", maxsplit=1)
        username = quote(self.username, safe="")
        password = quote(self.password, safe="")
        return f"{scheme}://{username}:{password}@{authority}"

    @staticmethod
    def _sanitize_url_password(url: str) -> str:
        return re.sub(r"(\w+://[^:]+:)([^@]+)(@.+)", r"\1***\3", url)

    def _probe(self, url: str) -> None:
        scheme = urlsplit(url).scheme
        if self.require_tls and scheme != "amqps":
            raise ValueError("REQUIRE_MQ_TLS=TRUE requires an amqps endpoint")

        ssl_options = False
        if scheme == "amqps":
            ssl_options = {
                "cert_reqs": ssl.CERT_REQUIRED,
            }
            if self.tls_ca_path:
                ssl_options["ca_certs"] = self.tls_ca_path

        connection = self.connection_factory(
            url,
            connect_timeout=self.connect_timeout,
            ssl=ssl_options,
        )
        try:
            connection.connect()
        finally:
            connection.release()

    def _write_ca_bundle(self) -> str:
        system_ca_path = ssl.get_default_verify_paths().cafile
        system_ca_bundle = ""
        if system_ca_path and Path(system_ca_path).exists():
            system_ca_bundle = Path(system_ca_path).read_text(encoding="utf-8")

        fd, temp_path = tempfile.mkstemp(prefix="tm-rabbitmq-ca-", suffix=".crt")
        try:
            with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as ca_file:
                if system_ca_bundle:
                    ca_file.write(system_ca_bundle.rstrip())
                    ca_file.write("\n")
                ca_file.write(self.ca_crt.strip())
                ca_file.write("\n")
            os.chmod(temp_path, 0o600)
        except Exception:
            Path(temp_path).unlink(missing_ok=True)
            raise
        return temp_path


def resolve_mq_endpoint_from_env() -> MQEndpointResolution:
    primary_base_url = os.environ.get("MQ_URL_BASE_PRIMARY")
    if not primary_base_url:
        logger.error(
            "RabbitMQ endpoint resolution failed: MQ_URL_BASE_PRIMARY is required"
        )
        raise ValueError("MQ_URL_BASE_PRIMARY is required")

    ca_crt = os.environ.get("RABBITMQ_CA_CRT")
    tls_secret_id = os.environ.get("RABBITMQ_TLS_SECRET_ID")
    if not ca_crt and tls_secret_id:
        ca_crt = load_rabbitmq_ca_crt(tls_secret_id)

    try:
        return MQEndpointResolver(
            primary_base_url=primary_base_url,
            secondary_base_url=os.environ.get("MQ_URL_BASE_SECONDARY"),
            require_auth=os.environ.get("REQUIRE_MQ_AUTH", "TRUE"),
            username=os.environ.get("MQ_USERNAME", "guest"),
            password=os.environ.get("MQ_PASSWORD", "guest"),
            require_tls=os.environ.get("REQUIRE_MQ_TLS", "FALSE") == "TRUE",
            ca_crt=ca_crt,
        ).resolve()
    except Exception as exc:
        logger.error(
            "RabbitMQ endpoint resolution failed during startup: %s: %s",
            type(exc).__name__,
            exc,
        )
        raise
