import logging

from cryptography.fernet import Fernet

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class TokenEncryptionService:
    """
    A service class for managing token encryption and decryption.

    This class provides methods for getting an encryption key from a hashed password, encrypting and decrypting strings,
    and encrypting tokens and verifying decrypted tokens.

    Raises:
        Exception: If there is a failure in retrieving the encryption key, encrypting or decrypting the string,
        encrypting the token, or verifying the decrypted token.
    """

    def __init__(self):
        pass

    @raise_exception(
        "Failed to retrieve encryption key from hashed value.",
        exception_logger=logger,
    )
    def get_encryption_key_from_hashed_password(
        self,
        hashed_password: str,
    ) -> str:
        """
        Retrieves the encryption key from a hashed password.

        Args:
            hashed_password (str): The hashed password from which to retrieve the encryption key.

        Returns:
            str: The encryption key.
        """
        split_pwd = hashed_password.split("$")
        return split_pwd[3]

    @raise_exception(
        "Failed to encrypt string.",
        exception_logger=logger,
    )
    def get_encrypted_string(
        self,
        raw_string: str,
        hashed_password: str,
    ) -> str:
        """
        Encrypts a string using a hashed password.

        This method retrieves an encryption key from a hashed password and uses it to encrypt the provided string.

        Args:
            raw_string (str): The string to encrypt.
            hashed_password (str): The hashed password to use for encryption.

        Returns:
            str: The encrypted string.
        """
        encryption_key = self.get_encryption_key_from_hashed_password(
            hashed_password=hashed_password,
        )
        fernet = Fernet(encryption_key.encode("utf-8"))
        return fernet.encrypt(raw_string.encode("utf-8")).decode()

    @raise_exception(
        "Failed to decrypt string.",
        exception_logger=logger,
    )
    def get_decrypted_string(
        self,
        encrypted_string: str,
        hashed_password: str,
    ):
        """
        Decrypts a string using a hashed password.

        This method retrieves an encryption key from a hashed password and uses it to decrypt the provided string.

        Args:
            encrypted_string (str): The string to decrypt.
            hashed_password (str): The hashed password to use for decryption.

        Returns:
            str: The decrypted string.
        """
        encryption_key = self.get_encryption_key_from_hashed_password(
            hashed_password=hashed_password,
        )
        fernet = Fernet(encryption_key.encode("utf-8"))
        return fernet.decrypt(encrypted_string.encode()).decode()
