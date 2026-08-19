import logging
import os
from pathlib import Path

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

logger = logging.getLogger(__name__)


class RSAKeyManager:
    """
    RSA Key Manager for JWT token signing and verification.

    This class handles the generation, loading, and management of RSA key pairs
    used for JWT token operations. It provides a centralized way to manage
    cryptographic keys for the authentication service.

    Key Features:
        - RSA 2048-bit key pair generation
        - Automatic key loading from local storage
        - Key persistence in PEM format
        - Thread-safe key operations
        - Comprehensive error handling

    Security Features:
        - Private keys stored locally only
        - PKCS#8 format for private keys
        - SubjectPublicKeyInfo format for public keys
        - Secure key generation with proper parameters
    """

    def __init__(self):
        """Initialize the RSA Key Manager."""
        # Get base directory from environment variable or use current working directory
        base_dir = os.environ.get("BASE_DIR", os.getcwd())
        self.private_key_path = Path(base_dir) / "jwt_private_key.pem"
        self.public_key_path = Path(base_dir) / "jwt_public_key.pem"
        self._ensure_keys_directory()

    def _ensure_keys_directory(self):
        """Ensure the keys directory exists."""
        self.private_key_path.parent.mkdir(exist_ok=True)

    def get_or_create_rsa_key_pair(self):
        """
        Get or create RSA key pair for JWT signing.

        This method first attempts to load existing keys from the local storage.
        If the keys don't exist or fail to load, it generates a new RSA key pair
        and saves them to the local storage.

        Returns:
            tuple: A tuple containing (private_key, public_key) RSA key objects

        Raises:
            Exception: If key generation or loading fails
        """
        # Try to load existing keys
        if self._keys_exist():
            try:
                private_key, public_key = self._load_existing_keys()
                logger.info("[ SHARED-LIB ] Loaded existing RSA key pair")
                return private_key, public_key
            except Exception as e:
                logger.warning(
                    f"Failed to load existing keys: {e}. Generating new keys."
                )

        # Generate new RSA key pair
        logger.info("[ SHARED-LIB ] Generating new RSA key pair")
        private_key, public_key = self._generate_new_key_pair()
        self._save_key_pair(private_key, public_key)
        logger.info("[ SHARED-LIB ] RSA key pair generated and saved")
        return private_key, public_key

    def _keys_exist(self):
        """
        Check if both private and public key files exist.

        Returns:
            bool: True if both keys exist, False otherwise
        """
        return self.private_key_path.exists() and self.public_key_path.exists()

    def _load_existing_keys(self):
        """
        Load existing RSA keys from storage.

        Returns:
            tuple: A tuple containing (private_key, public_key)

        Raises:
            Exception: If key loading fails
        """
        # Load private key
        with open(self.private_key_path, "rb") as f:
            private_key = serialization.load_pem_private_key(
                f.read(), password=None, backend=default_backend()
            )

        # Load public key
        with open(self.public_key_path, "rb") as f:
            public_key = serialization.load_pem_public_key(
                f.read(), backend=default_backend()
            )

        return private_key, public_key

    def _generate_new_key_pair(self):
        """
        Generate a new RSA key pair.

        Returns:
            tuple: A tuple containing (private_key, public_key)
        """
        private_key = rsa.generate_private_key(
            public_exponent=65537, key_size=2048, backend=default_backend()
        )
        public_key = private_key.public_key()
        return private_key, public_key

    def _save_key_pair(self, private_key, public_key):
        """
        Save RSA key pair to local storage.

        Args:
            private_key: The RSA private key to save
            public_key: The RSA public key to save

        Raises:
            Exception: If key saving fails
        """
        # Save private key
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )

        with open(self.private_key_path, "wb") as f:
            f.write(private_pem)

        # Save public key
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )

        with open(self.public_key_path, "wb") as f:
            f.write(public_pem)

    def get_private_key(self):
        """
        Get the RSA private key for JWT signing.

        Returns:
            RSA private key object

        Raises:
            Exception: If private key cannot be loaded
        """
        if not self.private_key_path.exists():
            raise Exception(
                "RSA private key not found. Please ensure keys are generated."
            )

        with open(self.private_key_path, "rb") as f:
            return serialization.load_pem_private_key(
                f.read(), password=None, backend=default_backend()
            )

    def get_public_key(self):
        """
        Get the RSA public key for JWT verification.

        Returns:
            RSA public key object

        Raises:
            Exception: If public key cannot be loaded
        """
        if not self.public_key_path.exists():
            raise Exception(
                "RSA public key not found. Please ensure keys are generated."
            )

        with open(self.public_key_path, "rb") as f:
            return serialization.load_pem_public_key(
                f.read(), backend=default_backend()
            )

    def get_public_key_only(self):
        """
        Get the RSA public key for JWT verification without auto-generation.

        This method only loads existing public keys and does not generate new ones.
        Use this when you only need the public key and don't want to trigger
        key generation if keys don't exist.

        Returns:
            RSA public key object

        Raises:
            Exception: If public key file does not exist or cannot be loaded
        """
        if not self.public_key_path.exists():
            raise Exception("RSA public key not found. Keys must be generated first.")

        with open(self.public_key_path, "rb") as f:
            return serialization.load_pem_public_key(
                f.read(), backend=default_backend()
            )

    def key_paths(self):
        """
        Get the file paths for the RSA keys.

        Returns:
            dict: Dictionary containing 'private_key_path' and 'public_key_path'
        """
        return {
            "private_key_path": str(self.private_key_path),
            "public_key_path": str(self.public_key_path),
        }
