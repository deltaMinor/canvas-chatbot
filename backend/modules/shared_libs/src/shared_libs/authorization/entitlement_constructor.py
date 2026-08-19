import logging
from typing import TYPE_CHECKING

from shared_libs.decorators import raise_exception
from shared_libs.types.enum import UserPermissionType

if TYPE_CHECKING:
    from shared_libs.models.base_models import UserEntitlement
    from shared_libs.models.database_models import (
        UserModel,
        UserPolicyDocModel,
        UserRoleDocModel,
    )

logger = logging.getLogger(__name__)


class EntitlementConstructor:
    def __init__(
        self,
        processed_user_role_doc_models: list["UserRoleDocModel"],
        processed_user_policy_doc_models: list["UserPolicyDocModel"],
    ):
        """Initializes the EntitlementConstructor with user role and policy documents.

        Args:
            processed_user_role_doc_models (List[UserRoleDocModel]): A list of processed user role document models.
            processed_user_policy_doc_models (List[UserPolicyDocModel]): A list of processed user policy document models.
        """
        self.processed_user_role_doc_models = processed_user_role_doc_models
        self.processed_user_policy_doc_models = processed_user_policy_doc_models

    @raise_exception(
        "Failed to update user entitlement of custom type.",
        exception_logger=logger,
    )
    def update_entitlement_by_custom_type(
        self,
        entitlement_model: "UserEntitlement",
    ):
        """Update user entitlement by custom type.

        Args:
            entitlement_model (UserEntitlement): The user entitlement model to update.
        """
        pass

    @staticmethod
    @raise_exception(
        "Failed to cleanup permissions.",
        exception_logger=logger,
    )
    def cleanup_permissions(
        entitlement_model: "UserEntitlement",
    ):
        """Cleans up the permissions in the user entitlement model.

        This method removes duplicate permissions and sorts the permissions list
        in the given user entitlement model.

        Args:
            entitlement_model (UserEntitlement): The user entitlement model whose permissions need to be cleaned up.

        Returns:
            None
        """
        entitlement_model.permissions = list(set(entitlement_model.permissions))
        entitlement_model.permissions.sort()

    @raise_exception(
        "Failed to update user entitlement of policy type.",
        exception_logger=logger,
    )
    def update_entitlement_by_policy_type(
        self,
        entitlement_model: "UserEntitlement",
    ):
        """Updates the user entitlement based on the policy type.

        This method updates the permissions of the given user entitlement model by
        iterating through the policies and fetching the corresponding permissions from
        the processed user policy document models.

        Args:
            entitlement_model (UserEntitlement): The user entitlement model to be updated.

        Returns:
            None
        """
        if not len(entitlement_model.policies):
            return
        entitlement_model.permissions = []
        for policy_key in entitlement_model.policies:
            user_policy_doc_model = next(
                (
                    _
                    for _ in self.processed_user_policy_doc_models
                    if _.policy_key == policy_key
                ),
                None,
            )
            if not user_policy_doc_model:
                continue
            entitlement_model.permissions.extend(user_policy_doc_model.full_permissions)
            continue
        self.cleanup_permissions(
            entitlement_model=entitlement_model,
        )
        return

    @raise_exception(
        "Failed to update user entitlement of role type.",
        exception_logger=logger,
    )
    def update_entitlement_by_role_type(
        self,
        entitlement_model: "UserEntitlement",
    ):
        """Updates the user entitlement based on the role type.

        This method updates the permissions of the given user entitlement model by
        iterating through the roles and fetching the corresponding permissions from
        the processed user role document models.

        Args:
            entitlement_model (UserEntitlement): The user entitlement model to be updated.

        Returns:
            None
        """
        if not len(entitlement_model.roles):
            return
        entitlement_model.permissions = []
        for role_key in entitlement_model.roles:
            user_role_doc_model = next(
                (
                    _
                    for _ in self.processed_user_role_doc_models
                    if _.role_key == role_key
                ),
                None,
            )
            if not user_role_doc_model:
                continue
            entitlement_model.permissions.extend(user_role_doc_model.full_permissions)
            continue
        self.cleanup_permissions(
            entitlement_model=entitlement_model,
        )
        return

    @raise_exception(
        "Failed to update user entitlement permissions.",
        exception_logger=logger,
    )
    def update_user_entitlements(
        self,
        user_model: "UserModel",
    ):
        """Updates the user entitlements based on their permission type.

        This method iterates through the entitlements of the given user model and updates
        them based on their permission type. It handles role-based, policy-based, and custom
        entitlements.

        Args:
            user_model (UserModel): The user model containing the entitlements to be updated.

        Returns:
            None

        Raises:
            Exception: If updating the user entitlements fails.
        """
        for entitlement_model in user_model.entitlements:
            if entitlement_model.permission_type == UserPermissionType.role.value:
                self.update_entitlement_by_role_type(
                    entitlement_model=entitlement_model,
                )
                continue
            elif entitlement_model.permission_type == UserPermissionType.policy.value:
                self.update_entitlement_by_policy_type(
                    entitlement_model=entitlement_model,
                )
                continue
            elif entitlement_model.permission_type == UserPermissionType.custom.value:
                continue
            logger.error(
                f"permission_type ({entitlement_model.permission_type}) not recognised."
            )
            continue
        return
