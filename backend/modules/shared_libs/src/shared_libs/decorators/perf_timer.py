import logging
from collections.abc import Callable
from functools import wraps
from time import time
from typing import Any

from shared_libs import lib_config

LOG_PERF_TIMER = lib_config.LOG_PERF_TIMER

logger = logging.getLogger(__name__)


def perf_timer(func: Callable) -> Callable:
    @wraps(func)
    def wrap(*args, **kwargs) -> Any:
        t_start = time()
        result = func(*args, **kwargs)
        t_end = time()
        lapsed = t_end - t_start

        if str(LOG_PERF_TIMER) != "TRUE":
            return result

        class_name = ""
        if args and hasattr(args[0], "__class__"):
            class_name = args[0].__class__.__name__
        logger.info(
            f"[ SHARED-CORE ] >>>>> func:{class_name}.{func.__name__} took {lapsed:2.4f} sec"
        )
        return result

    return wrap
