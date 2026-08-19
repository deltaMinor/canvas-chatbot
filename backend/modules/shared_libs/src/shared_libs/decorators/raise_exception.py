import logging
from collections.abc import Callable
from functools import wraps
from logging import Logger
from typing import Any

from pydantic import ValidationError

from shared_libs.exceptions.api_exceptions import (
    BadRequest,
    Conflict,
    InputValidationError,
    InternalServerError,
    MethodNotAllowed,
    NotFound,
    ServiceUnavailable,
    TooManyRequests,
    Unauthorized,
)
from shared_libs.exceptions.exceptions import (
    DictionaryKeyError,
    DictionaryValueError,
    HeaderKeyError,
    HeaderValueError,
)
from shared_libs.templates.message_template import success

logger = logging.getLogger(__name__)


class ExceptionHandler:
    def __init__(
        self,
        default_exception: Exception,
        exception_logger: Logger,
    ):
        self.default_exception = default_exception
        self.exception_logger = exception_logger

    @staticmethod
    def remove_double_periods(message: str) -> str:
        """
        Removes double periods from the message.
        """
        i = 0
        while "shared_libs." in message and i < 10:
            message = message.replace("shared_libs.", ".")
            i += 1

    def handle_known_exceptions(self, e, custom_message):
        def get_exception_message(e: Exception, custom_message: str) -> str:
            """
            Constructs a log message for caught exceptions.
            """
            message = f"{e.__class__.__name__}: {custom_message} Original exception message: {str(e)}"
            self.remove_double_periods(message)
            return message

        message = get_exception_message(e, custom_message)
        # `raise_exception` decorators stack across call layers (e.g. a helper
        # calling another helper). Since known exceptions are re-raised as the
        # same instance, each layer would otherwise log the identical failure
        # again on the way up. Log it once, at the innermost layer.
        if not getattr(e, "_raise_exception_logged", False):
            self.exception_logger.error(message)
            e._raise_exception_logged = True
        return message

    def handle_validation_exceptions(self, e, custom_message):
        def get_validation_exception_message(e: Exception, custom_message: str) -> str:
            """
            Constructs a log message for validation exceptions.
            """
            message = f"{e.__class__.__name__}: Type validation failed. {custom_message} Original exception message: {str(e)}"
            self.remove_double_periods(message)
            return message

        message = get_validation_exception_message(e, custom_message)
        self.exception_logger.error(message)
        return message

    def handle_timeout_exception(self, e, custom_message):
        def get_timeout_exception_message(e: Exception, custom_message: str) -> str:
            """
            Constructs a log message for timeout exceptions.
            """
            message = f"{e.__class__.__name__}: Operation timeout. {custom_message} Original exception message: {str(e)}"
            self.remove_double_periods(message)
            return message

        message = get_timeout_exception_message(e, custom_message)
        self.exception_logger.error(message)
        return message

    def handle_uncaught_exception(self, e, custom_message):
        def get_uncaught_exception_message(e: Exception, custom_message: str) -> str:
            """
            Constructs a log message for uncaught exceptions.
            """
            message = f"Uncaught exception of type '{e.__class__.__name__}' encountered. Reraising as '{self.default_exception.__name__}'. Custom message: {custom_message} Original exception message: {str(e)}"
            self.remove_double_periods(message)
            return message

        message = get_uncaught_exception_message(e, custom_message)
        self.exception_logger.error(message)
        return message


def DEFAULT_FUNC(*args, **kwargs):
    pass


def raise_exception(
    custom_message: str = "",
    default_exception: Exception = InternalServerError,
    exception_logger: Logger = logger,
    decorator: str = "exception_decorator",
    func_on_error: Callable = DEFAULT_FUNC,
) -> Callable:
    """
    A decorator function that wraps a given function with exception handling logic.

    This function catches specific exceptions, logs them, and re-raises them. If an exception other than the specified ones is caught, it is logged and the default_exception is raised.

    Args:
        custom_message (str): The custom message to be included in the log when an exception is caught.
        default_exception (Exception, optional): The type of exception to be raised when an uncaught exception is encountered. Defaults to InternalServerError.

    Returns:
        Callable: A decorator that can be used to wrap a function with exception handling logic.
    """

    def exception_decorator(func: Callable) -> Callable:
        @wraps(func)
        def exception_func(*args, **kwargs) -> Any:
            """
            The actual function that is returned by the decorator. It handles the exceptions raised from the decorated function.

            Args:
                *args: Variable length argument list.
                **kwargs: Arbitrary keyword arguments.

            Returns:
                Any: The return value of the decorated function.

            Raises:
                BadRequest, Conflict, InternalServerError, MethodNotAllowed, NotFound, Unauthorized, ValidationError: If any of these exceptions are raised from the decorated function, they are logged and re-raised.
                default_exception: If an exception other than the specified ones is raised from the decorated function, it is logged and the default_exception is raised.
            """
            exception_handler = ExceptionHandler(
                default_exception=default_exception,
                exception_logger=exception_logger,
            )
            try:
                return func(*args, **kwargs)
            except (
                BadRequest,
                Conflict,
                InputValidationError,
                InternalServerError,
                MethodNotAllowed,
                NotFound,
                ServiceUnavailable,
                TooManyRequests,
                Unauthorized,
            ) as e:
                exception_handler.handle_known_exceptions(e, custom_message)
                func_on_error(*args, **kwargs)
                raise
            except (
                DictionaryKeyError,
                DictionaryValueError,
                HeaderKeyError,
                HeaderValueError,
                ValidationError,
            ) as e:
                message = exception_handler.handle_validation_exceptions(
                    e, custom_message
                )
                func_on_error(*args, **kwargs)
                raise InputValidationError(message) from e
            except TimeoutError as e:
                message = exception_handler.handle_timeout_exception(e, custom_message)
                func_on_error(*args, **kwargs)
                raise default_exception(message) from e
            except Exception as e:
                message = exception_handler.handle_uncaught_exception(e, custom_message)
                func_on_error(*args, **kwargs)
                raise default_exception(message) from e

        return exception_func

    def task_exception_decorator(func: Callable) -> Callable:
        @wraps(func)
        def exception_func(*args, **kwargs) -> Any:
            exception_handler = ExceptionHandler(default_exception, exception_logger)
            try:
                return func(*args, **kwargs)
            except Exception as e:
                message = exception_handler.handle_uncaught_exception(e, custom_message)
                func_on_error(*args, **kwargs)
                return success(message, data=None, code=400)

        return exception_func

    if decorator == "exception_decorator":
        return exception_decorator
    if decorator == "task_exception_decorator":
        return task_exception_decorator
    return
