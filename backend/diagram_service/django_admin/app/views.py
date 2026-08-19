import logging

from django.conf import settings
from django.shortcuts import redirect, render
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions, status
from rest_framework.decorators import throttle_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

from shared_libs.decorators import raise_exception
from shared_libs.lib.nonblocking_api_view import NonBlockingAPIView

from .form import AdminAuthenticationForm

STATIC_URL = settings.STATIC_URL

logger = logging.getLogger(__name__)


@throttle_classes([AnonRateThrottle])
def login_redirect_view(request):
    return redirect("/login")


@throttle_classes([AnonRateThrottle])
class LoginAPIView(NonBlockingAPIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @raise_exception(
        "Failed to retrieve login page.",
        exception_logger=logger,
    )
    def get(self, request: Request, *args, **kwargs):
        context = {
            "form": AdminAuthenticationForm,
            "app_path": request.get_full_path(),
            "next": "/secured/docs/swagger",
        }
        return render(
            request,
            "accounts/login.html",
            context=context,
        )

    @raise_exception(
        "Failed to login for backend admin access.",
        exception_logger=logger,
    )
    def post(self, request: Request, *args, **kwargs):
        next_url = request.data.get("next")
        return redirect(next_url)
        return Response(
            {"status": "OK"},
            status=status.HTTP_200_OK,
        )


SchemaView = get_schema_view(
    info=openapi.Info(
        title="Architecture Diagram Service API",
        default_version="v1",
        description="This API provides functionalities for managing and retrieving architecture diagrams. It includes endpoints for creating, updating, deleting, and fetching diagrams, as well as managing related metadata. The API ensures secure access and efficient handling of architecture diagram data.",
        # terms_of_service="https://www.google.com/policies/terms/",
        # contact=openapi.Contact(email="contact@snippets.local"),
        # license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


@throttle_classes([UserRateThrottle])
class SwaggerDocsAPIView(NonBlockingAPIView, SchemaView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @raise_exception(
        "Failed to retrieve swagger docs.",
        exception_logger=logger,
    )
    def get(self, request: Request, *args, **kwargs):
        return SchemaView.without_ui(cache_timeout=0)(request=request._request)


@throttle_classes([UserRateThrottle])
class SwaggerUIAPIView(NonBlockingAPIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @raise_exception(
        "Failed to retrieve swagger ui.",
        exception_logger=logger,
    )
    def get(self, request: Request, *args, **kwargs):
        context = {
            "URL_PREFIX": STATIC_URL,
        }
        return render(
            request,
            "docs/swagger-ui.html",
            context=context,
        )
