import base64
import logging
import os

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from shared_libs import lib_config
from shared_libs.decorators import raise_exception

from .encryption_service import EncryptionService

PBKDF2HMAC_ITERATIONS = lib_config.PBKDF2HMAC_ITERATIONS_PWD
PBKDF2HMAC_LENGTH = lib_config.PBKDF2HMAC_LENGTH_PWD
PBKDF2HMAC_SCHEME = lib_config.PBKDF2HMAC_SCHEME_PWD

logger = logging.getLogger(__name__)


class PasswordEncryptionService(EncryptionService):
    """
    A service class for handling password encryption and verification.

    This class provides methods to encrypt a password and verify a password against a hashed password. It uses the PBKDF2HMAC algorithm for password encryption.

    Methods:
        encrypt_password: Encrypts a given password and returns the hashed password.
        verify_password: Verifies a given password against a hashed password and returns True if they match, False otherwise.

    Note:
        This class does not have any attributes and does not need to be instantiated. All its methods are class methods.
    """

    def __init__(self):
        pass

    @raise_exception(
        "Failed to retrieve hashed password.",
        exception_logger=logger,
    )
    def get_hashed_password(
        self,
        password: str,
    ):
        """
        Generate a hashed password using PBKDF2-HMAC scheme.

        This method generates a random salt, encodes it in base64, and then uses it
        to hash the provided password using the PBKDF2-HMAC scheme.

        Args:
            password (str): The plain text password to be hashed.

        Returns:
            str: The hashed password.

        Raises:
            Exception: If there is an error during the hashing process.
        """
        salt = os.urandom(16)
        salt_base64 = base64.urlsafe_b64encode(salt)
        salt_decoded = salt_base64.strip().decode()

        hashed_pwd = self.get_hashed_keystring(
            keystring=password,
            scheme=PBKDF2HMAC_SCHEME,
            salt_decoded=salt_decoded,
            length=PBKDF2HMAC_LENGTH,
            salt=salt,
            iterations=PBKDF2HMAC_ITERATIONS,
        )
        return hashed_pwd

    @classmethod
    @raise_exception(
        "Failed to verify password.",
        exception_logger=logger,
    )
    def verify_password(
        self,
        password: str,
        hashed_password: str,
    ):
        """
        Verifies a given password against a hashed password.

        Args:
            password (str): The password to verify.
            hashed_password (str): The hashed password to verify against.

        Returns:
            bool: True if the password matches the hashed password, False otherwise.

        Raises:
            Exception: If the password verification fails.
        """
        split_pwd = hashed_password.split("$")
        iterations = int(split_pwd[1])

        salt_decoded = split_pwd[2]
        salt = base64.urlsafe_b64decode(salt_decoded.encode())

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=PBKDF2HMAC_LENGTH,
            salt=salt,
            iterations=iterations,
        )
        encoded_pwd = kdf.derive(password.encode("utf-8"))
        pwd_base64 = base64.urlsafe_b64encode(encoded_pwd)  # use this for fernet key
        pwd_decoded = pwd_base64.strip().decode()

        pwd_decoded_from_hash = split_pwd[3]
        if pwd_decoded == pwd_decoded_from_hash:
            return True
        return False
