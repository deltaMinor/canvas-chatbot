import base64
import logging

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class EncryptionService:
    def __init__(self):
        pass

    @raise_exception(
        "Failed to derive new key.",
        exception_logger=logger,
    )
    def derive_key(
        self,
        keybytes: bytes,
        **kwargs,
    ) -> bytes:
        """
        Derive a new key from the given key bytes using PBKDF2-HMAC.

        This method uses the PBKDF2-HMAC key derivation function to derive a new key
        from the provided key bytes. The specific parameters for the key derivation
        function (such as salt, iterations, and length) should be passed as keyword arguments.

        Args:
            keybytes (bytes): The input key bytes from which to derive the new key.
            **kwargs: Additional keyword arguments for the PBKDF2HMAC function, such as:
                - salt (bytes): The salt to use in the key derivation.
                - iterations (int): The number of iterations to perform.
                - length (int): The desired length of the derived key.

        Returns:
            bytes: The derived key.

        Raises:
            Exception: If there is an error during the key derivation process.
        """
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            **kwargs,
        )
        return kdf.derive(keybytes)

    @raise_exception(
        "Failed to retrieve salted keystring.",
        exception_logger=logger,
    )
    def get_salted_keystring(
        self,
        keystring: str,
        **kwargs,
    ) -> str:
        """
        Generate a salted keystring using PBKDF2-HMAC.

        This method derives a key from the provided keystring using the PBKDF2-HMAC
        key derivation function. The derived key is then encoded in base64 format.

        Args:
            keystring (str): The input keystring to be salted and derived.
            **kwargs: Additional keyword arguments for the PBKDF2HMAC function, such as:
                - salt (bytes): The salt to use in the key derivation.
                - iterations (int): The number of iterations to perform.
                - length (int): The desired length of the derived key.

        Returns:
            str: The base64-encoded salted keystring.

        Raises:
            Exception: If there is an error during the key derivation process.
        """
        bytestring = self.derive_key(
            keybytes=keystring.encode("utf-8"),
            **kwargs,
        )
        bytestring_base64 = base64.urlsafe_b64encode(bytestring)
        return bytestring_base64.strip().decode()

    @raise_exception(
        "Failed to retrieve hashed keystring.",
        exception_logger=logger,
    )
    def get_hashed_keystring(
        self,
        keystring: str,
        scheme: str,
        salt_decoded: str,
        **kwargs,
    ) -> str:
        """
        Generate a hashed keystring using the specified scheme and salt.

        This method first derives a salted keystring from the provided keystring using
        the PBKDF2-HMAC key derivation function. It then formats the hashed keystring
        with the specified scheme, iterations, salt, and the derived keystring.

        Args:
            keystring (str): The input keystring to be hashed.
            scheme (str): The hashing scheme to be used (e.g., PBKDF2-HMAC).
            salt_decoded (str): The base64-decoded salt to be used in the key derivation.
            **kwargs: Additional keyword arguments for the PBKDF2HMAC function, such as:
                - iterations (int): The number of iterations to perform.
                - length (int): The desired length of the derived key.

        Returns:
            str: The formatted hashed keystring.

        Raises:
            Exception: If there is an error during the key derivation or formatting process.
        """
        salted_str = self.get_salted_keystring(
            keystring=keystring,
            **kwargs,
        )
        hashed_str = "{}${}${}${}".format(
            scheme,
            kwargs.get("iterations"),
            salt_decoded,
            salted_str,
        )
        return hashed_str
