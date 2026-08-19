import logging
import sys
from unittest.mock import Mock

import pytest

from shared_libs.lib.mq_endpoint_resolver import (
    MQEndpointResolver,
    load_rabbitmq_ca_crt,
)


def build_connection_factory(failing_urls=None):
    failing_urls = failing_urls or set()
    connections = []

    def factory(url, **kwargs):
        connection = Mock()
        connection.url = url
        connection.kwargs = kwargs
        if url in failing_urls:
            connection.connect.side_effect = OSError("connection failed")
        connections.append(connection)
        return connection

    return factory, connections


def build_resolver(connection_factory, **kwargs):
    return MQEndpointResolver(
        primary_base_url=kwargs.get("primary_base_url", "amqp://primary:5672/"),
        secondary_base_url=kwargs.get("secondary_base_url"),
        require_auth="TRUE",
        username="user",
        password="password",
        require_tls=kwargs.get("require_tls", False),
        ca_crt=kwargs.get("ca_crt"),
        connection_factory=connection_factory,
    )


def test_resolve_uses_primary_when_available():
    connection_factory, connections = build_connection_factory()

    resolution = build_resolver(connection_factory).resolve()

    assert resolution.endpoint_name == "primary"
    assert resolution.url == "amqp://user:password@primary:5672/"
    assert len(connections) == 1


def test_resolve_uses_secondary_when_primary_fails(caplog):
    caplog.set_level(logging.INFO)
    primary_url = "amqp://user:password@primary:5672/"
    connection_factory, connections = build_connection_factory({primary_url})

    resolution = build_resolver(
        connection_factory,
        secondary_base_url="amqp://secondary:5672/",
    ).resolve()

    assert resolution.endpoint_name == "secondary"
    assert resolution.url == "amqp://user:password@secondary:5672/"
    assert len(connections) == 2
    assert "password" not in caplog.text
    assert "using secondary fallback" in caplog.text


def test_resolve_fails_when_no_endpoint_is_available():
    primary_url = "amqp://user:password@primary:5672/"
    connection_factory, _ = build_connection_factory({primary_url})

    with pytest.raises(ConnectionError, match="No configured RabbitMQ endpoint"):
        build_resolver(connection_factory).resolve()


def test_tls_without_private_ca_uses_system_ca_verification():
    connection_factory, connections = build_connection_factory()

    resolution = build_resolver(
        connection_factory,
        primary_base_url="amqps://primary:5671/",
        require_tls=True,
    ).resolve()

    assert resolution.endpoint_name == "primary"
    assert resolution.tls_ca_path is None
    assert connections[0].kwargs["ssl"] == {"cert_reqs": 2}


def test_tls_without_private_ca_can_use_secondary_fallback():
    primary_url = "amqps://user:password@primary:5671/"
    connection_factory, connections = build_connection_factory({primary_url})

    resolution = build_resolver(
        connection_factory,
        primary_base_url="amqps://primary:5671/",
        secondary_base_url="amqps://secondary:5671/",
        require_tls=True,
    ).resolve()

    assert resolution.endpoint_name == "secondary"
    assert resolution.url == "amqps://user:password@secondary:5671/"
    assert len(connections) == 2


def test_tls_ca_retrieval_failure_is_logged_and_ignored(monkeypatch, caplog):
    boto3 = Mock()
    boto3.client.return_value.get_secret_value.side_effect = RuntimeError(
        "secret unavailable"
    )
    monkeypatch.setitem(sys.modules, "boto3", boto3)
    caplog.set_level(logging.WARNING)

    assert load_rabbitmq_ca_crt("tm-dev-secret-mq-tls") is None
    assert "RabbitMQ TLS CA retrieval failed" in caplog.text
    assert "secret unavailable" in caplog.text
