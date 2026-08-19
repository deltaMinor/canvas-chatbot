import logging
from functools import cached_property
from typing import TYPE_CHECKING

from shared_libs.decorators import raise_exception
from shared_libs.lib.redis_util import RedisConfig
from shared_libs.models.database_models import ResourceTagModel, ResourceTagTreeModel

if TYPE_CHECKING:
    from shared_libs.domain import ResourceTagService
    from shared_libs.infrastructure.redis_repository.service import RedisRepository

logger = logging.getLogger(__name__)


def coerce_tier_level(value) -> int:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return max(value, 0)
    if isinstance(value, str):
        try:
            return max(int(value), 0)
        except ValueError:
            return int(value.lower() == "true")
    return int(bool(value))


class ResourceTagManager:
    """
    Manages the operations related to resource tags.

    This class is responsible for managing the operations related to resource tags. It interacts with the
    ResourceTagService to fetch resource tags and RedisRepository to cache the resource tag tree. It provides
    methods to get resource tag models, rebuild the resource tag tree, and get parent and child nodes of a
    resource tag model.

    Attributes:
        redis_name (str): The name of the Redis resource tag tree.
        resource_tag_service (ResourceTagService): The service to fetch resource tags.
        redis_repository (RedisRepository): The repository to cache the resource tag tree.
    """

    redis_name = "resource_tag_tree"

    def __init__(
        self,
        resource_tag_service: "ResourceTagService",
        redis_repository: "RedisRepository",
    ):
        """
        Initializes the ResourceTagManager with the given resource tag service and Redis repository.

        Args:
            resource_tag_service (ResourceTagService): The service to fetch resource tags.
            redis_repository (RedisRepository): The repository to cache the resource tag tree.
        """
        self.resource_tag_service = resource_tag_service
        self.redis_repository = redis_repository

    @cached_property
    @raise_exception(
        "Failed to rebuild property resource_tag_models",
        exception_logger=logger,
    )
    def resource_tag_models(self):
        """
        Gets the resource tag models.

        This method retrieves the resource tag models from the resource tag service and returns them.

        Returns:
            List[ResourceTagModel]: The list of resource tag models.
        """
        db_resource_tags = self.resource_tag_service.get_many()
        resource_tag_models = [ResourceTagModel(**tag) for tag in db_resource_tags]
        resource_tags_by_id = {tag.tag_id: tag for tag in resource_tag_models}
        return [
            tag.model_copy(
                update={
                    "tier_level": self.get_effective_tier_level(
                        resource_tag_model=tag,
                        resource_tags_by_id=resource_tags_by_id,
                    )
                }
            )
            for tag in resource_tag_models
        ]

    def get_root_resource_tag(
        self,
        resource_tag_model: ResourceTagModel,
        resource_tags_by_id: dict[str, ResourceTagModel],
    ) -> ResourceTagModel:
        root_resource_tag = resource_tag_model
        seen_tag_ids = {resource_tag_model.tag_id}
        while root_resource_tag.parent_tag_id:
            parent_resource_tag = resource_tags_by_id.get(
                root_resource_tag.parent_tag_id
            )
            if not parent_resource_tag or parent_resource_tag.tag_id in seen_tag_ids:
                break
            root_resource_tag = parent_resource_tag
            seen_tag_ids.add(root_resource_tag.tag_id)
        return root_resource_tag

    def get_effective_tier_level(
        self,
        resource_tag_model: ResourceTagModel,
        resource_tags_by_id: dict[str, ResourceTagModel],
    ) -> int:
        root_resource_tag = self.get_root_resource_tag(
            resource_tag_model=resource_tag_model,
            resource_tags_by_id=resource_tags_by_id,
        )
        return coerce_tier_level(root_resource_tag.tier_level)

    @property
    @raise_exception(
        "Failed to rebuild property resource_tag_tree_models",
        exception_logger=logger,
    )
    def resource_tag_tree_models(self) -> list["ResourceTagTreeModel"]:
        """
        Retrieves a list of ResourceTagTreeModels. If the list is not available
        in Redis, it rebuilds the list from the resource tag models, sets it in
        Redis, and then returns it.

        This property is decorated with a custom exception handler that raises a
        specific error message when the rebuilding process fails.

        Returns:
            List[ResourceTagTreeModel]: A list of ResourceTagTreeModels.

        Raises:
            CustomException: If the rebuilding process fails.
        """
        resource_tag_tree_list = self.redis_repository.get_item_in_redis(
            name=self.redis_name,
        )
        if resource_tag_tree_list:
            return [ResourceTagTreeModel(**_) for _ in resource_tag_tree_list]

        logger.info(
            "[ SHARED-LIB ] ResourceTagManager. Rebuiding resource tag tree shared_libs.."
        )
        resource_tag_tree_models = [
            ResourceTagTreeModel(
                **_.model_dump(),
                parent_nodes=self.get_parent_nodes(
                    resource_tag_model=_,
                ),
                child_nodes=self.get_child_nodes(
                    resource_tag_model=_,
                ),
            )
            for _ in self.resource_tag_models
        ]
        self.redis_repository.set_item_in_redis(
            name=self.redis_name,
            mapping=[_.model_dump() for _ in resource_tag_tree_models],
            expiry=RedisConfig.DOC_EXPIRY,
        )
        return resource_tag_tree_models

    @raise_exception(
        "Failed to retrieve parent nodes recursively.",
        exception_logger=logger,
    )
    def get_parent_nodes_recursive(
        self,
        resource_tag_model: "ResourceTagModel",
        parent_nodes: list[str],
    ):
        """
        Gets the parent nodes of a resource tag model recursively.

        This method gets the parent nodes of a resource tag model and appends them to the parent_nodes list.

        Args:
            resource_tag_model (ResourceTagModel): The resource tag model to get the parent nodes of.
            parent_nodes (List[str]): The list to append the parent nodes to.
        """
        parent_tag_model = next(
            (
                _
                for _ in self.resource_tag_models
                if _.tag_id == resource_tag_model.parent_tag_id
            ),
            None,
        )
        if not parent_tag_model:
            return

        parent_nodes.append(parent_tag_model.tag_id)
        self.get_parent_nodes_recursive(
            resource_tag_model=parent_tag_model,
            parent_nodes=parent_nodes,
        )

    @raise_exception(
        "Failed to retrieve parent nodes.",
        exception_logger=logger,
    )
    def get_parent_nodes(
        self,
        resource_tag_model: "ResourceTagModel",
    ):
        """
        Gets the parent nodes of a resource tag model.

        This method gets the parent nodes of a resource tag model by calling the get_parent_nodes_recursive method.

        Args:
            resource_tag_model (ResourceTagModel): The resource tag model to get the parent nodes of.

        Returns:
            List[str]: The list of parent nodes.
        """
        parent_nodes = []
        self.get_parent_nodes_recursive(
            resource_tag_model=resource_tag_model,
            parent_nodes=parent_nodes,
        )
        return parent_nodes

    @raise_exception(
        "Failed to retrieve child nodes recursively.",
        exception_logger=logger,
    )
    def get_child_nodes_recursive(
        self,
        resource_tag_model: "ResourceTagModel",
        child_nodes: list[str],
    ):
        """
        Gets the child nodes of a resource tag model recursively.

        This method gets the child nodes of a resource tag model and appends them to the child_nodes list.

        Args:
            resource_tag_model (ResourceTagModel): The resource tag model to get the child nodes of.
            child_nodes (List[str]): The list to append the child nodes to.
        """
        child_tag_models = [
            _
            for _ in self.resource_tag_models
            if _.parent_tag_id == resource_tag_model.tag_id
        ]
        if not len(child_tag_models):
            return

        child_nodes.extend([_.tag_id for _ in child_tag_models])
        for child_tag_model in child_tag_models:
            self.get_child_nodes_recursive(
                resource_tag_model=child_tag_model,
                child_nodes=child_nodes,
            )
        return

    @raise_exception(
        "Failed to retrieve child nodes.",
        exception_logger=logger,
    )
    def get_child_nodes(
        self,
        resource_tag_model: "ResourceTagModel",
    ):
        """
        Gets the child nodes of a resource tag model.

        This method gets the child nodes of a resource tag model by calling the get_child_nodes_recursive method.

        Args:
            resource_tag_model (ResourceTagModel): The resource tag model to get the child nodes of.

        Returns:
            List[str]: The list of child nodes.
        """
        child_nodes = []
        self.get_child_nodes_recursive(
            resource_tag_model=resource_tag_model,
            child_nodes=child_nodes,
        )
        return child_nodes
