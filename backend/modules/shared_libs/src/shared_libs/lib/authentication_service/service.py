"""
JWT-based authentication service using RS256 algorithm with JWKS integration.

This module provides complete authentication workflow including token generation,
verification, user session management, and credential validation with centralized
key management through JWKS (JSON Web Key Set).
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import TYPE_CHECKING

import jwt
import redis
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from rest_framework.request import Request

from shared_libs.constants import jwks
from shared_libs.constants.jwt import (
    ACCESS_TTL,
    JWT_ALGO,
    JWT_AUD,
    JWT_ISS,
    JWT_TOKEN_TYPE,
    REFRESH_TTL,
    REFRESH_TTL_LONG,
)
from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import InternalServerError, Unauthorized
from shared_libs.lib.encryption_services.data_encryption_service import (
    DataEncryptionService,
)
from shared_libs.lib.encryption_services.password_encryption_service import (
    PasswordEncryptionService,
)
from shared_libs.lib.rsa_key_manager import RSAKeyManager
from shared_libs.lib_config import TZINFO
from shared_libs.models.base_models import JwtDictModel
from shared_libs.models.database_models import UserModel
from shared_libs.types.enum import User, UserStatus

if TYPE_CHECKING:
    from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicKey

logger = logging.getLogger(__name__)


class AuthenticationService:
    """
    JWT-based authentication service using RS256 algorithm with JWKS integration.

    Provides complete authentication workflow including token generation, verification,
    user session management, and credential validation with centralized key management
    through JWKS (JSON Web Key Set) stored in Redis.

    Key Features:
        - JWT token generation and verification using RS256 algorithm
        - JWKS-based public key management for token verification
        - User credential validation and session management
        - Token pair generation (access and refresh tokens)
        - Secret key generation for data encryption
        - Comprehensive error handling and logging

    Security Features:
        - RS256 asymmetric encryption for token signing
        - JWKS-based key rotation and management
        - Session-based token validation
        - Password verification using secure hashing
        - User account status validation

    Attributes:
        redis_client (redis.Redis): Redis client for JWKS data retrieval
    """

    def __init__(
        self,
        redis_client: "redis.Redis",
    ):
        """
        Initialize the AuthenticationService instance.

        Sets up the authentication service with Redis client for JWKS data retrieval.
        The Redis client is used to fetch public keys for JWT token verification.

        Args:
            redis_client (redis.Redis): Redis client instance for JWKS data access
        """
        self.redis_client = redis_client

    @raise_exception(
        "Failed to get RSA public key from JWKS.",
        exception_logger=logger,
    )
    def get_rsa_public_key_from_jwks(self) -> "RSAPublicKey":
        """
        Retrieve RSA public key from JWKS data stored in Redis.

        This method fetches JWKS data from Redis cache and reconstructs the RSA public
        key from the JWKS components (n and e). It is the primary method for obtaining
        public keys for JWT verification, replacing the need for local key file access.

        Returns:
            RSAPublicKey: The RSA public key reconstructed from JWKS data

        Raises:
            InternalServerError: If JWKS data is not found, no keys exist in JWKS,
                               missing RSA components, or key reconstruction fails

        Process:
            1. Retrieve JWKS data from Redis using JWKS_REDIS_KEY
            2. Parse JSON data and extract keys array
            3. Get first key and extract RSA components (n, e)
            4. Decode base64URL encoded components
            5. Convert bytes to integers and create RSAPublicNumbers
            6. Reconstruct RSA public key using cryptography library
        """

        # Get JWKS data from Redis
        jwks_data = self.redis_client.get(jwks.JWKS_REDIS_KEY)
        if not jwks_data:
            raise InternalServerError("JWKS data not found in Redis cache")

        import json

        jwks_dict = json.loads(jwks_data)

        # Extract the first key from JWKS
        keys = jwks_dict.get("jwks", {}).get("keys", [])
        if not keys:
            raise InternalServerError("No keys found in JWKS data")

        key_data = keys[0]  # Use the first key

        # Extract RSA components
        n_b64 = key_data.get("n")
        e_b64 = key_data.get("e")

        if not n_b64 or not e_b64:
            raise InternalServerError("Missing RSA components in JWKS key")

        # Decode base64URL encoded components
        import base64

        n_bytes = base64.urlsafe_b64decode(n_b64 + "==")  # Add padding
        e_bytes = base64.urlsafe_b64decode(e_b64 + "==")  # Add padding

        # Convert bytes to integers
        n = int.from_bytes(n_bytes, "big")
        e = int.from_bytes(e_bytes, "big")

        # Create RSA public numbers
        public_numbers = rsa.RSAPublicNumbers(e, n)

        # Reconstruct RSA public key
        public_key = public_numbers.public_key(backend=default_backend())

        logger.info(
            "[ AUTH-SERVICE ] RSA public key successfully reconstructed from JWKS data"
        )
        return public_key

    @raise_exception(
        "Failed to decode the JWT token.",
        exception_logger=logger,
    )
    def get_decoded_token_model(
        self,
        encoded_token: str,
    ) -> "JwtDictModel":
        """
        Decode and verify a JWT token using RS256 algorithm with JWKS.

        This method retrieves the RSA public key from JWKS data stored in Redis
        and uses it to verify the JWT token signature. It does not fall back to
        local key files and relies entirely on JWKS for key management.

        Args:
            encoded_token (str): The JWT token string, optionally prefixed with "Bearer "

        Returns:
            JwtDictModel: The decoded and validated token model containing user information

        Raises:
            Unauthorized: If the token is invalid, expired, signature verification fails,
                         or JWKS data is not available

        Verification Process:
            1. Remove "Bearer " prefix if present
            2. Retrieve RSA public key from JWKS
            3. Decode JWT using PyJWT with RS256 algorithm
            4. Verify signature, issuer, and required claims
            5. Return validated token model
        """
        encoded_token = encoded_token.replace(f"{JWT_TOKEN_TYPE} ", "")

        # Get RSA public key from JWKS only
        public_key = self.get_rsa_public_key_from_jwks()
        logger.info(
            "[ AUTH-SERVICE ] Using RSA public key from JWKS for token verification"
        )

        decoded_token = jwt.decode(
            jwt=encoded_token,
            key=public_key,
            algorithms=[JWT_ALGO],
            issuer=JWT_ISS,
            require=["exp", "iat", "iss", "jti"],
            options={"verify_signature": True, "verify_iss": True},
        )

        return JwtDictModel(**decoded_token)

    @raise_exception(
        "Failed to verify token.",
        default_exception=Unauthorized,
        exception_logger=logger,
    )
    def verify_token(
        self,
        encoded_token: str,
        ref_token: str,
    ) -> None:
        """
        Verify the provided token against the reference token.

        Performs a simple string comparison between the provided token and a
        reference token to ensure they match. This is used for additional
        token validation in specific authentication flows.

        Args:
            encoded_token (str): The encoded token to be verified
            ref_token (str): The reference token to compare against

        Raises:
            Unauthorized: If the provided token does not match the reference token

        Note:
            This method performs exact string matching and does not decode
            or verify the JWT structure. Use get_decoded_token_model for
            full JWT verification.
        """
        if encoded_token != ref_token:
            raise Unauthorized("Token mismatch.")
        return

    @raise_exception(
        "Failed to generate new JWT token.",
        exception_logger=logger,
    )
    def mint_token(
        self,
        user_model: UserModel,
        session_id: str,
        jwt_type: str,
        remember_me: bool = False,
        JWT_TTL: "timedelta" = timedelta(hours=1),
    ) -> tuple[str, int]:
        """
        Generate a new JWT token for a user session.

        Creates a JWT token with user information, session details, and appropriate
        expiration time. Uses RS256 algorithm with RSA private key for signing.

        Args:
            user_model (UserModel): The user model containing user information
            session_id (str): The session ID for the user
            jwt_type (str): Type of token (e.g., "access", "refresh")
            JWT_TTL (timedelta, optional): Token time-to-live. Defaults to 1 hour.

        Returns:
            tuple[str, int]: Tuple containing (encoded_token, expiration_timestamp)

        Token Payload:
            - user_id: User identifier
            - username: User's username
            - is_temp_password: Temporary password flag
            - aud: Audience claim
            - iat: Issued at timestamp
            - nbf: Not before timestamp
            - exp: Expiration timestamp
            - sub: Subject (user_id)
            - iss: Issuer
            - jti: JWT ID (unique identifier)
            - type: Token type
            - sid: Session ID
        """
        rsa_key_manager = RSAKeyManager()

        now = datetime.now(TZINFO)
        iat = int(now.timestamp())
        exp = int((now + JWT_TTL).timestamp())
        payload_model = JwtDictModel(
            user_id=user_model.user_id,
            username=user_model.username,
            is_temp_password=user_model.is_temp_password,
            remember_me=remember_me,
            aud=JWT_AUD,
            iat=iat,
            nbf=iat,
            exp=exp,
            sub=user_model.user_id,
            iss=JWT_ISS,
            jti=uuid.uuid4().hex,
            type=jwt_type,
            sid=session_id,
        )

        # Get RSA private key for signing
        private_key = rsa_key_manager.get_private_key()

        encoded_token = jwt.encode(
            payload=payload_model.model_dump(),
            key=private_key,
            algorithm=JWT_ALGO,
        )
        return encoded_token, exp

    @raise_exception(
        "Failed to generate token pair.",
        exception_logger=logger,
    )
    def mint_token_pair(
        self,
        user_model: UserModel,
        session_id: str,
        remember_me: bool = False,
    ) -> dict:
        """
        Generate both access and refresh tokens for a user session.

        Creates a complete token pair consisting of an access token and a refresh token
        with appropriate TTL values. The access token has a shorter lifespan for
        security, while the refresh token has a longer lifespan for session renewal.

        Args:
            user_model (UserModel): The user model containing user information
            session_id (str): The session ID for the user

        Returns:
            dict: Dictionary containing:
                - access_token (str): Short-lived access token
                - refresh_token (str): Long-lived refresh token
                - token_type (str): Token type (Bearer)
                - expires_in (int): Access token expiration timestamp

        Token Lifespans:
            - Access token: Short duration (defined by ACCESS_TTL)
            - Refresh token: Long duration (defined by REFRESH_TTL)
        """
        # Generate access token
        access_token, access_exp = self.mint_token(
            user_model=user_model,
            session_id=session_id,
            jwt_type="access",
            remember_me=remember_me,
            JWT_TTL=ACCESS_TTL,
        )

        # Generate refresh token
        refresh_token, refresh_exp = self.mint_token(
            user_model=user_model,
            session_id=session_id,
            jwt_type="refresh",
            remember_me=remember_me,
            JWT_TTL=REFRESH_TTL_LONG if remember_me else REFRESH_TTL,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": JWT_TOKEN_TYPE,
            "expires_in": access_exp,
        }

    @raise_exception(
        "Failed to generate new secret key.",
        exception_logger=logger,
    )
    def get_new_secretkey(
        self,
        sessionid: str,
    ) -> tuple[str, str]:
        """
        Generate a new secret key for data encryption.

        Creates a hashed secret key using the session ID as input. The secret key
        is used for encrypting sensitive data in the application. Returns both
        the plain secret key and the hashed version.

        Args:
            sessionid (str): The session ID to use as input for key generation

        Returns:
            tuple[str, str]: Tuple containing (plain_secretkey, hashed_secretkey)

        Process:
            1. Use DataEncryptionService to generate hashed secret key
            2. Extract plain secret key from hash (part after third '$')
            3. Return both plain and hashed versions
        """
        data_encryption_service = DataEncryptionService()
        secretkeyhash = data_encryption_service.get_hashed_secret_key(
            sessionid=sessionid,
        )
        secretkey = secretkeyhash.split("$")[3]

        return secretkey, secretkeyhash

    @raise_exception(
        "Failed to verify login user credentials.",
        exception_logger=logger,
    )
    def verify_login_user_model(
        self,
        user_model: UserModel,
        password: str,
    ) -> None:
        """
        Verify user login credentials and account status.

        Validates the provided password against the stored password hash and
        checks the user account status to ensure it's active. This method
        performs comprehensive credential validation for login attempts.

        Args:
            user_model (UserModel): The user model containing stored credentials
            password (str): The plain text password provided by the user

        Raises:
            Unauthorized: If password doesn't match or user account is inactive

        Validation Process:
            1. Verify password using PasswordEncryptionService
            2. Check user account status (must be active)
            3. Raise Unauthorized if any validation fails
        """
        password_encryption_service = PasswordEncryptionService()
        if not password_encryption_service.verify_password(
            password=password,
            hashed_password=user_model.password,
        ):
            raise Unauthorized("Usermame or Password mismatch")

        if user_model.user_status != UserStatus.active.value:
            raise Unauthorized("User account is not activated.")

        return

    @raise_exception(
        "Failed to initialize login flow.",
        exception_logger=logger,
    )
    def init_login_flow(
        self,
        request: Request,
        user_model: UserModel,
    ) -> dict:
        """
        Initialize the complete login flow for a user.

        Performs the complete authentication process including credential verification,
        session creation, token generation, and secret key creation. This method
        orchestrates the entire login workflow and returns all necessary tokens.

        Args:
            request (Request): The HTTP request object containing password and session data
            user_model (UserModel): The user model containing user information

        Returns:
            dict: Complete token data containing:
                - access_token (str): Short-lived access token
                - refresh_token (str): Long-lived refresh token
                - token_type (str): Token type (Bearer)
                - expires_in (int): Access token expiration timestamp
                - secretkey (str): Plain secret key for data encryption

        Login Flow Process:
            1. Verify user credentials and account status
            2. Save and create session
            3. Generate token pair (access and refresh)
            4. Generate secret key for data encryption
            5. Store session data (sessionid, user_id, tokens, secretkeyhash)
            6. Return complete token data with secretkey
        """
        self.verify_login_user_model(
            user_model=user_model,
            password=request.data[User.password.value],
        )

        request.session.save()
        sessionid: str = request.session.session_key
        remember_me = bool(request.data.get("rememberMe", False))

        # Generate token pair using centralized method
        token_data = self.mint_token_pair(
            user_model=user_model,
            session_id=sessionid,
            remember_me=remember_me,
        )

        request.session["sessionid"] = sessionid
        request.session["user_id"] = user_model.user_id
        request.session["access_token"] = token_data["access_token"]
        request.session["refresh_token"] = token_data["refresh_token"]
        request.session.save()

        return token_data
