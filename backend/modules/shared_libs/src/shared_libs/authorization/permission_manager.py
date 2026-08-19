import logging

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class PermissionManager:
    """
    Manages user and admin-console permissions.

    This class provides methods to retrieve and manage user and admin permissions.
    It uses the `UserPermissionDocService` to fetch permission documents and provides
    properties to access these permissions in different formats.
    """

    def __init__(
        self,
        user_permission_doc: dict,
        user_policy_docs: list[dict] | None = None,
        user_role_docs: list[dict] | None = None,
    ):
        self.user_permission_doc = user_permission_doc
        self.user_policy_docs = user_policy_docs or []
        self.user_role_docs = user_role_docs or []

    @property
    def admin_policy_list(self) -> list[str]:
        return self.get_admin_policy_list()

    @property
    def admin_role_list(self) -> list[str]:
        return self.get_admin_role_list()

    @raise_exception(
        "Failed to retrieve admin policy list.",
        exception_logger=logger,
    )
    def get_admin_policy_list(self) -> list[str]:
        """
        Retrieves policy keys that grant admin privileges.

        Returns:
            list[str]: A list containing admin policy keys.
        """
        return [
            policy_doc["policy_key"]
            for policy_doc in self.user_policy_docs
            if policy_doc.get("is_admin") and policy_doc.get("policy_key")
        ]

    @raise_exception(
        "Failed to retrieve admin role list.",
        exception_logger=logger,
    )
    def get_admin_role_list(self) -> list[str]:
        """
        Retrieves role keys that grant admin privileges.

        Returns:
            list[str]: A list containing admin role keys.
        """
        return [
            role_doc["role_key"]
            for role_doc in self.user_role_docs
            if role_doc.get("is_admin") and role_doc.get("role_key")
        ]
