import logging

from shared_libs.decorators import raise_exception, verify_params
from shared_libs.models.database_models import ResourceTagTreeModel

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


class ResourceTagUtil:
    def __init__(
        self,
        resource_tag_tree_models: list[ResourceTagTreeModel],
    ):
        self.resource_tag_tree_models = resource_tag_tree_models

    @raise_exception(
        "Failed to retrieve tag name.",
        exception_logger=logger,
    )
    @verify_params(key_list=["tag_id"])
    def get_tag_name(self, tag_id: str):
        res = next(
            (_.tag_name for _ in self.resource_tag_tree_models if _.tag_id == tag_id),
            "",
        )
        return res

    @raise_exception(
        "Failed to retrieve root tag id.",
        exception_logger=logger,
    )
    @verify_params(key_list=["tag_id"])
    def get_root_tag_id(self, tag_id: str):
        resource_tag_tree_model = next(
            (_ for _ in self.resource_tag_tree_models if _.tag_id == tag_id),
            None,
        )
        if not resource_tag_tree_model or not len(resource_tag_tree_model.parent_nodes):
            return ""
        return resource_tag_tree_model.parent_nodes[-1]

    @raise_exception(
        "Failed to retrieve root tag name.",
        exception_logger=logger,
    )
    @verify_params(key_list=["tag_id"])
    def get_root_tag_name(self, tag_id: str):
        root_tag_id = self.get_root_tag_id(
            tag_id=tag_id,
        )
        if not root_tag_id:
            return ""
        return self.get_tag_name(
            tag_id=root_tag_id,
        )

    @raise_exception(
        "Failed to retrieve tag tier level.",
        exception_logger=logger,
    )
    @verify_params(key_list=["tag_id"])
    def get_tier_level(self, tag_id: str):
        return next(
            (
                coerce_tier_level(_.tier_level)
                for _ in self.resource_tag_tree_models
                if _.tag_id == tag_id
            ),
            0,
        )

    @raise_exception(
        "Failed to retrieve root tag tier level.",
        exception_logger=logger,
    )
    @verify_params(key_list=["tag_id"])
    def get_root_tier_level(self, tag_id: str):
        root_tag_id = self.get_root_tag_id(tag_id=tag_id) or tag_id
        return self.get_tier_level(tag_id=root_tag_id)
