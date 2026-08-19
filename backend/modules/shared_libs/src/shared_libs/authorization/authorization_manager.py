import logging
from functools import cached_property
from typing import Any

from shared_libs.decorators import raise_exception
from shared_libs.domain import (
    ProjectService,
    UserPolicyDocService,
    UserRoleDocService,
    UserService,
)
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.models.base_models import ProducerDataModel, UserEntitlement
from shared_libs.models.database_models import ProjectModel, UserModel
from shared_libs.producers.authentication_producer import AuthenticationProducer
from shared_libs.producers.producer_data import (
    producer_data_project,
    producer_data_user,
    producer_data_user_policy_doc,
    producer_data_user_role_doc,
)

from .admin_authorization_manager import AdminAuthorizationManager

logger = logging.getLogger(__name__)


class AuthorizationManager:
    """
    A manager class for handling authorization operations.

    This class provides methods to manage user permissions and field permissions. It uses an AuthenticationProducer to interact with the authentication model and a ProjectService and UserService to interact with the project and user data.

    Attributes:
        auth_producer (AuthenticationProducer): The AuthenticationProducer used to interact with the authentication model.
        permissions (List[str], optional): A list of permissions for the user. Defaults to an empty list.
        field_permissions (List[str], optional): A list of field permissions for the user. Defaults to an empty list.
        user_model (UserModel): The user model from the authentication model.
        unique_permissions (List[str]): The unique permissions from the authentication model.
        resource_tag_tree_models (List[ResourceTagTreeModel]): The resource tag tree models from the authentication model.
        project_service (ProjectService): The service used to interact with the project data.
        user_service (UserService): The service used to interact with the user data.

    Note:
        This class currently does not have any methods.
        Methods should be added as needed in the future.
    """

    def __init__(
        self,
        auth_producer: AuthenticationProducer,
        permissions: list[str] | None = None,
        field_permissions: list[str] | None = None,
    ):
        """
        Constructs all the necessary attributes for the AuthorizationManager object.

        Args:
            auth_producer (AuthenticationProducer): The AuthenticationProducer used to interact with the authentication model.
            permissions (List[str], optional): A list of permissions for the user. Defaults to an empty list.
            field_permissions (List[str], optional): A list of field permissions for the user. Defaults to an empty list.
        """
        if field_permissions is None:
            field_permissions = []
        if permissions is None:
            permissions = []
        self.auth_producer = auth_producer
        self.permissions = permissions
        self.field_permissions = field_permissions

        self.user_model = auth_producer.authentication_model.user

        self.unique_permissions = auth_producer.authentication_model.unique_permissions

        # self.resource_tag_tree_models = auth_producer.resource_tag_tree_models
        self.project_resource_tags_mapping: dict[str, list[str] | None] = {}

        self.project_service = ProjectService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_project,
                    ),
                    celery_app=auth_producer.producer.celery_app,
                ),
            ),
        )

        self.user_service = UserService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_user,
                    ),
                    celery_app=auth_producer.producer.celery_app,
                ),
            )
        )

    @property
    def resource_tag_tree(self) -> list[dict]:
        return self.get_resource_tag_tree()

    @property
    def authorized_tag_id_list(self) -> list[str]:
        return self.get_authorized_tag_id_list()

    @property
    def entitled_tag_id_list(self) -> list[str]:
        return self.get_entitled_tag_id_list()

    @cached_property
    def authorized_project_models(self) -> list[ProjectModel]:
        return self.get_authorized_project_models()

    @cached_property
    def entitled_project_models(self) -> list[ProjectModel]:
        return self.get_entitled_project_models()

    @cached_property
    def entitled_project_resource_tags_mapping(self) -> dict[str, list[str]]:
        return self.get_entitled_project_resource_tags_mapping()

    @property
    def authorized_project_id_list(self) -> list[str]:
        return [_.project_id for _ in self.authorized_project_models]

    @property
    def entitled_project_id_list(self) -> list[str]:
        return list(self.entitled_project_resource_tags_mapping.keys())

    @cached_property
    def authorized_user_models(self) -> list[UserModel]:
        return self.get_authorized_user_models()

    @cached_property
    def entitled_user_models(self) -> list[UserModel]:
        return self.get_entitled_user_models()

    @property
    def authorized_user_id_list(self) -> list[str]:
        return [_.user_id for _ in self.authorized_user_models]

    @property
    def entitled_user_id_list(self) -> list[str]:
        return [_.user_id for _ in self.entitled_user_models]

    @cached_property
    def project_permissions_mapping(self) -> dict:
        return self.get_project_permissions_mapping()

    @property
    def user_permissions_mapping(self) -> dict:
        return self.get_user_permissions_mapping()

    @property
    def tag_permissions_mapping(self) -> dict:
        return self.get_tag_permissions_mapping()

    @property
    def is_admin(self) -> bool:
        return self.admin_authorization_manager.verify_admin(
            user_model=self.user_model,
        )

    @cached_property
    def admin_authorization_manager(self) -> AdminAuthorizationManager:
        return AdminAuthorizationManager(
            user_permission_doc=self.auth_producer.user_permission_doc,
            user_policy_docs=self.user_policy_doc_service.get_many(),
            user_role_docs=self.user_role_doc_service.get_many(),
        )

    @cached_property
    def user_policy_doc_service(self) -> UserPolicyDocService:
        return UserPolicyDocService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_user_policy_doc,
                    ),
                    celery_app=self.auth_producer.producer.celery_app,
                ),
            )
        )

    @cached_property
    def user_role_doc_service(self) -> UserRoleDocService:
        return UserRoleDocService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_user_role_doc,
                    ),
                    celery_app=self.auth_producer.producer.celery_app,
                ),
            )
        )

    @raise_exception(
        "Failed to retrieve resource tag tree.",
        exception_logger=logger,
    )
    def get_resource_tag_tree(self):
        """
        Retrieve the resource tag tree.

        Returns:
            List[dict]: A list of resource tag tree models in dictionary form.

        Raises:
            Exception: If the retrieval fails.
        """
        if self.user_model.is_superuser:
            return [_.model_dump() for _ in self.resource_tag_tree_models]

        # Filter the resource tag tree models based on entitled tag IDs
        entitled_tree_models = [
            _
            for _ in self.resource_tag_tree_models
            if _.tag_id in self.entitled_tag_id_list
        ]

        # Filter parent and child nodes based on entitled tag IDs
        for model in entitled_tree_models:
            model.parent_nodes = [
                _ for _ in model.parent_nodes if _ in self.entitled_tag_id_list
            ]
            model.child_nodes = [
                _ for _ in model.child_nodes if _ in self.entitled_tag_id_list
            ]
        return [_.model_dump() for _ in entitled_tree_models]

    @raise_exception(
        "Failed to append parent nodes.",
        exception_logger=logger,
    )
    def append_parent_tags(
        self,
        tag_id_list: list[str],
    ) -> None:
        """
        Append parent tags to the tag ID list.

        Args:
            tag_id_list (List[str]): The list of tag IDs.

        Raises:
            Exception: If appending parent nodes fails.
        """
        # Iterate over the tag IDs and append their parent nodes
        for tag_id in tag_id_list:
            parent_nodes = next(
                (
                    _.parent_nodes
                    for _ in self.resource_tag_tree_models
                    if _.tag_id == tag_id
                ),
                [],
            )
            if not len(parent_nodes):
                continue
            tag_id_list.extend(parent_nodes)

    @raise_exception(
        "Failed to append child tags.",
        exception_logger=logger,
    )
    def append_child_tags(
        self,
        tag_id_list: list[str],
    ) -> None:
        """
        Appends child nodes to the given tag id list.

        This method iterates over the tag_id_list and for each tag_id, it finds the corresponding
        child nodes from the resource_tag_tree_models. If child nodes are found, they are appended
        to the tag_id_list.

        Args:
            tag_id_list (List[str]): The list of tag ids to which child nodes will be appended.

        Raises:
            Exception: If the tag_id_list parameter is not provided or is not a list.
        """
        if not len(tag_id_list):
            return

        for tag_id in tag_id_list:
            child_nodes = next(
                (
                    _.child_nodes
                    for _ in self.resource_tag_tree_models
                    if _.tag_id == tag_id
                ),
                [],
            )
            if not len(child_nodes):
                continue
            tag_id_list.extend(child_nodes)

    @raise_exception(
        "Failed to retrieve tag id list from permissions.",
        exception_logger=logger,
    )
    def get_tag_id_list_from_permissions(
        self,
        ref_permissions: list[str],
    ) -> list[str]:
        """
        Retrieves a list of tag ids from the user's entitlements based on the given permissions.

        If no permissions are provided, it returns a list of tag ids from all of the user's entitlements.
        If permissions are provided, it filters the user's entitlements based on these permissions and
        returns a list of the corresponding tag ids. If resource_tag_tree_models are available, it also
        appends any child nodes to the tag id list.

        Args:
            ref_permissions (List[str]): The permissions to filter the user's entitlements by.

        Returns:
            List[str]: A list of tag ids from the user's entitlements based on the given permissions.

        Raises:
            Exception: If there is a failure in retrieving the tag id list from permissions.
        """
        if not ref_permissions or not len(ref_permissions):
            tag_id_list = [_.tag_id for _ in self.user_model.entitlements]
        else:
            tag_id_list = [
                _.tag_id
                for _ in self.user_model.entitlements
                if any(p in _.permissions for p in ref_permissions)
            ]
        if not len(self.resource_tag_tree_models):
            return tag_id_list

        self.append_child_tags(tag_id_list=tag_id_list)
        return list(set(tag_id_list))

    @raise_exception(
        "Failed to retrieve authorized tag id list.",
        exception_logger=logger,
    )
    def get_authorized_tag_id_list(self) -> list[str]:
        """
        Retrieves a list of tag ids that the user is authorized for.

        This method calls the get_tag_id_list_from_permissions method with the permissions attribute
        of the AuthorizationManager instance.

        Returns:
            List[str]: A list of tag ids that the user is authorized for.

        Raises:
            Exception: If there is a failure in retrieving the authorized tag id list.
        """
        if self.user_model.is_superuser:
            return [_.tag_id for _ in self.resource_tag_tree_models]

        return self.get_tag_id_list_from_permissions(
            ref_permissions=self.permissions,
        )

    @raise_exception(
        "Failed to retrieve entitled tag id list.",
        exception_logger=logger,
    )
    def get_entitled_tag_id_list(self) -> list[str]:
        """
        Retrieves a list of entitled tag ids.

        This method calls the get_tag_id_list_from_permissions method with an empty reference permissions
        list and returns the resulting list of tag ids.

        Returns:
            List[str]: A list of entitled tag ids.

        Raises:
            Exception: If there is a failure in retrieving the entitled tag id list.
        """
        return self.get_tag_id_list_from_permissions(
            ref_permissions=[],
        )

    @raise_exception(
        "Failed to retrieve project models from tag id list.",
        exception_logger=logger,
    )
    def get_project_models_from_tag_id_list(
        self,
        ref_tag_id_list: list[str],
    ) -> list[ProjectModel]:
        """
        Retrieves a list of project models that have any of the given tag ids.

        This method queries the project service for projects that have any of the given tag ids in their
        resource tags. It then converts the returned projects to ProjectModel instances and returns them.

        Args:
            ref_tag_id_list (List[str]): The tag ids to retrieve project models for.

        Returns:
            List[ProjectModel]: A list of project models that have any of the given tag ids.

        Raises:
            Exception: If there is a failure in retrieving the project models from the tag id list.
        """
        db_projects = self.project_service.get_many(
            {
                "resource_tags": {
                    "$elemMatch": {"$in": ref_tag_id_list},
                },
            }
        )
        return [ProjectModel(**_) for _ in db_projects]

    @raise_exception(
        "Failed to retrieve authorized project models.",
        exception_logger=logger,
    )
    def get_authorized_project_models(self) -> list[ProjectModel]:
        """
        Retrieves a list of project models that the user is authorized for.

        This method calls the get_project_models_from_tag_id_list method with the authorized_tag_id_list
        attribute of the AuthorizationManager instance.

        Returns:
            List[ProjectModel]: A list of project models that the user is authorized for.

        Raises:
            Exception: If there is a failure in retrieving the authorized project models.
        """
        if self.user_model.is_superuser:
            return [ProjectModel(**_) for _ in self.project_service.get_many()]

        return self.get_project_models_from_tag_id_list(
            ref_tag_id_list=self.authorized_tag_id_list,
        )

    @raise_exception(
        "Failed to retrieve entitled project models.",
        exception_logger=logger,
    )
    def get_entitled_project_models(self) -> list[ProjectModel]:
        """
        Retrieves a list of entitled project models.

        This method calls the get_project_models_from_tag_id_list method with the entitled tag id list
        and returns the resulting list of project models.

        Returns:
            List[ProjectModel]: A list of entitled project models.

        Raises:
            Exception: If there is a failure in retrieving the entitled project models.
        """
        return self.get_project_models_from_tag_id_list(
            ref_tag_id_list=self.entitled_tag_id_list,
        )

    @raise_exception(
        "Failed to cache project resource tags.",
        exception_logger=logger,
    )
    def cache_project_resource_tags(
        self,
        db_projects: list[dict] | None,
    ) -> None:
        """
        Cache resource-tag metadata for project documents.

        Args:
            db_projects (List[dict] | None): Project documents containing at
                least `project_id` and `resource_tags`.
        """
        for db_project in db_projects or []:
            project_id = db_project.get("project_id")
            if not project_id:
                continue
            self.project_resource_tags_mapping[project_id] = db_project.get(
                "resource_tags", []
            )

    @raise_exception(
        "Failed to retrieve project resource tags mapping.",
        exception_logger=logger,
    )
    def get_project_resource_tags_mapping_by_project_ids(
        self,
        project_id_list: list[str],
    ) -> dict[str, list[str] | None]:
        """
        Retrieve resource tags for a specific set of project ids.

        Missing projects are cached as `None` so repeated lookups do not issue
        duplicate remote calls.

        Args:
            project_id_list (List[str]): Project ids to retrieve.

        Returns:
            Dict[str, List[str] | None]: Mapping of project id to resource tags.
        """
        unique_project_id_list = list(dict.fromkeys(project_id_list))
        missing_project_id_list = [
            project_id
            for project_id in unique_project_id_list
            if project_id not in self.project_resource_tags_mapping
        ]

        if missing_project_id_list:
            db_projects = self.project_service.get_many(
                {"project_id": {"$in": missing_project_id_list}},
            )
            self.cache_project_resource_tags(db_projects=db_projects)

            for project_id in missing_project_id_list:
                self.project_resource_tags_mapping.setdefault(project_id, None)

        return {
            project_id: self.project_resource_tags_mapping.get(project_id)
            for project_id in unique_project_id_list
        }

    @raise_exception(
        "Failed to retrieve entitled project resource tags mapping.",
        exception_logger=logger,
    )
    def get_entitled_project_resource_tags_mapping(
        self,
    ) -> dict[str, list[str]]:
        """
        Retrieve resource tags for all entitled projects.

        Returns:
            Dict[str, List[str]]: Mapping of entitled project ids to resource tags.
        """
        db_projects = self.project_service.get_many(
            {
                "resource_tags": {
                    "$elemMatch": {"$in": self.entitled_tag_id_list},
                },
            },
        )
        self.cache_project_resource_tags(db_projects=db_projects)

        return {
            db_project["project_id"]: db_project.get("resource_tags", [])
            for db_project in db_projects or []
            if db_project.get("project_id")
        }

    @raise_exception(
        "Failed to retrieve user models from tag id list.",
        exception_logger=logger,
    )
    def get_user_models_from_tag_id_list(
        self,
        ref_tag_id_list: list[str],
    ) -> list[UserModel]:
        """
        Retrieves a list of user models that have any of the given tag ids in their entitlements.

        This method queries the user service for users that have any of the given tag ids in their
        entitlements. It then converts the returned users to UserModel instances and returns them.

        Args:
            ref_tag_id_list (List[str]): The tag ids to retrieve user models for.

        Returns:
            List[UserModel]: A list of user models that have any of the given tag ids in their entitlements.

        Raises:
            Exception: If there is a failure in retrieving the user models from the tag id list.
        """
        db_users = self.user_service.get_many(
            {
                "entitlements": {
                    "$elemMatch": {"tag_id": {"$in": ref_tag_id_list}},
                },
            }
        )
        return [UserModel(**_) for _ in db_users]

    @raise_exception(
        "Failed to retrieve authorized user models.",
        exception_logger=logger,
    )
    def get_authorized_user_models(self) -> list[UserModel]:
        """
        Retrieves a list of user models that the user is authorized for.

        This method calls the get_user_models_from_tag_id_list method with the authorized_tag_id_list
        attribute of the AuthorizationManager instance.

        Returns:
            List[UserModel]: A list of user models that the user is authorized for.

        Raises:
            Exception: If there is a failure in retrieving the authorized user models.
        """
        if self.user_model.is_superuser:
            return [UserModel(**_) for _ in self.user_service.get_many()]

        # Non-admin users can only access themselves for user-level resources.
        # Admin users retain tag-scoped visibility.
        if not self.is_admin:
            return [self.user_model]

        return self.get_user_models_from_tag_id_list(
            ref_tag_id_list=self.authorized_tag_id_list,
        )

    @raise_exception(
        "Failed to retrieve entitled user models.",
        exception_logger=logger,
    )
    def get_entitled_user_models(self) -> list[UserModel]:
        """
        Retrieves a list of entitled user models.

        This method calls the get_user_models_from_tag_id_list method with the entitled tag id list
        and returns the resulting list of user models.

        Returns:
            List[UserModel]: A list of entitled user models.

        Raises:
            Exception: If there is a failure in retrieving the entitled user models.
        """
        return self.get_user_models_from_tag_id_list(
            ref_tag_id_list=self.entitled_tag_id_list,
        )

    @raise_exception(
        "Failed to retrieve project permissions.",
        exception_logger=logger,
    )
    def get_project_permissions(
        self,
        resource_tags: list[str] | None,
    ) -> list[str]:
        """
        Retrieves a sorted list of unique permissions for a given project's tags.

        This method filters the user's entitlements based on the project's
        resource tags. For each of these entitlements, it retrieves the
        permissions that start with "project",
        removes duplicates, sorts the result, and returns it.

        Args:
            resource_tags (List[str] | None): Resource tags assigned to the
                project.

        Returns:
            List[str]: A sorted list of unique permissions for the project.

        Raises:
            Exception: If there is a failure in retrieving the project permissions.
        """
        if not resource_tags:
            return []

        tag_id_list = [*resource_tags]
        self.append_parent_tags(tag_id_list)
        filtered_entitlement_models = [
            _ for _ in self.user_model.entitlements if _.tag_id in tag_id_list
        ]

        #
        permissions = []
        for entitlement_model in filtered_entitlement_models:
            project_permissions = [
                _ for _ in entitlement_model.permissions if _.startswith("project")
            ]
            permissions.extend(project_permissions)

        # Keep project-scoped checks compatible with policy docs that declare
        # `project.read` while some entitlements still emit `projects.read`.
        if "projects.read" in permissions and "project.read" not in permissions:
            permissions.append("project.read")
        permissions = list(set(permissions))
        permissions.sort()
        return permissions

    @raise_exception(
        "Failed to retrieve project permissions mapping.",
        exception_logger=logger,
    )
    def get_project_permissions_mapping(
        self,
    ) -> dict[str, list[str]]:
        """
        Retrieve the project permissions mapping.

        Returns:
            Dict[str, List[str]]: A dictionary mapping project IDs to their permissions.

        Raises:
            Exception: If the retrieval fails.
        """
        return {
            project_id: self.get_project_permissions(
                resource_tags=resource_tags,
            )
            for project_id, resource_tags in self.entitled_project_resource_tags_mapping.items()
        }

    @raise_exception(
        "Failed to retrieve user permissions.",
        exception_logger=logger,
    )
    def get_user_permissions(
        self,
        user_id: str,
        user_models: list[UserModel],
    ) -> list[str]:
        """
        Retrieve the permissions for a specific user.

        Args:
            user_id (str): The unique identifier for the user.
            user_models (List[UserModel]): A list of user models.

        Returns:
            List[str]: A list of permissions for the user.

        Raises:
            Exception: If the retrieval fails.
        """
        # Find the user model and collect tag IDs from entitlements
        user_model = next(_ for _ in user_models if _.user_id == user_id)
        tag_id_list = [_.tag_id for _ in user_model.entitlements]
        self.append_parent_tags(tag_id_list)

        # Filter entitlements based on tag IDs
        filtered_entitlements = [
            _ for _ in self.user_model.entitlements if _.tag_id in tag_id_list
        ]

        # Collect user permissions
        permissions = []
        for entitlement in filtered_entitlements:
            user_permissions = [
                _ for _ in entitlement.permissions if _.startswith("user")
            ]
            permissions.extend(user_permissions)

        # Remove duplicates and sort permissions
        permissions = list(set(permissions))
        permissions.sort()
        return permissions

    @raise_exception(
        "Failed to retrieve user permissions mapping.",
        exception_logger=logger,
    )
    def get_user_permissions_mapping(
        self,
    ) -> dict[str, list[str]]:
        """
        Retrieve the user permissions mapping.

        Returns:
            Dict[str, List[str]]: A dictionary mapping user IDs to their permissions.

        Raises:
            Exception: If the retrieval fails.
        """
        return {
            user_id: self.get_user_permissions(
                user_id=user_id,
                user_models=self.entitled_user_models,
            )
            for user_id in self.entitled_user_id_list
        }

    @raise_exception(
        "Failed to retrieve tag permissions from filtered entitlements.",
        exception_logger=logger,
    )
    def get_tag_permissions_from_filtered_entitlements(
        self,
        entitlement_models: list[UserEntitlement],
    ) -> list[str]:
        """
        Retrieve tag permissions from filtered entitlements.

        Args:
            entitlement_models (List[UserEntitlement]): A list of user entitlement models.

        Returns:
            List[str]: A list of tag permissions.

        Raises:
            Exception: If the retrieval fails.
        """
        # Collect tag permissions
        permissions = []
        for entitlement in entitlement_models:
            tag_permissions = [
                _ for _ in entitlement.permissions if _.startswith("resource_tag")
            ]
            permissions.extend(tag_permissions)

        # Remove duplicates and sort permissions
        permissions = list(set(permissions))
        permissions.sort()
        return permissions

    @raise_exception(
        "Failed to retrieve tag permissions.",
        exception_logger=logger,
    )
    def get_tag_permissions(
        self,
        tag_id: str,
    ) -> list[str]:
        """
        Retrieve the permissions for a specific tag.

        Args:
            tag_id (str): The unique identifier for the tag.

        Returns:
            List[str]: A list of permissions for the tag.

        Raises:
            Exception: If the retrieval fails.
        """
        # Collect tag IDs and append parent tags
        tag_id_list = [tag_id]
        self.append_parent_tags(tag_id_list)

        # Filter entitlements based on tag IDs
        filtered_entitlements = [
            _ for _ in self.user_model.entitlements if _.tag_id in tag_id_list
        ]

        # Retrieve tag permissions from filtered entitlements
        permissions = self.get_tag_permissions_from_filtered_entitlements(
            entitlement_models=filtered_entitlements,
        )

        # Remove duplicates and sort permissions
        permissions = list(set(permissions))
        permissions.sort()
        return permissions

    @raise_exception(
        "Failed to retrieve tag permissions mapping.",
        exception_logger=logger,
    )
    def get_tag_permissions_mapping(
        self,
    ) -> dict[str, list[str]]:
        """
        Retrieve the tag permissions mapping.

        Returns:
            Dict[str, List[str]]: A dictionary mapping tag IDs to their permissions.

        Raises:
            Exception: If the retrieval fails.
        """
        return {
            tag_id: self.get_tag_permissions(
                tag_id=tag_id,
            )
            for tag_id in self.entitled_tag_id_list
        }

    @raise_exception(
        "Failed to verify resource tags authorization.",
        exception_logger=logger,
    )
    def verify_resource_tags(
        self,
        resource_tags: list[str],
        disable_exception=False,
    ) -> bool:
        """
        Verifies if the user is authorized for the given resource tags.

        If the user is a superuser, it returns True. If the user is not a superuser, it checks if all
        the given resource tags are in the user's authorized tag id list. If they are not, it either
        returns False or raises a BadRequest exception depending on the disable_exception flag.

        Args:
            resource_tags (List[str]): The resource tags to verify authorization for.
            disable_exception (bool, optional): If set to True, the method will return False instead of
                                                raising an exception when the user is not authorized.
                                                Defaults to False.

        Returns:
            bool: True if the user is authorized for the given resource tags, False otherwise.

        Raises:
            BadRequest: If the user is not authorized for the given resource tags and disable_exception
                        is set to False.
        """
        if self.user_model.is_superuser:
            return True
        if any(_ not in self.authorized_tag_id_list for _ in resource_tags):
            if disable_exception:
                return False
            raise BadRequest("You do not have permission to complete this operation.")
        return True

    @raise_exception(
        "Failed to verify user id list authorization.",
        exception_logger=logger,
    )
    def verify_user_id_list(
        self,
        user_id_list: list[str],
        disable_exception=False,
    ) -> bool:
        """
        Verifies if the user is authorized for the given user ids.

        If the user is a superuser, it returns True. If the user is not a superuser, it checks if all
        the given user ids are in the user's authorized user id list. If they are not, it either returns
        False or raises a BadRequest exception depending on the disable_exception flag.

        Args:
            user_id_list (List[str]): The user ids to verify authorization for.
            disable_exception (bool, optional): If set to True, the method will return False instead of
                                                raising an exception when the user is not authorized.
                                                Defaults to False.

        Returns:
            bool: True if the user is authorized for the given user ids, False otherwise.

        Raises:
            BadRequest: If the user is not authorized for the given user ids and disable_exception is
                        set to False.
        """
        if self.user_model.is_superuser:
            return True
        if any(_ not in self.authorized_user_id_list for _ in user_id_list):
            if disable_exception:
                return False
            raise BadRequest("You do not have permission to complete this operation.")
        return True

    @raise_exception(
        "Failed to retrieve project resource tags.",
        exception_logger=logger,
    )
    def get_project_resource_tags(
        self,
        project_id: str,
    ) -> list[str] | None:
        """
        Retrieve the resource tags for a single project.

        This method caches the project's resource tags for the lifetime of the
        AuthorizationManager instance so repeated project checks in the same
        request do not trigger duplicate remote lookups.

        Args:
            project_id (str): The project identifier.

        Returns:
            List[str] | None: The project's resource tags, or None when the
            project cannot be found.
        """
        if project_id in self.project_resource_tags_mapping:
            return self.project_resource_tags_mapping[project_id]

        db_project = self.project_service.get_one(
            {"project_id": project_id},
            raise_if_not_found=False,
        )
        resource_tags = db_project.get("resource_tags", []) if db_project else None
        self.project_resource_tags_mapping[project_id] = resource_tags
        return resource_tags

    @raise_exception(
        "Failed to verify project authorization.",
        exception_logger=logger,
    )
    def is_project_authorized(
        self,
        project_id: str,
    ) -> bool:
        """
        Check whether the current user can access a single project.

        A project is considered authorized when at least one of its resource
        tags overlaps with the user's authorized tag ids. This preserves the
        existing semantics used by the broader authorized-project query while
        avoiding a full scan of all accessible projects.

        Args:
            project_id (str): The project identifier to validate.

        Returns:
            bool: True when the project is accessible, otherwise False.
        """
        if self.user_model.is_superuser:
            return True

        project_resource_tags = self.get_project_resource_tags(project_id=project_id)
        if not project_resource_tags:
            return False

        return any(
            tag_id in self.authorized_tag_id_list for tag_id in project_resource_tags
        )

    @raise_exception(
        "Failed to verify project id authorization.",
        exception_logger=logger,
    )
    def verify_project_id(
        self,
        project_id: str,
        disable_exception=False,
    ) -> bool:
        """
        Verifies if the user is authorized for the given project id.

        If the user is a superuser, it returns True. Otherwise it retrieves the
        target project's resource tags and checks whether any of them overlap
        with the user's authorized tag ids. If access is not granted, it either
        returns False or raises a BadRequest exception depending on the
        disable_exception flag.

        Args:
            project_id (str): The id of the project to verify authorization for.
            disable_exception (bool, optional): If set to True, the method will return False instead of
                                                raising an exception when the user is not authorized.
                                                Defaults to False.

        Returns:
            bool: True if the user is authorized for the given project id, False otherwise.

        Raises:
            BadRequest: If the user is not authorized for the given project id and disable_exception
                        is set to False.
        """
        is_authorized = self.is_project_authorized(project_id=project_id)
        if not is_authorized:
            if disable_exception:
                return False
            raise BadRequest("You do not have permission to complete this operation.")
        return True

    @raise_exception(
        "Failed to verify project id list authorization.",
        exception_logger=logger,
    )
    def verify_project_id_list(
        self,
        project_id_list: list[str],
        disable_exception=False,
    ) -> bool:
        """
        Verifies if the user is authorized for the given list of project ids.

        If the user is a superuser, it returns True. Otherwise it fetches the
        requested projects in a single projected query and verifies that each
        project has at least one resource tag that overlaps with the user's
        authorized tag ids. If any project fails that check, it either returns
        False or raises a BadRequest exception depending on the
        disable_exception flag.

        Args:
            project_id_list (List[str]): The list of project ids to verify authorization for.
            disable_exception (bool, optional): If set to True, the method will return False instead of
                                                raising an exception when the user is not authorized.
                                                Defaults to False.

        Returns:
            bool: True if the user is authorized for all the given project ids, False otherwise.

        Raises:
            BadRequest: If the user is not authorized for the given project ids and disable_exception
                        is set to False.
        """
        if self.user_model.is_superuser:
            return True

        authorized_tag_id_set = set(self.authorized_tag_id_list)
        project_resource_tags_mapping = (
            self.get_project_resource_tags_mapping_by_project_ids(
                project_id_list=project_id_list,
            )
        )
        is_authorized = all(
            resource_tags
            and any(tag_id in authorized_tag_id_set for tag_id in resource_tags)
            for resource_tags in project_resource_tags_mapping.values()
        )

        if not is_authorized:
            if disable_exception:
                return False
            raise BadRequest("You do not have permission to complete this operation.")
        return True

    @raise_exception(
        "Failed to verify project field authorization.",
        exception_logger=logger,
    )
    def verify_project_field_authorization(
        self,
        project_id: str,
        disable_exception=False,
    ) -> bool:
        """
        Verifies the field authorization for the provided project id.

        This method verifies the project id. If the verification is successful, it returns True.
        Otherwise, it retrieves the project permissions from the project entitlement mapping using the
        project id. It then checks if any of the project permissions are in the field permissions. If
        not, and if disable_exception is False, it raises a BadRequest exception. Otherwise, it returns
        True if any of the project permissions are in the field permissions, and False otherwise.

        Args:
            project_id (str): The project id to verify the field authorization for.
            disable_exception (bool, optional): Whether to disable raising exceptions. Defaults to False.

        Returns:
            bool: True if the field authorization is verified, False otherwise.

        Raises:
            BadRequest: If the field authorization is not verified and disable_exception is False.
        """
        if self.verify_project_id(project_id=project_id, disable_exception=True):
            return True
        project_permissions = self.project_permissions_mapping.get(project_id, [])

        if not any(_ in self.field_permissions for _ in project_permissions):
            if disable_exception:
                return False
            raise BadRequest("You do not have permission to complete this operation.")
        return True

    @raise_exception(
        "Failed to verify standalone authorization.",
        exception_logger=logger,
    )
    def verify_standalone_authorization(
        self,
        disable_exception=False,
    ) -> bool:
        """
        Verifies standalone authorization.

        This method checks if the user is a superuser. If so, it returns True. Otherwise, it checks if
        any of the user's permissions are in the unique permissions. If not, and if disable_exception is
        False, it raises a BadRequest exception. Otherwise, it returns True if any of the user's
        permissions are in the unique permissions, and False otherwise.

        Args:
            disable_exception (bool, optional): Whether to disable raising exceptions. Defaults to False.

        Returns:
            bool: True if the standalone authorization is verified, False otherwise.

        Raises:
            BadRequest: If the standalone authorization is not verified and disable_exception is False.
        """
        if self.user_model.is_superuser:
            return True
        if not any(p in self.unique_permissions for p in self.permissions):
            if disable_exception:
                return False
            raise BadRequest("You do not have permission to complete this operation.")
        return True

    @raise_exception(
        "Failed to verify standalone field authorization.",
        exception_logger=logger,
    )
    def verify_standalone_field_authorization(
        self,
        disable_exception=False,
    ) -> bool:
        """
        Verifies standalone field authorization.

        This method first verifies standalone authorization. If standalone authorization
        is verified, it returns True. If not, it checks if any of the unique permissions
        are in the field permissions. If none of the unique permissions are in the field
        permissions and disable_exception is False, it raises a BadRequest exception.
        Otherwise, it returns False if disable_exception is True or True otherwise.

        Args:
            disable_exception (bool, optional): Whether to disable raising exceptions.
                                                Defaults to False.

        Returns:
            bool: True if standalone field authorization is verified, False otherwise.

        Raises:
            BadRequest: If none of the unique permissions are in the field permissions
                        and disable_exception is False.
        """
        if self.verify_standalone_authorization(disable_exception=True):
            return True
        if not any(_ in self.field_permissions for _ in self.unique_permissions):
            if disable_exception:
                return False
            raise BadRequest("You do not have permission to complete this operation.")
        return True

    @raise_exception(
        "Failed to check project field authorization.",
        exception_logger=logger,
    )
    def check_project_field_authorization(
        self,
        project_id: str,
        field_key: str,
    ) -> bool:
        """
        Checks if a project field is authorized.

        This method retrieves the field permission for the provided field key from the
        field permissions. If no field permission is found, it returns False. It then
        verifies the project ID. If the project ID is verified, it returns True. It then
        retrieves the project permissions for the project ID from the project entitlement
        mapping. If the field permission is not in the project permissions, it returns
        False. Otherwise, it returns True.

        Args:
            project_id (str): The ID of the project to check the field authorization for.
            field_key (str): The key of the field to check the authorization for.

        Returns:
            bool: True if the project field is authorized, False otherwise.

        Raises:
            Exception: If an error occurs while checking the project field authorization.
        """
        field_permission = next(
            (_ for _ in self.field_permissions if _.split(".")[-2] == field_key),
            None,
        )
        if not field_permission:
            return False

        # Validate against top level field permissions
        if self.verify_project_id(project_id=project_id, disable_exception=True):
            return True

        project_permissions = self.project_permissions_mapping.get(project_id, [])
        if field_permission not in project_permissions:
            return False
        return True

    @raise_exception(
        "Failed to check standalone field authorization.",
        exception_logger=logger,
    )
    def check_standalone_field_authorization(
        self,
        field_key: str,
    ) -> bool:
        """
        Checks if a standalone field is authorized.

        This method retrieves the field permission for the provided field key from the
        field permissions. If no field permission is found, it returns False. It then
        verifies standalone authorization. If standalone authorization is verified, it
        returns True. If the field permission is not in the unique permissions, it returns
        False. Otherwise, it returns True.

        Args:
            field_key (str): The key of the field to check the authorization for.

        Returns:
            bool: True if the standalone field is authorized, False otherwise.

        Raises:
            Exception: If an error occurs while checking the standalone field authorization.
        """
        field_permission = next(
            (_ for _ in self.field_permissions if _.split(".")[-2] == field_key),
            None,
        )
        if not field_permission:
            return False
        if self.verify_standalone_authorization(disable_exception=True):
            return True
        if field_permission not in self.unique_permissions:
            return False
        return True

    @raise_exception(
        "Failed to retrieve authorized tag resource.",
        exception_logger=logger,
    )
    def get_authorized_tag_resource(
        self,
        resource_tags: list[str],
        resource: Any,
        superuser_resource=None,
    ) -> Any:
        """
        Retrieves the authorized tag resource.

        If the user is a superuser, it returns the superuser resource if provided, otherwise it returns
        the resource. If the user is not a superuser, it checks if all the resource tags are in the
        user's authorized tag id list. If they are not, it raises a BadRequest exception. Otherwise, it
        returns the resource.

        Args:
            resource_tags (List[str]): The resource tags to authorize.
            resource (Any): The resource to authorize.
            superuser_resource (Any, optional): The resource to return if the user is a superuser.
                                                Defaults to None.

        Returns:
            Any: The authorized tag resource.

        Raises:
            BadRequest: If the user is not a superuser and not all the resource tags are in the user's
                        authorized tag id list.
        """
        if self.user_model.is_superuser:
            return superuser_resource if superuser_resource else resource
        if any(_ not in self.authorized_tag_id_list for _ in resource_tags):
            raise BadRequest("You do not have permission to complete this operation.")
        return resource
