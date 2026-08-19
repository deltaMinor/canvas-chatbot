import logging
from typing import Any

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def custom_exception_handler(
    exc: Exception, context: dict[str, Any]
) -> Response | None:
    """
    Custom exception handler that modifies the response data.

    Args:
        exc (Exception): The exception that was raised.
        context (dict): A dictionary containing the request and view details.

    Returns:
        Response: The modified response.
    """
    from rest_framework.views import exception_handler

    response = exception_handler(exc, context)

    if response is not None and response.data is not None:
        response.data["code"] = response.status_code

        # Ensure "detail" exists in response.data before accessing it
        if "detail" in response.data:
            response.data["message"] = response.data["detail"]
            del response.data["detail"]
        else:
            response.data["message"] = "An error occurred."

        response.data["data"] = None

    return response


class BadRequest(APIException):
    """
    Exception raised for invalid or malformed client requests.

    This exception is raised when a client sends a request that the server cannot or will not process due to client-side issues.
    The HTTP status code for this exception is 400 (Bad Request).

    Attributes:
        status_code (int): HTTP status code for the exception. Defaults to 400 (Bad Request).
    """

    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, error_message="Invalid or malformed request"):
        """
        Initialize BadRequest exception with an error message.

        Args:
            error_message (str, optional): The error message to be logged and passed to the parent class's __init__ method. Defaults to "Invalid or malformed request".
        """
        logger.info(f"[ SHARED-EXCEPTION ] BadRequest exception: {error_message}")
        super().__init__(error_message)


class InputValidationError(APIException):
    """
    Exception raised for validation errors.

    This exception is raised when a validation error occurs, typically due to invalid input data.
    The HTTP status code for this exception is 400 (Bad Request).

    Attributes:
        status_code (int): HTTP status code for the exception. Defaults to 400 (Bad Request).
    """

    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, error_message="Invalid input provided"):
        """
        Initialize InputValidationError with an error message.

        Args:
            error_message (str, optional): The error message to be logged and passed to the parent class's __init__ method. Defaults to "Invalid data provided".
        """
        logger.info(
            f"[ SHARED-EXCEPTION ] InputValidationError exception: {error_message}"
        )
        super().__init__(error_message)


class Unauthorized(APIException):
    """
    Exception raised when an unauthorized action is attempted.

    This exception is raised when a user tries to perform an action they do not have the necessary permissions for.
    The HTTP status code for this exception is 401 (Unauthorized).

    Attributes:
        status_code (int): HTTP status code for the exception. Defaults to 401 (Unauthorized).
    """

    status_code = status.HTTP_401_UNAUTHORIZED

    def __init__(self, error_message="Unauthorized action attempted"):
        """
        Initialize Unauthorized exception with an error message.

        Args:
            error_message (str, optional): The error message to be logged and passed to the parent class's __init__ method. Defaults to "Unauthorized action attempted".
        """
        logger.info(f"[ SHARED-EXCEPTION ] Unauthorized exception: {error_message}")
        super().__init__(error_message)


class Forbidden(APIException):
    """
    Exception raised when access to a resource is forbidden.

    This exception is raised when a user attempts to access a resource or perform an action that is forbidden, even if they are authenticated.
    The HTTP status code for this exception is 403 (Forbidden).

    Attributes:
        status_code (int): HTTP status code for the exception. Defaults to 403 (Forbidden).
    """

    status_code = status.HTTP_403_FORBIDDEN

    def __init__(self, error_message="Access to this resource is forbidden"):
        """
        Initialize Forbidden exception with an error message.

        Args:
            error_message (str, optional): The error message to be logged and passed to the parent class's __init__ method. Defaults to "Access to this resource is forbidden".
        """
        logger.info(f"[ SHARED-EXCEPTION ] Forbidden exception: {error_message}")
        super().__init__(error_message)


class TooManyRequests(APIException):
    """
    Exception raised when a client has exceeded an allowed request limit.
    """

    status_code = status.HTTP_429_TOO_MANY_REQUESTS

    def __init__(self, error_message="Too many requests"):
        """
        Initialize TooManyRequests exception with an error message.
        """
        logger.info(f"[ SHARED-EXCEPTION ] TooManyRequests exception: {error_message}")
        super().__init__(error_message)


class NotFound(APIException):
    """
    Exception raised when a requested resource is not found.

    This exception is raised when a requested resource cannot be located.
    The HTTP status code for this exception is 404 (Not Found).

    Attributes:
        status_code (int): HTTP status code for the exception. Defaults to 404 (Not Found).
    """

    status_code = status.HTTP_404_NOT_FOUND

    def __init__(self, error_message="Requested resource could not be found"):
        """
        Initialize NotFound exception with an error message.

        Args:
            error_message (str, optional): The error message to be logged and passed to the parent class's __init__ method. Defaults to "Requested resource could not be found".
        """
        logger.info(f"[ SHARED-EXCEPTION ] NotFound exception: {error_message}")
        super().__init__(error_message)


class MethodNotAllowed(APIException):
    """
    Exception raised for HTTP methods not allowed on a requested resource.

    This exception is raised when a client attempts to use an HTTP method that is not permitted for the requested resource.
    The HTTP status code for this exception is 405 (Method Not Allowed).

    Attributes:
        status_code (int): HTTP status code for the exception. Defaults to 405 (Method Not Allowed).
    """

    status_code = status.HTTP_405_METHOD_NOT_ALLOWED

    def __init__(self, error_message="Method not allowed for the requested resource"):
        """
        Initialize MethodNotAllowed exception with an error message.

        Args:
            error_message (str, optional): The error message to be logged and passed to the parent class's __init__ method. Defaults to "Method not allowed for the requested resource".
        """
        logger.info(f"[ SHARED-EXCEPTION ] MethodNotAllowed exception: {error_message}")
        super().__init__(error_message)


class Conflict(APIException):
    """
    Exception raised when a request conflicts with the current state of the resource.

    This exception is raised when a request cannot be completed due to a conflict with the current state of the target resource.
    The HTTP status code for this exception is 409 (Conflict).

    Attributes:
        status_code (int): HTTP status code for the exception. Defaults to 409 (Conflict).
    """

    status_code = status.HTTP_409_CONFLICT

    def __init__(
        self,
        error_message="A conflict occurred with the current state of the resource",
    ):
        """
        Initialize Conflict exception with an error message.

        Args:
            error_message (str, optional): The error message to be logged and passed to the parent class's __init__ method. Defaults to "A conflict occurred with the current state of the resource".
        """
        logger.info(f"[ SHARED-EXCEPTION ] Conflict exception: {error_message}")
        super().__init__(error_message)


class InternalServerError(APIException):
    """
    Exception raised for unexpected server errors.

    This exception is raised when an unexpected error occurs on the server.
    The HTTP status code for this exception is 500 (Internal Server Error).

    Attributes:
        status_code (int): HTTP status code for the exception. Defaults to 500 (Internal Server Error).
    """

    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    def __init__(self, error_message="An unexpected server error occurred"):
        """
        Initialize InternalServerError exception with an error message.

        Args:
            error_message (str, optional): The error message to be logged and passed to the parent class's __init__ method. Defaults to "An unexpected server error occurred".
        """
        logger.info(f"[ SHARED-EXCEPTION ] Server error: {error_message}")
        super().__init__(error_message)


class ServiceUnavailable(APIException):
    """
    Exception raised when the service is unavailable.

    This exception is raised when the service is temporarily unable to handle the request.
    The HTTP status code for this exception is 503 (Service Unavailable).

    Attributes:
        status_code (int): HTTP status code for the exception. Defaults to 503 (Service Unavailable).
    """

    status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    def __init__(self, error_message="Service is currently unavailable"):
        """
        Initialize ServiceUnavailable exception with an error message.

        Args:
            error_message (str, optional): The error message to be logged and passed to the parent class's __init__ method. Defaults to "Service is currently unavailable".
        """
        logger.info(
            f"[ SHARED-EXCEPTION ] ServiceUnavailable exception: {error_message}"
        )
        super().__init__(error_message)


__all__ = [
    "custom_exception_handler",
    "BadRequest",
    "Conflict",
    "Forbidden",
    "InputValidationError",
    "InternalServerError",
    "MethodNotAllowed",
    "NotFound",
    "ServiceUnavailable",
    "TooManyRequests",
    "Unauthorized",
]
