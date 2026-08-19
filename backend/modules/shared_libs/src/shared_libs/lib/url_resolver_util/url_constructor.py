import logging
import re
from functools import cached_property
from urllib.parse import quote

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class UrlConstructor:
    """
    URL constructor for building authenticated URLs with credential management.

    This class provides functionality to construct URLs with embedded authentication
    credentials, including password sanitization for secure logging.

    Attributes:
        base_url (str): Base URL to construct the authenticated URL from
        require_auth (str): Whether authentication is required ("TRUE" or "FALSE")
        username (str): Username for authentication
        password (str): Password for authentication

    Example:
        >>> constructor = UrlConstructor(
        ...     "mongodb://host:27017/db", "TRUE", "user", "pass"
        ... )
        >>> constructor.resolved_url
        "mongodb://user:pass@host:27017/db"
    """

    def __init__(
        self,
        base_url: str,
        require_auth: str = "FALSE",
        username: str = "",
        password: str = "",
    ):
        """
        Initialize the URL constructor.

        Args:
            base_url (str): Base URL to construct the authenticated URL from
            require_auth (str, optional): Whether authentication is required ("TRUE" or "FALSE").
                Defaults to "FALSE".
            username (str, optional): Username for authentication. Defaults to empty string.
            password (str, optional): Password for authentication. Defaults to empty string.

        Note:
            When require_auth is "TRUE", the username and password will be embedded
            in the resolved URL for authentication purposes.
        """
        logger.info("[ SHARED-LIB ] Initializing UrlConstructor for URL construction.")
        logger.info(
            f"[ SHARED-LIB ] Configuration: base_url='{base_url}', require_auth='{require_auth}'"
        )
        logger.info(
            f"[ SHARED-LIB ] Credentials: username='{username}', password={'[PROVIDED]' if password else '[NOT_PROVIDED]'}"
        )

        # Validate input parameters
        if not base_url:
            logger.warning(
                "UrlConstructor initialized with empty base_url - this will cause failures"
            )
        if base_url and "://" not in base_url:
            logger.warning(
                f"UrlConstructor initialized with malformed base_url: '{base_url}' - missing scheme separator"
            )

        self.base_url = base_url
        self.require_auth = require_auth
        self.username = username
        self.password = password

    @staticmethod
    def sanitize_url_password(url: str) -> str:
        """
        Sanitize URL by obfuscating password, showing only the first character followed by ***.

        This static method is used to create safe URLs for logging purposes by hiding
        sensitive password information while preserving the structure for debugging.

        Args:
            url (str): URL string that may contain credentials

        Returns:
            str: Sanitized URL with obfuscated password

        Example:
            >>> UrlConstructor.sanitize_url_password(
            ...     "mongodb://user:secret123@host:27017/db"
            ... )
            "mongodb://user:s***@host:27017/db"
        """
        if not url:
            return url

        # Pattern to match username:password@ in URL
        # Matches: protocol://username:password@host:port/path
        pattern = r"(\w+://[^:]+:)([^@]+)(@.+)"

        def replace_password(match):
            username_part = match.group(1)  # protocol://username:
            password = match.group(2)  # password
            rest = match.group(3)  # @host:port/path

            if len(password) > 0:
                # Show first character + *** for password
                obfuscated_password = password[0] + "***"
            else:
                obfuscated_password = "***"

            return f"{username_part}{obfuscated_password}{rest}"

        return re.sub(pattern, replace_password, url)

    @cached_property
    def resolved_url(self) -> str:
        """
        Get the resolved URL with authentication credentials.

        This property constructs the final URL with embedded credentials
        and logs a sanitized version for security. The result is cached
        for performance.

        Returns:
            str: The resolved URL with authentication credentials

        Note:
            The actual URL with credentials is returned, but only a sanitized
            version is logged for security purposes.
        """
        _resolved_url = self.get_resolved_url()
        sanitized_url = self.sanitize_url_password(_resolved_url)
        logger.info(f"[ SHARED-LIB ] resolved_url: {sanitized_url}")
        return _resolved_url

    @raise_exception(
        "Failed to retrieve resolved url.",
        exception_logger=logger,
    )
    def get_resolved_url(self) -> str:
        """
        Get the resolved URL with authentication if required.

        This method checks if authentication is required and constructs
        the appropriate URL with or without credentials based on the
        require_auth setting.

        Returns:
            str: The resolved URL, with authentication if required

        Raises:
            Exception: If URL resolution fails

        Note:
            If require_auth is "TRUE" but no credentials are provided,
            the original base_url is returned with a warning logged.
        """
        resolved_url = f"{self.base_url}"
        if not self.base_url:
            logger.warning(
                f"Base URL validation failed: base_url is empty or None. "
                f"require_auth='{self.require_auth}', username='{self.username}', "
                f"password={'[PROVIDED]' if self.password else '[NOT_PROVIDED]'}"
            )
            return resolved_url

        if str(self.require_auth) != "TRUE":
            logger.info(
                f"[ SHARED-LIB ] Authentication not required: require_auth='{self.require_auth}' "
                f"(expected 'TRUE'). Returning base_url without credentials."
            )
            return resolved_url

        logger.info(
            f"[ SHARED-LIB ] Authentication required: require_auth='{self.require_auth}'. "
            f"Attempting to construct URL with credentials. "
            f"username='{self.username}', password={'[PROVIDED]' if self.password else '[NOT_PROVIDED]'}"
        )
        if not self.username or not self.password:
            logger.warning(
                f"Authentication credentials missing: username='{self.username}', "
                f"password={'[PROVIDED]' if self.password else '[NOT_PROVIDED]'}. "
                f"Returning base_url without embedding blank credentials."
            )
            return resolved_url
        resolved_url = self.get_url_with_auth()

        changes_made = self.base_url != resolved_url
        if not changes_made:
            logger.warning(
                f"URL construction failed: No changes made to base_url. "
                f"Original: '{self.base_url}' -> Resolved: '{resolved_url}'. "
                f"This indicates credential embedding failed. "
                f"Check if username='{self.username}' and password are properly provided. "
                f"Environment variables to check: MQ_USERNAME/MQ_PASSWORD for message queue or "
                f"DB_USERNAME/DB_PASSWORD for database connections."
            )
            return resolved_url

        logger.info(
            f"[ SHARED-LIB ] URL construction successful: Credentials embedded successfully. "
            f"Original: '{self.base_url}' -> Resolved: '{resolved_url[:50]}{'...' if len(resolved_url) > 50 else ''}'"
        )
        return resolved_url

    @raise_exception(
        "Failed to retrieve url with encoded credentials.",
        exception_logger=logger,
    )
    def get_url_with_auth(self) -> str:
        """
        Construct URL with embedded authentication credentials.

        This method takes the base URL and embeds the username and password
        in the URL format: protocol://username:password@host:port/path

        Returns:
            str: URL with embedded authentication credentials

        Raises:
            Exception: If URL construction with credentials fails

        Note:
            If neither username nor password is provided, the original
            base_url is returned with a warning logged.
        """

        try:
            url_scheme = self.base_url.split("://")[0]
            url_authority = self.base_url.split("://")[1]
            encoded_username = quote(self.username or "", safe="")
            encoded_password = quote(self.password or "", safe="")
            constructed_url = (
                f"{url_scheme}://{encoded_username}:{encoded_password}@{url_authority}"
            )

            logger.info(
                f"[ SHARED-LIB ] URL construction successful: Credentials embedded. "
                f"Scheme: '{url_scheme}', Authority: '{url_authority}', "
                f"Username: '{self.username}', Password: {'[PROVIDED]' if self.password else '[NOT_PROVIDED]'}"
            )
            return constructed_url

        except (IndexError, AttributeError) as e:
            logger.error(
                f"URL parsing failed: Unable to split base_url '{self.base_url}'. "
                f"Error: {str(e)}. Expected format: 'scheme://authority'. "
                f"Returning original base_url."
            )
            return self.base_url
