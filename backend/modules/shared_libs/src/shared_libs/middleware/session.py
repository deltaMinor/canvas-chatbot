import logging

from django.contrib.sessions.backends.base import SessionBase
from django.contrib.sessions.middleware import SessionMiddleware

from shared_libs import lib_config

EXEMPTED_PATHS = lib_config.EXEMPTED_PATHS

logger = logging.getLogger(__name__)


class CustomSessionMiddleware(SessionMiddleware):
    def process_request(self, request):
        # Skip session processing for specified paths
        if request.path in EXEMPTED_PATHS:
            request.session = SessionBase()  # Clear session or do nothing
            return None  # Skip further processing

        return super().process_request(request)

    def process_response(self, request, response):
        # Skip session processing for specified paths
        if request.path in EXEMPTED_PATHS:
            return response  # Do not modify response

        return super().process_response(request, response)
