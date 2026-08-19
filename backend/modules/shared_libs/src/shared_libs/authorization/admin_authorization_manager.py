import logging

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import Unauthorized
from shared_libs.models.database_models import UserModel

from .permission_manager import PermissionManager

logger = logging.getLogger(__name__)


class AdminAuthorizationManager:
    """
    Manages the authorization of admin privileges for users.
    """

    def __init__(
        self,
        user_permission_doc: dict,
        user_policy_docs: list[dict] | None = None,
        user_role_docs: list[dict] | None = None,
    ):
        """
        Initializes the AdminAuthorizationManager with user permission documentation.

        Args:
            user_permission_doc (dict): A dictionary containing user permission documentation.
            user_policy_docs (list[dict] | None): Policy documents with admin metadata.
            user_role_docs (list[dict] | None): Role documents with admin metadata.
        """
        self.user_permission_doc = user_permission_doc
        self.user_policy_docs = user_policy_docs or []
        self.user_role_docs = user_role_docs or []

    @raise_exception(
        "Failed to verify admin privileges.",
        default_exception=Unauthorized,
        exception_logger=logger,
    )
    def verify_admin(
        self,
        user_model: UserModel,
        raise_if_not_admin=False,
    ) -> bool:
        """
        Verify if the user has admin privileges.

        Args:
            user_model (UserModel): The user model.
            raise_if_not_admin (bool): Whether to raise an exception if the user is not an admin.

        Returns:
            bool: True if the user has admin privileges, False otherwise.

        Raises:
            Unauthorized: If the user does not have admin privileges and raise_if_not_admin is True.
        """
        # Check if the user is a superuser
        if user_model.is_superuser:
            return True

        # Verify admin privileges in entitlements
        return self.verify_admin_in_entitlements(
            user_model=user_model,
            raise_if_not_admin=raise_if_not_admin,
        )

    @raise_exception(
        "Failed to verify admin privileges in entitlements.",
        default_exception=Unauthorized,
        exception_logger=logger,
    )
    def verify_admin_in_entitlements(
        self,
        user_model: UserModel,
        raise_if_not_admin=False,
    ) -> bool:
        """
        Verify if the user has admin privileges based on entitlements.

        Args:
            user_model (UserModel): The user model.
            raise_if_not_admin (bool): Whether to raise an exception if the user is not an admin.

        Returns:
            bool: True if the user has admin privileges, False otherwise.

        Raises:
            Unauthorized: If the user does not have admin privileges and raise_if_not_admin is True.
        """
        permission_manager = PermissionManager(
            user_permission_doc=self.user_permission_doc,
            user_policy_docs=self.user_policy_docs,
            user_role_docs=self.user_role_docs,
        )
        admin_policy_list = permission_manager.admin_policy_list
        admin_role_list = permission_manager.admin_role_list

        # Check if any of the user's entitlements have admin policies or roles.
        for entitlement in user_model.entitlements:
            policies = getattr(entitlement, "policies", None)
            roles = getattr(entitlement, "roles", None)

            if any(policy_key in admin_policy_list for policy_key in (policies or [])):
                return True
            if any(role_key in admin_role_list for role_key in (roles or [])):
                return True

        # Raise an exception if the user is not an admin and raise_if_not_admin is True
        if raise_if_not_admin:
            raise Unauthorized("User does not have admin privileges.")

        return False
