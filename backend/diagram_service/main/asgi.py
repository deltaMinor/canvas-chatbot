"""
ASGI config for diagram_service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

from shared_libs.lib.health_status import start_periodic_health_publisher

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "main.settings")

application = get_asgi_application()
start_periodic_health_publisher("diagram_service")
