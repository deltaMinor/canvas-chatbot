from django.urls import path

from .views import (
    LoginAPIView,
    SwaggerDocsAPIView,
    SwaggerUIAPIView,
    login_redirect_view,
)

urlpatterns = [
    path(
        "secured/docs/swagger<format>",
        SwaggerDocsAPIView.as_view(),
        # schema_view.without_ui(cache_timeout=0),
        # name="schema-json",
    ),
    path(
        "secured/docs/swagger",
        SwaggerUIAPIView.as_view(),
        # schema_view.with_ui("swagger", cache_timeout=0),
        # name="schema-swagger-ui",
    ),
    path(
        "login",
        LoginAPIView.as_view(),
    ),
    path(
        "",
        login_redirect_view,
    ),
    # path(
    #     "/accounts",
    #     include("django.contrib.auth.urls"),
    # ),
    # path(
    #     "",
    #     admin.site.urls,
    # ),
]
