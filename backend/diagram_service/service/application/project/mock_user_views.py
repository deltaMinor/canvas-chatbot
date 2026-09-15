import logging

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.templates.message_template import success

from . import mock_users

logger = logging.getLogger(__name__)


class MockUsersAPIView(APIView):
    """Lists every mock user (seeding the default set on first use), and
    lets an admin create a new one.
"""

    def get(self, request: Request):
        users = mock_users.list_users()
        return Response(
            success("Mock users retrieved successfully.", {"users": users}),
            status=status.HTTP_200_OK,
        )

    def post(self, request: Request):
        mock_users.require_admin(request)

        new_user = mock_users.create_user()
        return Response(
            success("Mock user created successfully.", {"user": new_user}),
            status=status.HTTP_201_CREATED,
        )


class MockUserAPIView(APIView):
    """Admin-only endpoint to delete a mock user and everything belonging to
    their project.
    """

    def delete(self, request: Request, user_id: str):
        mock_users.require_admin(request)

        mock_users.delete_user(user_id)
        return Response(
            success("Mock user deleted successfully.", {"user_id": user_id}),
            status=status.HTTP_200_OK,
        )


class MockUserQuotaAPIView(APIView):
    """Admin-only endpoint to view/update a mock user's `diagram_quota`."""

    def patch(self, request: Request, user_id: str):
        mock_users.require_admin(request)

        if "diagram_quota" not in request.data:
            raise BadRequest("diagram_quota is required.")

        updated_user = mock_users.set_diagram_quota(
            user_id,
            request.data.get("diagram_quota"),
        )
        return Response(
            success("Diagram quota updated successfully.", {"user": updated_user}),
            status=status.HTTP_200_OK,
        )
