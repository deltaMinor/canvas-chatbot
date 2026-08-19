import logging
import uuid
from time import time

from rest_framework.request import Request

from shared_libs import lib_config

LOG_PERF_TIMER = lib_config.LOG_PERF_TIMER

logger = logging.getLogger(__name__)


class PerformanceTimerMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: Request):
        request_id = str(uuid.uuid4().hex[:12])
        # request.META["REQUEST_ID"] = request_id

        t_start = time()
        if str(LOG_PERF_TIMER) == "TRUE":
            logger.info(
                f"[ SHARED-MIDDLEWARE ] [{request_id} request]: {request.path} benchmarking started ..."
            )

        response = self.get_response(request)

        t_end = time()
        elapsed = t_end - t_start
        if str(LOG_PERF_TIMER) == "TRUE":
            msg = f"[ SHARED-MIDDLEWARE ] [{request_id} request]: {request.path} took {elapsed:2.4f} sec."
            if elapsed > 2.0:
                logger.warning(msg)
            else:
                logger.info(msg)
        return response
