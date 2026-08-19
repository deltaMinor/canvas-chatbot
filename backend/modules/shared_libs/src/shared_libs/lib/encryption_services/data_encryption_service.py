import json
import logging
import os
from base64 import b64encode, urlsafe_b64encode

from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

from shared_libs import lib_config
from shared_libs.decorators import raise_exception

from .encryption_service import EncryptionService

PBKDF2HMAC_ITERATIONS = lib_config.PBKDF2HMAC_ITERATIONS_DATA
PBKDF2HMAC_LENGTH = lib_config.PBKDF2HMAC_LENGTH_DATA
PBKDF2HMAC_SCHEME = lib_config.PBKDF2HMAC_SCHEME_DATA
PADDING_BLOCK_SIZE = 128

logger = logging.getLogger(__name__)


class DataEncryptionService(EncryptionService):
    def __init__(self):
        pass

    @raise_exception(
        "Failed to retrieve secret key.",
        exception_logger=logger,
    )
    def get_hashed_secret_key(
        self,
        sessionid: str,
    ):
        """
        Generate a hashed secret key using PBKDF2-HMAC scheme.

        This method generates a random salt, encodes it in base64, and then uses it
        to hash the provided session ID using the PBKDF2-HMAC scheme to derive a hashed secret key.

        Args:
            sessionid (str): The session ID to be used for generating the hashed secret key.

        Returns:
            str: The derived hashed secret key.

        Raises:
            Exception: If there is an error during the key derivation process.
        """
        salt = os.urandom(16)
        salt_base64 = urlsafe_b64encode(salt)
        salt_decoded = salt_base64.strip().decode()

        hashed_secretkey = self.get_hashed_keystring(
            keystring=sessionid,
            scheme=PBKDF2HMAC_SCHEME,
            salt_decoded=salt_decoded,
            length=PBKDF2HMAC_LENGTH,
            salt=salt,
            iterations=PBKDF2HMAC_ITERATIONS,
        )
        return hashed_secretkey

    @raise_exception(
        "Failed to adjust key length.",
        exception_logger=logger,
    )
    def _adjust_key_length(
        self,
        secretkey: str,
        length: int,
    ) -> bytes:
        key_bytes = secretkey.encode("utf-8")
        if len(key_bytes) < length:
            key_bytes = key_bytes.ljust(length, b"\0")  # Pad with null bytes
        return key_bytes[:length]  # Truncate to the correct length

    @raise_exception(
        "Failed to encrypt datastring.",
        exception_logger=logger,
    )
    def encrypt(
        self,
        datastring: str,
        secretkeyhash: str,
    ) -> str:
        """
        Encrypt a data string using AES encryption with a provided secret key hash.

        This method extracts the salt and secret key from the provided secret key hash,
        generates a random initialization vector (IV), and uses AES encryption in CBC mode
        to encrypt the provided data string. The encrypted data is padded to ensure it is
        a multiple of the block size.

        Args:
            datastring (str): The data string to be encrypted.
            secretkeyhash (str): The hashed secret key containing the salt and secret key.

        Returns:
            str: The base64-encoded string containing the salt, IV, and ciphertext.

        Raises:
            Exception: If there is an error during the encryption process.
        """

        secretkey = secretkeyhash.split("$")[3]
        salt = os.urandom(16)  # Generate a random salt
        key = self.derive_key(
            secretkey.encode(),
            length=PBKDF2HMAC_LENGTH,
            salt=salt,
            iterations=PBKDF2HMAC_ITERATIONS,
        )
        iv = os.urandom(16)  # Generate a random IV

        cipher = Cipher(
            algorithms.AES(key),
            modes.CBC(iv),
        )
        encryptor = cipher.encryptor()

        # Prepare the data for encryption (must be multiple of block size)
        padder = padding.PKCS7(PADDING_BLOCK_SIZE).padder()
        padded_data = padder.update(json.dumps(datastring).encode()) + padder.finalize()
        # padded_data = json.dumps(datastring).encode()
        # while len(padded_data) % 16 != 0:
        #     padded_data += b" "  # Simple padding (not secure for production)

        ciphertext = encryptor.update(padded_data) + encryptor.finalize()

        # Return the salt, iv, and ciphertext as base64 encoded string
        return b64encode(salt + iv + ciphertext).decode()
