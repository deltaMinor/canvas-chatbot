import logging

from rest_framework import status
from rest_framework.request import Request

logger = logging.getLogger(__name__)


class FlushSessionOnUnauthorizedMiddleware:
    def __init__(self, get_response):
        # One-time configuration and initialization
        self.get_response = get_response

    def __call__(self, request: Request):
        # Code to be executed for each request before the view is called.

        # Retrieving the response
        response = self.get_response(request)

        # Code to be executed for each request/response after the view is called.
        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            # Flush the session
            request.session.flush()

        # Returning the response
        return response
