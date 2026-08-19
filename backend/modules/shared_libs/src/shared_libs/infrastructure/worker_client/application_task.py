import json
import logging
from sys import getsizeof

from celery import Task

from shared_libs import lib_config

logger = logging.getLogger(__name__)


class ApplicationTask(Task):
    """
    A class representing an application task.

    This class extends the Task class and overrides its methods to provide custom behavior for starting, replacing, failing, retrying, and succeeding tasks.

    Attributes:
        default_retry_delay (int): The default delay before a task is retried.
        max_retries (int): The maximum number of times a task can be retried.
        expires (int): The time after which the task expires.
        time_limit (int): The maximum time that the task can run.
        soft_time_limit (int): The time after which the task will be softly killed.

    Methods:
        before_start(task_id, args, kwargs): Logs a message before the task starts.
        on_replace(sig): Logs a warning message when the task is replaced.
        on_failure(exc, task_id, args, kwargs, einfo): Logs an error message when the task fails.
        on_retry(exc, task_id, args, kwargs, einfo): Logs a warning message when the task is retried.
        on_success(retval, task_id, args, kwargs): Logs a debug message when the task succeeds.
    """

    default_retry_delay = lib_config.TASK_DEFAULT_RETRY_DELAY
    expires = lib_config.TASK_EXPIRES
    max_retries = lib_config.TASK_MAX_RETRIES
    soft_time_limit = lib_config.TASK_SOFT_TIME_LIMIT
    time_limit = lib_config.TASK_TIME_LIMIT

    def before_start(self, task_id, args, kwargs):
        """
        Logs a message before the task starts.

        Args:
            task_id (str): The ID of the task.
            args (tuple): The positional arguments passed to the task.
            kwargs (dict): The keyword arguments passed to the task.
        """
        _id = task_id.split("-")[-1]
        _ = f"[{_id} {self.name}] Task running ..."
        logger.info("[ SHARED-INFRA ] %s", _)
        return

    def on_replace(self, sig):
        """
        Logs a warning message when the task is replaced.

        Args:
            sig (dict): The signal sent to the task.
        """
        # task = sig.get('task')
        _ = "Task replaced."
        logger.warning(_)
        return super().on_replace(sig)

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """
        Logs an error message when the task fails.

        Args:
            exc (Exception): The exception that caused the task to fail.
            task_id (str): The ID of the task.
            args (tuple): The positional arguments passed to the task.
            kwargs (dict): The keyword arguments passed to the task.
            einfo (str): The traceback of the exception.
        """
        _id = task_id.split("-")[-1]
        _ = f"[{_id} {self.name}] Task failed. {einfo}"
        logger.error(_)
        return

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        """
        Logs a warning message when the task is retried.

        Args:
            exc (Exception): The exception that caused the task to be retried.
            task_id (str): The ID of the task.
            args (tuple): The positional arguments passed to the task.
            kwargs (dict): The keyword arguments passed to the task.
            einfo (str): The traceback of the exception.
        """
        _id = task_id.split("-")[-1]
        _ = f"[{_id} {self.name}] Task retry ...."
        logger.warning(_)
        return

    def on_success(self, retval, task_id, args, kwargs):
        """
        Logs a debug message when the task succeeds.

        Args:
            retval (Any): The return value of the task.
            task_id (str): The ID of the task.
            args (tuple): The positional arguments passed to the task.
            kwargs (dict): The keyword arguments passed to the task.
        """
        _id = task_id.split("-")[-1]
        data_size = 0

        try:
            data_size = getsizeof(json.dumps(retval, default=str))
        except Exception as e:
            logger.warning(f"Failed to compute payload size. {e}")

        logger.info(
            f"[ SHARED-INFRA ] [{_id} {self.name}] Task completed. Payload size: {data_size} bytes."
        )
        if data_size > 10**7:
            logger.warning(f"Large payload of approx. {data_size / 10**6} MB detected.")
        return
