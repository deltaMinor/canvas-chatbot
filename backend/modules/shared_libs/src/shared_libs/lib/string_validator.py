import logging
import re

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class StringValidator:
    @classmethod
    @raise_exception(
        "Failed to validate string",
        exception_logger=logger,
    )
    def validate(
        cls,
        input_string: str,
        no_symbol=False,
        no_uppercase=False,
        no_lowercase=False,
        no_number=False,
    ) -> bool:
        """Validates the input string based on the provided criteria.

        This method validates the input string to ensure it meets the specified
        criteria. It raises an exception if the validation fails.

        Args:
            input_string (str): The string to be validated.
            no_symbol (bool, optional): If set to True, the string should not
            contain any symbols except underscores. Defaults to False.
            no_uppercase (bool, optional): If set to True, the string should
            not contain any uppercase letters. Defaults to False.
            no_lowercase (bool, optional): If set to True, the string should
            not contain any lowercase letters. Defaults to False.
            no_number (bool, optional): If set to True, the string should not
            contain any numbers. Defaults to False.

        Returns:
            bool: True if the string meets the criteria, False otherwise.

        Raises:
            Exception: If the validation fails.
        """
        # Define the base pattern for allowed characters
        pattern = r"^[a-zA-Z0-9_]+$"

        # Modify the pattern based on the criteria
        if no_symbol:
            pattern = r"^[a-zA-Z0-9_]+$"
        if no_uppercase:
            pattern = pattern.replace("A-Z", "")
        if no_lowercase:
            pattern = pattern.replace("a-z", "")
        if no_number:
            pattern = pattern.replace("0-9", "")

        # Compile the pattern
        compiled_pattern = re.compile(pattern)

        # Validate the input string
        return bool(compiled_pattern.match(input_string))
