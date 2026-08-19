import logging

logger = logging.getLogger(__name__)


class AttributeValueError(Exception):
    """
    Custom exception raised when the value of an attribute is invalid.
    """

    def __init__(self, key="unknown"):
        """
        Initializes the AttributeValueError exception.

        Args:
            key (str, optional): The key of the attribute that has an invalid value. Defaults to "unknown".
        """
        message = f"The value for the attribute '{key}' is invalid."
        logger.info(f"[ SHARED-EXCEPTION ] AttributeValueError: {message}")
        super().__init__(message)


class DictionaryKeyError(Exception):
    """
    Custom exception raised when a required key is missing from a dictionary.
    """

    def __init__(self, key="unknown"):
        """
        Initialize DictionaryKeyError with a specific key.

        Args:
            key (str, optional): The key that is missing from the dictionary. Defaults to "unknown".
        """
        message = f"The required key '{key}' is missing from the dictionary."
        logger.info(f"[ SHARED-EXCEPTION ] DictionaryKeyError: {message}")
        super().__init__(message)


class DictionaryValueError(Exception):
    """
    Custom exception raised when the value for a specific dictionary key is invalid.
    """

    def __init__(self, key="unknown"):
        """
        Initialize DictionaryValueError with a specific key.

        Args:
            key (str, optional): The key in the dictionary that has an invalid value. Defaults to "unknown".
        """
        message = f"The value for the dictionary key '{key}' is not valid."
        logger.info(f"[ SHARED-EXCEPTION ] DictionaryValueError: {message}")
        super().__init__(message)


class HeaderKeyError(Exception):
    """
    Custom exception raised when a required key is missing from the header.
    """

    def __init__(self, key="unknown"):
        """
        Initialize HeaderKeyError with a specific key.

        Args:
            key (str, optional): The key that is missing from the header. Defaults to "unknown".
        """
        message = f"The required key '{key}' is missing from header."
        logger.info(f"[ SHARED-EXCEPTION ] HeaderKeyError: {message}")
        super().__init__(message)


class HeaderValueError(Exception):
    """
    Custom exception raised when the value for a header key is either None, empty, incorrectly formatted, or of the wrong type.
    """

    def __init__(self, key="unknown"):
        """
        Initialize HeaderValueError with a specific key.

        Args:
            key (str, optional): The key in the header that has an invalid value. Defaults to "unknown".
        """
        message = f"The value for header key '{key}' is invalid."
        logger.info(f"[ SHARED-EXCEPTION ] HeaderValueError: {message}")
        super().__init__(message)


class SnapshotIntegrityError(Exception):
    """Raised when a required field is missing from an assessment snapshot document.

    Use this instead of BadRequest so Celery failure classifiers can surface a
    meaningful status and retry logic can distinguish a non-self-healing condition.
    """

    def __init__(self, field: str, snapshot_id: str = ""):
        message = (
            f"Assessment snapshot is missing required field '{field}'"
            + (f" (snapshot_id={snapshot_id})" if snapshot_id else "")
            + "."
        )
        logger.error("[ SHARED-EXCEPTION ] SnapshotIntegrityError: %s", message)
        super().__init__(message)


__all__ = [
    "AttributeValueError",
    "DictionaryKeyError",
    "DictionaryValueError",
    "HeaderKeyError",
    "HeaderValueError",
    "SnapshotIntegrityError",
]
