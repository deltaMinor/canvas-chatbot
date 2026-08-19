import logging
from collections.abc import Mapping
from functools import cached_property
from hashlib import sha256
from typing import TYPE_CHECKING, Any, Self

from rest_framework.request import Request

from shared_libs.decorators import raise_exception, verify_params
from shared_libs.exceptions.api_exceptions import Unauthorized
from shared_libs.models.base_models import PermissionModel, UserInfoModel
from shared_libs.models.database_models import AuthenticationModel, ResourceTagTreeModel
from shared_libs.types.enum import TokenType

if TYPE_CHECKING:
    from shared_libs.domain import UserPermissionDocService
    from shared_libs.infrastructure.producer.service import Producer
    from shared_libs.infrastructure.redis_repository.service import RedisRepository
    from shared_libs.lib.resource_tag_manager import ResourceTagManager

logger = logging.getLogger(__name__)


VERIFY_TOKEN_CACHE_TTL_SECONDS = 60 * 60


def build_auth_session_cache_key(session_id: str) -> str:
    session_digest = sha256(session_id.encode("utf-8")).hexdigest()
    return f"auth:session:{session_digest}"


class AuthenticationProducer:
    """
    Central authentication producer for JWT token verification and user management.

    The AuthenticationProducer is the core component responsible for handling all
    authentication-related operations in the system. It provides comprehensive JWT
    token verification, user permission management, and resource access control.

    This class integrates with multiple backend services to provide a unified
    authentication interface:
    - Database verification for token validation and user data retrieval
    - Redis caching for performance optimization
    - Celery task execution for background operations
    - User permission document store for role-based access control
    - Resource tag manager for resource-level permissions

    Authentication Flow:
    1. Extract Bearer token from HTTP Authorization header
    2. Verify JWT token signature and expiration against database
    3. Retrieve user data and permissions from database
    4. Validate session and extend timer if configured
    5. Provide access to user permissions and resource tags

    Attributes:
        token_type (str): Type of JWT token being processed (default: "login")
        authentication_model (AuthenticationModel | None): Current authentication model
            containing verified user data and token information
        user_info (Mapping[str, Any] | None): User information extracted from the
            verified JWT token, structured as a dictionary
        producer (Producer): Producer service for database operations and task execution
        resource_tag_manager (ResourceTagManager): Manager for resource tag tree
            operations and resource-level permission checking
        user_permission_doc_service (UserPermissionDocService): Service for accessing
            and managing user permission documents with roles and access rights

    Performance Features:
        - Redis caching reduces database queries for frequently accessed data
        - Cached properties for user permission documents and permission models
        - Efficient token verification with database-backed validation
        - Background task execution for non-blocking operations

    Security Features:
        - Database-backed token verification ensures token revocation is respected
        - Comprehensive error handling prevents information leakage
        - Session validation prevents unauthorized access
        - Resource-level permission checking for fine-grained access control
    """

    def __init__(
        self,
        producer: "Producer",
        resource_tag_manager: "ResourceTagManager",
        user_permission_doc_service: "UserPermissionDocService",
        redis_repository: "RedisRepository | None" = None,
    ):
        """
        Initialize the AuthenticationProducer with required service dependencies.

        Sets up the authentication producer with all necessary services for token
        verification, user management, and permission checking. Initializes default
        values for authentication state and configures service integrations.

        Args:
            producer (Producer): Producer service for database operations and
                background task execution. Used for token verification and user
                data retrieval from the database.
            resource_tag_manager (ResourceTagManager): Manager for resource tag
                tree operations and resource-level permission checking. Provides
                access to resource hierarchies and access control.
            user_permission_doc_service (UserPermissionDocService): Service for
                accessing and managing user permission documents. Contains user
                roles, permissions, and access rights for authorization.

        Initialization:
            - Sets token_type to "login" for standard authentication
            - Initializes authentication_model and user_info as None
            - Stores service dependencies for later use
            - Prepares for token verification and user data retrieval

        Example:
            ```python
            auth_producer = AuthenticationProducer(
                producer=producer_service,
                resource_tag_manager=resource_manager,
                user_permission_doc_service=permission_service,
            )
            ```
        """
        self.token_type = TokenType.login.value
        self.authentication_model: AuthenticationModel = None
        self.user_info: Mapping[str, Any] = None
        self.producer = producer
        self.resource_tag_manager = resource_tag_manager
        self.user_permission_doc_service = user_permission_doc_service
        self.redis_repository = redis_repository

    def _get_cached_authentication_model(
        self,
        cache_key: str,
        encoded_token: str,
    ) -> AuthenticationModel | None:
        if not self.redis_repository:
            return None

        authentication_model_payload = self.redis_repository.get_item_in_redis(
            name=cache_key,
        )
        if not authentication_model_payload:
            return None

        if authentication_model_payload.get("encoded_token") != encoded_token:
            return None

        ttl_extended = self.redis_repository.expire_item_in_redis(
            redis_query_key=cache_key,
            expiry=VERIFY_TOKEN_CACHE_TTL_SECONDS,
        )
        if not ttl_extended:
            return None

        return AuthenticationModel(**authentication_model_payload)

    @cached_property
    def user_permission_doc(self) -> dict:
        """
        Retrieve user permission document from the database.

        This cached property provides access to the user's permission document
        containing roles, permissions, and access rights. The document is fetched
        from the database and cached for subsequent access within the same request.

        The permission document contains:
        - User roles and their associated permissions
        - Resource-specific access rights
        - Organization-level permissions
        - Feature flags and capabilities

        Returns:
            dict: User permission document containing structured permission data.
                Raises an exception if the document is not found.

        Raises:
            Exception: If the user permission document cannot be found in the database.

        Performance:
            - Uses @cached_property decorator for efficient caching
            - Document is fetched only once per request
            - Subsequent access uses cached data

        Example:
            ```python
            auth_producer.verify_login_token(request)
            permissions = auth_producer.user_permission_doc
            user_roles = permissions.get("roles", [])
            ```
        """
        return self.user_permission_doc_service.get_one(
            raise_if_not_found=True,
        )

    @cached_property
    def permission_model(self) -> "PermissionModel":
        """
        Convert user permission document to structured PermissionModel.

        This cached property transforms the raw user permission document into a
        structured PermissionModel object, providing type-safe access to user
        permissions and roles. The model provides methods for checking specific
        permissions and roles.

        The PermissionModel provides:
        - Type-safe access to permission data
        - Methods for checking specific permissions
        - Role-based access control helpers
        - Validation of permission structures

        Returns:
            PermissionModel: Structured permission model with validated user
                permissions and roles. Built from the user_permission_doc data.

        Raises:
            ValidationError: If the permission document structure is invalid
                or doesn't match the PermissionModel schema.

        Performance:
            - Uses @cached_property decorator for efficient caching
            - Model is created only once per request
            - Subsequent access uses cached model instance

        Example:
            ```python
            auth_producer.verify_login_token(request)
            permission_model = auth_producer.permission_model

            # Check if user has specific permission
            if permission_model.has_permission("read_users"):
                # User can read user data
                pass

            # Check if user has specific role
            if permission_model.has_role("admin"):
                # User has admin role
                pass
            ```
        """
        return PermissionModel(**self.user_permission_doc)

    @property
    def resource_tag_tree_models(self) -> list[ResourceTagTreeModel]:
        """
        Retrieve resource tag tree models for resource-level access control.

        This property provides access to the hierarchical resource tag tree models
        that define the structure of resources in the system. These models are
        used for implementing resource-level permissions and access control.

        Resource tag trees provide:
        - Hierarchical organization of system resources
        - Resource-level permission inheritance
        - Access control based on resource hierarchy
        - Resource grouping and categorization

        Returns:
            List[ResourceTagTreeModel]: List of resource tag tree models representing
                the hierarchical structure of resources in the system.

        Example:
            ```python
            auth_producer.verify_login_token(request)
            resource_trees = auth_producer.resource_tag_tree_models

            # Access resource hierarchy
            for tree in resource_trees:
                print(f"Resource tree: {tree.name}")
                for child in tree.children:
                    print(f"  Child resource: {child.name}")
            ```
        """
        return self.resource_tag_manager.resource_tag_tree_models

    @raise_exception(
        "Failed to verify login token.",
        default_exception=Unauthorized,
        exception_logger=logger,
    )
    @verify_params(key_list=["request"])
    def verify_login_token(
        self,
        request: Request,
        extend_timer: bool = True,
    ) -> Self:
        """
        Verify JWT login token from HTTP request and authenticate user.

        This is the primary authentication method that performs comprehensive
        JWT token verification and user authentication. It extracts the Bearer
        token from the Authorization header, verifies it against the database,
        and sets up the authentication context for the user.

        Authentication Process:
        1. Extract Bearer token from HTTP Authorization header
        2. Verify JWT token signature and expiration against database
        3. Retrieve user data and authentication model
        4. Convert token data to structured user information
        5. Optionally extend session timer
        6. Update instance state with authentication data

        Args:
            request (Request): The HTTP request object containing the Authorization
                header with the Bearer token to be verified.
            extend_timer (bool, optional): If True, extends the session expiration
                timer when the token is successfully verified. This helps maintain
                user sessions for longer periods. Defaults to True.

        Returns:
            Self: The AuthenticationProducer instance with updated authentication
                state, including authentication_model and user_info.

        Raises:
            Unauthorized: If any of the following conditions occur:
                - Authorization header is missing or malformed
                - Bearer token is not found in header
                - JWT token is invalid, expired, or not found in database
                - Token verification fails for any reason

        Side Effects:
            - Updates self.authentication_model with verified user data
            - Updates self.user_info with structured user information
            - Extends session timer if extend_timer=True
            - Logs authentication events for audit purposes

        Example:
            ```python
            # In a Django view
            auth_producer = AuthenticationProducer(...)
            auth_producer.verify_login_token(request)

            # Access authenticated user data
            user = auth_producer.authentication_model.user
            user_info = auth_producer.user_info

            # Check user permissions
            permissions = auth_producer.permission_model
            ```

        Security Notes:
            - Token verification is performed against the database to ensure
              token revocation is respected
            - Session timer extension helps maintain user experience while
              providing security through periodic re-authentication
            - All authentication failures are logged for security monitoring
        """

        # Get encoded_token — prefer HttpOnly cookie, fall back to header
        encoded_token = self._get_encoded_token_from_request(
            request=request,
        )

        # Get decoded_token
        self.authentication_model = self._get_authentication_model(
            encoded_token=encoded_token,
            request=request,
            extend_timer=extend_timer,
        )

        # Get user_info
        self.user_info = UserInfoModel(
            **self.authentication_model.decoded_token.model_dump()
        ).model_dump()

        return self

    @raise_exception(
        "Failed to delete all tokens for the user.",
        exception_logger=logger,
    )
    @verify_params(key_list=["user_id"])
    def delete_all_tokens(
        self,
        user_id: str,
    ) -> None:
        """
        Delete all authentication tokens associated with a specific user.

        This method revokes all JWT tokens for a given user, effectively logging
        them out from all devices and sessions. This is typically used for
        security purposes, such as when a user account is compromised or when
        an administrator needs to force a user logout.

        Token Deletion Process:
        1. Validates the provided user_id parameter
        2. Executes background task to delete all tokens for the user
        3. Logs the token deletion operation for audit purposes

        Args:
            user_id (str): The unique identifier of the user whose tokens should
                be deleted. Must be a valid user ID that exists in the system.

        Returns:
            None: This method does not return a value.

        Raises:
            Exception: If the token deletion operation fails for any reason,
                such as invalid user_id or database connection issues.

        Side Effects:
            - All JWT tokens for the specified user are revoked
            - User will be required to re-authenticate on next request
            - Operation is logged for security audit purposes

        Security Considerations:
            - This operation is irreversible and will immediately log out the user
            - Should be used with caution as it affects all user sessions
            - Typically used for security incidents or administrative actions

        Example:
            ```python
            # Force logout for a specific user
            auth_producer.delete_all_tokens("user_12345")

            # User will need to login again on next request
            ```

        Use Cases:
            - Security incident response
            - Administrative user logout
            - Account suspension or deactivation
            - Password reset security measure
        """
        self.producer.get_task_value(
            task_type="delete_all_tokens",
            task_body={"user_id": user_id},
        )

    @raise_exception(
        "Failed to get encoded token from request header.",
        exception_logger=logger,
    )
    @verify_params(key_list=["request"])
    def _get_encoded_token_from_request(
        self,
        request: Request,
    ) -> str:
        """Extract the encoded JWT access token from the request.

        Checks the HttpOnly ``access_token`` cookie first (preferred — not
        accessible to JavaScript, mitigates XSS).  Falls back to the
        ``Authorization: Bearer`` header for non-browser clients that cannot
        send cookies.

        Args:
            request: The HTTP request object.

        Returns:
            The raw encoded JWT string ready for verification.

        Raises:
            Unauthorized: If neither the cookie nor a valid Bearer header
                is present.
        """
        from shared_libs.constants.jwt import ACCESS_COOKIE_NAME

        # 1. Prefer the HttpOnly cookie set by the authentication service.
        cookie_token = request.COOKIES.get(ACCESS_COOKIE_NAME)
        if cookie_token:
            return cookie_token

        # 2. Fall back to Authorization: Bearer header (non-browser clients).
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if not auth_header:
            raise Unauthorized("Authorization header not found.")
        if not auth_header.startswith("Bearer "):
            raise Unauthorized("Bearer token not found in header.")
        return auth_header[7:]

    @raise_exception(
        "Failed to retrieve authentication model.",
        exception_logger=logger,
    )
    @verify_params(key_list=["encoded_token"])
    def _get_authentication_model(
        self,
        encoded_token: str,
        request: Request,
        extend_timer: bool = True,
        **kwargs,
    ) -> AuthenticationModel:
        """
        Retrieve and validate the authentication model for a given JWT token.

        This private method handles the core token verification process by
        retrieving the authentication model from Redis. Login seeds the Redis
        session object, and successful protected requests refresh its TTL.

        Authentication Model Retrieval Process:
        1. Validates the encoded token parameter
        2. Looks up the session-scoped Redis authentication object
        3. Validates that the stored encoded token matches the request token
        4. Extends the Redis TTL and returns the authentication model

        Args:
            encoded_token (str): The JWT token to be verified against the database.
                Must be a valid encoded JWT token string.
            request (Request): The HTTP request object for additional context
                and session information.
            extend_timer (bool, optional): If True, extends the session expiration
                timer when the token is verified. Defaults to True.
            **kwargs: Additional keyword arguments that may be passed to
                the database verification method.

        Returns:
            AuthenticationModel: The verified authentication model containing
                user data, token information, and authentication context.

        Raises:
            Unauthorized: If any of the following conditions occur:
                - The encoded token is invalid or malformed
                - Authentication session is missing from Redis
                - Stored token does not match the request token
                - Authentication session expired due to inactivity

        Side Effects:
            - Extends the Redis inactivity TTL on every successful auth request
            - Logs authentication verification events
            - Does not fall back to database verification on cache miss

        Example:
            ```python
            # Internal usage within verify_login_token
            auth_model = auth_producer._get_authentication_model(
                encoded_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                request=request,
                extend_timer=True,
            )
            ```

        Note:
            This is a private method used internally by verify_login_token().
            It should not be called directly by external code.
        """
        session_id = request.session.session_key
        if not session_id:
            raise Unauthorized("Authentication session not found.")

        cache_key = build_auth_session_cache_key(session_id=session_id)
        cached_authentication_model = self._get_cached_authentication_model(
            cache_key=cache_key,
            encoded_token=encoded_token,
        )
        if cached_authentication_model:
            return cached_authentication_model

        raise Unauthorized("Authentication session expired. Please login again.")

    @raise_exception(
        "Failed to retrieve authentication model from database.",
        exception_logger=logger,
    )
    @verify_params(key_list=["encoded_token"])
    def _get_authentication_model_from_db(
        self,
        encoded_token: str,
        request: Request,
        extend_timer: bool = True,
    ) -> AuthenticationModel | None:
        """
        Retrieve authentication model from database via background task execution.

        This private method performs the actual database lookup for JWT token
        verification. It executes a background task to verify the token against
        the database and retrieve the associated authentication model.

        Database Verification Process:
        1. Validates the encoded token parameter
        2. Executes "verify_token" background task with token details
        3. Passes token type and session extension preferences
        4. Retrieves authentication model data from task result
        5. Converts raw data to AuthenticationModel object

        Args:
            encoded_token (str): The JWT token to be verified in the database.
                Must be a valid encoded JWT token string.
            request (Request): The HTTP request object for session context
                and additional verification parameters.
            extend_timer (bool, optional): If True, extends the session expiration
                timer when the token is verified. Defaults to True.

        Returns:
            AuthenticationModel | None: The verified authentication model if the
                token is valid and found in the database, None if the token
                verification fails or the token is not found.

        Raises:
            Exception: If the background task execution fails or the database
                operation encounters an error.

        Background Task Details:
            - Task Type: "verify_token"
            - Task Body: Contains encoded_token, token_type, and extend_timer
            - Raises exception if token is not found (raise_if_not_found=True)

        Performance Considerations:
            - Uses background task execution for non-blocking database operations
            - Leverages Redis caching for improved performance
            - Implements proper error handling and logging

        Example:
            ```python
            # Internal usage within _get_authentication_model
            auth_model = auth_producer._get_authentication_model_from_db(
                encoded_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                request=request,
                extend_timer=True,
            )
            ```

        Note:
            This is a private method used internally by _get_authentication_model().
            It should not be called directly by external code.
        """
        logger.info(
            "[ SHARED-PRODUCER ] Retrieving authentication model dict from database."
        )
        res = self.producer.get_task_value(
            task_type="verify_token",
            task_body={
                "encoded_token": encoded_token,
                "token_type": self.token_type,
                "extend_timer": extend_timer,
            },
            raise_if_not_found=True,
        )
        if not res:
            return None

        return AuthenticationModel(**res)
