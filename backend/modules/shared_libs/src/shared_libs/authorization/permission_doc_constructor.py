import logging
from functools import cached_property
from typing import TYPE_CHECKING

from shared_libs.decorators import raise_exception
from shared_libs.lib.redis_util import RedisConfig
from shared_libs.models.database_models import UserPolicyDocModel, UserRoleDocModel

if TYPE_CHECKING:
    from shared_libs.domain import UserPolicyDocService, UserRoleDocService
    from shared_libs.infrastructure.redis_repository.service import RedisRepository

logger = logging.getLogger(__name__)


class PermissionDocConstructor:
    """A class to construct and manage permission documents for users.

    Attributes:
        redis_name (str): The name of the Redis key for processed user role documents.
        user_policy_doc_service (UserPolicyDocService): Service to manage user policy documents.
        user_role_doc_service (UserRoleDocService): Service to manage user role documents.
        redis_repository (RedisRepository): Repository to interact with Redis.
    """

    redis_name = "processed_user_role_doc"

    def __init__(
        self,
        user_policy_doc_service: "UserPolicyDocService",
        user_role_doc_service: "UserRoleDocService",
        redis_repository: "RedisRepository",
    ):
        """
        Args:
            user_policy_doc_service (UserPolicyDocService): Service to manage user policy documents.
            user_role_doc_service (UserRoleDocService): Service to manage user role documents.
            redis_repository (RedisRepository): Repository to interact with Redis.
        """
        self.user_policy_doc_service = user_policy_doc_service
        self.user_role_doc_service = user_role_doc_service
        self.redis_repository = redis_repository

    @raise_exception(
        "Failed to retrieve full permissions from target policy.",
        exception_logger=logger,
    )
    def get_full_permissions_from_target_policy(
        self,
        target_policy_model: "UserPolicyDocModel",
    ) -> list[str]:
        """Retrieve full permissions from the target policy model.

        Args:
            target_policy_model (UserPolicyDocModel): The target policy model.

        Returns:
            List[str]: A list of full permissions.
        """
        full_permissions = target_policy_model.permissions

        for policy_key in target_policy_model.extends:
            policy_model = next(
                (
                    _
                    for _ in self.ref_user_policy_doc_models
                    if _.policy_key == policy_key
                ),
                None,
            )
            if not policy_model:
                logger.warning(f"policy_key {policy_key} not found.")
                continue
            _full_permissions = self.get_full_permissions_from_target_policy(
                target_policy_model=policy_model,
            )
            full_permissions.extend(_full_permissions)

        full_permissions = list(set(full_permissions))
        full_permissions.sort()
        return full_permissions

    @raise_exception(
        "Failed to retrieve processed user policy doc models.",
        exception_logger=logger,
    )
    def get_processed_user_policy_doc_models(
        self,
    ) -> list["UserPolicyDocModel"]:
        """Retrieve processed user policy document models.

        Returns:
            List[UserPolicyDocModel]: A list of processed user policy document models.
        """
        new_policy_models = []
        for user_policy_doc_model in self.ref_user_policy_doc_models:
            full_permissions = self.get_full_permissions_from_target_policy(
                target_policy_model=user_policy_doc_model,
            )
            new_policy_model = UserPolicyDocModel(**user_policy_doc_model.model_dump())
            new_policy_model.full_permissions = full_permissions
            new_policy_models.append(new_policy_model)
        return new_policy_models

    @cached_property
    @raise_exception(
        "Failed to return ref user policy doc models property.",
        exception_logger=logger,
    )
    def ref_user_policy_doc_models(self) -> list["UserPolicyDocModel"]:
        """Retrieve reference user policy document models.

        Returns:
            List[UserPolicyDocModel]: A list of reference user policy document models.
        """
        db_user_policy_docs = self.user_policy_doc_service.get_many()
        policy_models = [UserPolicyDocModel(**_) for _ in db_user_policy_docs]
        return policy_models

    @cached_property
    @raise_exception(
        "Failed to return processed user policy doc models property.",
        exception_logger=logger,
    )
    def processed_user_policy_doc_models(self) -> list["UserPolicyDocModel"]:
        """Retrieve processed user policy document models.

        Returns:
            List[UserPolicyDocModel]: A list of processed user policy document models.
        """
        return self.get_processed_user_policy_doc_models()

    @raise_exception(
        "Failed to retrieve processed user role doc models.",
        exception_logger=logger,
    )
    def get_processed_user_role_doc_models(self) -> list["UserRoleDocModel"]:
        """Retrieve processed user role document models.

        Returns:
            List[UserRoleDocModel]: A list of processed user role document models.
        """
        new_role_models = []
        for user_role_doc_model in self.ref_user_role_doc_models:
            new_role_model = UserRoleDocModel(**user_role_doc_model.model_dump())
            for policy_key in user_role_doc_model.policy_association:
                policy_model = next(
                    (
                        _
                        for _ in self.processed_user_policy_doc_models
                        if _.policy_key == policy_key
                    ),
                    None,
                )
                if not policy_model:
                    continue
                new_role_model.full_permissions.extend(policy_model.full_permissions)
            new_role_model.full_permissions = list(set(new_role_model.full_permissions))
            new_role_model.full_permissions.sort()
            new_role_models.append(new_role_model)
        return new_role_models

    @cached_property
    @raise_exception(
        "Failed to return ref user role doc models property.",
        exception_logger=logger,
    )
    def ref_user_role_doc_models(self) -> list["UserRoleDocModel"]:
        """Retrieve reference user role document models.

        Returns:
            List[UserRoleDocModel]: A list of reference user role document models.
        """
        db_user_role_docs = self.user_role_doc_service.get_many()
        role_models = [UserRoleDocModel(**_) for _ in db_user_role_docs]
        return role_models

    @raise_exception(
        "Failed to retrieve processed user role doc from redis.",
        exception_logger=logger,
    )
    def get_processed_user_role_doc_models_from_redis(
        self,
    ) -> list["UserRoleDocModel"]:
        """Retrieve processed user role document models from Redis.

        Returns:
            List[UserRoleDocModel]: A list of processed user role document models from Redis.
        """
        processed_user_role_docs = self.redis_repository.get_item_in_redis(
            name=self.redis_name,
        )
        if not processed_user_role_docs:
            return []
        return [UserRoleDocModel(**_) for _ in processed_user_role_docs]

    @cached_property
    @raise_exception(
        "Failed to return processed user role doc models property.",
        exception_logger=logger,
    )
    def processed_user_role_doc_models(self) -> list["UserRoleDocModel"]:
        """Retrieve processed user role document models.

        Returns:
            List[UserRoleDocModel]: A list of processed user role document models.
        """
        doc_models_from_redis = self.get_processed_user_role_doc_models_from_redis()
        if len(doc_models_from_redis):
            return doc_models_from_redis

        doc_models = self.get_processed_user_role_doc_models()
        self.redis_repository.set_item_in_redis(
            name=self.redis_name,
            mapping=[_.model_dump() for _ in doc_models],
            expiry=RedisConfig.DOC_EXPIRY,
        )
        return doc_models
