"""
Authentication decorators for Django REST Framework views.

Service-specific authentication decorators that integrate with the centralized
authentication system for JWT token verification and user permission checks.
"""

from collections.abc import Callable

from django.conf import settings

from shared_libs.decorators import authenticated_only_func


def authenticated_only(
    verify_superuser: bool = False,
    extend_timer: bool = True,
) -> Callable:
    """
    Decorator factory for authentication and authorization in Django views.

    Verifies JWT tokens, validates Django sessions, and optionally checks for
    superuser privileges. Integrates with Redis caching and Celery background tasks.

    Args:
        verify_superuser (bool): Require superuser privileges. Defaults to False.
        extend_timer (bool): Extend session timer on verification. Defaults to True.

    Returns:
        Callable: Decorator function that wraps view methods with authentication logic.

    Raises:
        Unauthorized: If authentication fails, session is invalid, or superuser
            privileges are required but not present.

    Example:
        @authenticated_only()
        def my_view(self, request, auth_producer, *args, **kwargs):
            user = auth_producer.authentication_model.user
            return Response({"user_id": user.id})

        @authenticated_only(verify_superuser=True)
        def admin_view(self, request, auth_producer, *args, **kwargs):
            return Response({"message": "Admin access granted"})
    """
    from main import celery_app
    from service.stores.user_permission_doc_store import user_permission_doc_store

    from shared_libs.lib.redis_util import get_redis_client

    redis_client = get_redis_client("authentication")

    return authenticated_only_func(
        celery_app=celery_app,
        redis_client=redis_client,
        user_permission_doc_store=user_permission_doc_store,
        settings=settings,
        verify_superuser=verify_superuser,
        extend_timer=extend_timer,
    )
