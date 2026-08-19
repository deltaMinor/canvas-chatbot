import json
import logging
from functools import cached_property

import boto3
from aws_secretsmanager_caching import SecretCache, SecretCacheConfig
from botocore.exceptions import ClientError, NoCredentialsError

from shared_libs.decorators import raise_exception
from shared_libs.lib.url_resolver_util.url_constructor import UrlConstructor

logger = logging.getLogger(__name__)


class AWSUrlResolver:
    """
    AWS Secrets Manager URL resolver for constructing authenticated URLs.

    This class retrieves credentials from AWS Secrets Manager and constructs
    authenticated URLs using the UrlConstructor class. It provides caching
    and error handling for robust credential management.

    Attributes:
        env_name (str): Environment name for logging and identification
        aws_region (str): AWS region where the secret is stored
        base_url (str): Base URL to construct the authenticated URL from
        secret_name (str): Name of the secret in AWS Secrets Manager
        default_dict (dict): Default credentials to use if secret retrieval fails
        raise_on_error (bool): Whether to raise exceptions on secret retrieval failure
    """

    def __init__(
        self,
        env_name: str,
        aws_region: str,
        base_url: str,
        secret_name: str,
        default_dict: dict = None,
        raise_on_error: bool = False,
    ):
        """
        Initialize the AWS URL resolver.

        Args:
            env_name (str): Environment name for logging and identification
            aws_region (str): AWS region where the secret is stored
            base_url (str): Base URL to construct the authenticated URL from
            secret_name (str): Name of the secret in AWS Secrets Manager
            default_dict (dict, optional): Default credentials to use if secret retrieval fails.
                Defaults to empty dict.
            raise_on_error (bool, optional): Whether to raise exceptions on secret retrieval failure.
                Defaults to False.
        """
        self.env_name = env_name or ""
        self.aws_region = aws_region or ""
        self.base_url = base_url or ""
        self.secret_name = secret_name or ""
        self.default_dict = default_dict or {}
        self.raise_on_error = raise_on_error

    @cached_property
    def url_username(self):
        """
        Get the username from the secret dictionary.

        Returns:
            str: Username from the secret, or None if not found
        """
        return self.secret_dict.get("username")

    @cached_property
    def url_password(self):
        """
        Get the password from the secret dictionary.

        Returns:
            str: Password from the secret, or None if not found
        """
        return self.secret_dict.get("password")

    @cached_property
    def secret_dict(self):
        """
        Get the secret dictionary from AWS Secrets Manager.

        Returns:
            dict: Secret dictionary containing credentials, or default_dict if retrieval fails
        """
        return self.get_secret()

    @cached_property
    def resolved_url(self):
        """
        Get the resolved URL with authentication credentials.

        Constructs an authenticated URL using the base URL and credentials
        retrieved from AWS Secrets Manager.

        Returns:
            str: Authenticated URL with embedded credentials
        """
        return UrlConstructor.get_url_with_auth(
            base_url=self.base_url,
            username=self.url_username,
            password=self.url_password,
        )

    @raise_exception(
        "Failed to retrieve secret from aws secretmanager.",
        exception_logger=logger,
    )
    def get_secret(self):
        """
        Retrieve secret from AWS Secrets Manager.

        This method creates a Secrets Manager client, configures caching,
        and retrieves the secret value. It handles various error conditions
        and provides fallback to default credentials.

        Returns:
            dict: Secret dictionary containing credentials, or default_dict if retrieval fails

        Raises:
            NoCredentialsError: When AWS credentials are not found and raise_on_error is True
            ClientError: When AWS client error occurs and raise_on_error is True
            Exception: When unknown error occurs and raise_on_error is True

        Note:
            If raise_on_error is False, the method will log warnings and return
            default_dict instead of raising exceptions.
        """
        try:
            # Create a Secrets Manager client
            session = boto3.session.Session()
            client = session.client(
                service_name="secretsmanager",
                region_name=self.aws_region,
            )

            # Create a cache for the secret
            cache_config = SecretCacheConfig()
            cache = SecretCache(config=cache_config, client=client)
            # Retrieve the secret value
            secret_str = cache.get_secret_string(self.secret_name)
            # Attempt to parse the secret as JSON
            try:
                return json.loads(secret_str)
            except json.JSONDecodeError:
                logger.warning("Secret is not in JSON format, returning as plain text.")
                return secret_str

        except NoCredentialsError as e:
            logger.warning(f"Credentials not found. Using default credentials. >> {e}")
            if self.raise_on_error:
                raise
            return self.default_dict
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            error_message = e.response["Error"]["Message"]
            logger.warning(
                f"ClientError: {error_code} - {error_message}. Using default credentials. >> {e}"
            )
            if self.raise_on_error:
                raise
            return self.default_dict
        except Exception as e:
            logger.warning(
                f"Unknown error occurred while retrieving secret. Using default credentials. >> {e}"
            )
            if self.raise_on_error:
                raise
            return self.default_dict
