import logging

from service.lib.diagram_generator_from_files.dot_parser.dot_parser_util import (
    DotParserUtil,
)

from .resource_node_manager import ResourceNodeManager
from .resource_util import ResourceUtilities

logger = logging.getLogger(__name__)


class GraphResourceFixer(ResourceUtilities, DotParserUtil):
    def __init__(
        self,
        resource_list,
        asset_directory,
        out_filename,
        TerraformResourceNodeManager: ResourceNodeManager,
    ):
        self.resource_list = resource_list
        self.TerraformResourceNodeManager = TerraformResourceNodeManager
        self.provider = None
        self.REVERSE_ARROW_LIST = []
        ResourceUtilities.__init__(
            self,
            resource_list=resource_list,
            asset_directory=asset_directory,
            out_filename=out_filename,
        )
        DotParserUtil.__init__(self)

    @staticmethod
    def flip_edge_direction(resource):
        for resource_node in resource["resource_nodes"]:
            resource_node_type = resource_node["type"]
            if resource_node_type not in ["source", "target"]:
                continue
            resource_node["type"] = (
                "source" if resource_node_type == "target" else "target"
            )

    def remove_excluded_resources(self, print_metrics=False):
        logger.info("[ ARCH-DIAGRAM ] " + "=" * 50)
        logger.info("[ ARCH-DIAGRAM ] Running remove_excluded_resources ...")
        new_resource_list = list(
            filter(
                lambda r: all(not n["is_excluded"] for n in r["resource_nodes"]),
                self.resource_list,
            )
        )
        resources_removed = len(self.resource_list) - len(new_resource_list)

        if resources_removed == 0:
            logger.info("[ ARCH-DIAGRAM ] > No resource found in exclusion list.")
            return self

        logger.info(f"[ ARCH-DIAGRAM ] > {resources_removed} resources excluded.")
        self.replace_resource_list(new_resource_list)

        if print_metrics:
            self.print_resource_list("remove_excluded_resources")
        return self

    def reverse_edge_direction(self, REVERSE_ARROW_LIST, print_metrics=False):
        logger.info("[ ARCH-DIAGRAM ] " + "=" * 50)
        logger.info("[ ARCH-DIAGRAM ] Running reverse_edge_direction ...")

        self.REVERSE_ARROW_LIST = REVERSE_ARROW_LIST
        edge_resources = self.get_edge_resources()
        edges_flipped = []

        for resource in edge_resources:
            resource_nodes = resource["resource_nodes"]
            resource_nodes_filtered = (
                self.get_resource_nodes_filtered_by_primary_class_match(
                    resource_nodes, REVERSE_ARROW_LIST
                )
            )
            if (
                any(n["is_implied_connection"] for n in resource_nodes)
                or len(resource_nodes_filtered) == 0
            ):
                continue
            self.flip_edge_direction(resource)
            edges_flipped.append(resource)
            resource["resource_nodes"] = sorted(
                resource_nodes,
                key=lambda r: r["type"],
            )

        if not len(edges_flipped):
            logger.info("[ ARCH-DIAGRAM ] > No match found to reverse edge direction.")
            return self

        logger.info(f"[ ARCH-DIAGRAM ] > {len(edges_flipped)} edges direction flipped.")

        if print_metrics:
            self.print_resource_list("reverse_edge_direction")
        return self

    def remove_self_directed_edges(self, print_metrics=False):
        logger.info("[ ARCH-DIAGRAM ] " + "=" * 50)
        logger.info("[ ARCH-DIAGRAM ] Running remove_self_directed_edges ...")

        edge_resources = self.get_edge_resources()
        edge_resources_out = []
        edges_removed = []

        for resource in edge_resources:
            resource_node_class_labels = [
                n["class_label"] for n in resource["resource_nodes"]
            ]
            if any(
                resource_node_class_labels.count(label) > 1
                for label in resource_node_class_labels
            ):
                resource_nodes = resource["resource_nodes"]
                edges_removed.append(
                    f"{resource_nodes[0]['class_label']}-{resource_nodes[1]['class_label']}"
                )
                continue
            edge_resources_out.append(resource)
            continue

        if not len(edges_removed):
            logger.info(
                "[ ARCH-DIAGRAM ] > No match found for self-directed edge resource."
            )
            return self

        logger.info(
            f"[ ARCH-DIAGRAM ] > {len(edges_removed)} self-directed edges removed."
        )
        self.replace_edge_resources(edge_resources_out)

        if print_metrics:
            self.print_resource_list("remove_self_directed_edges")
        return self

    def remove_edges_with_group_nodes(self, print_metrics=False):
        logger.info("[ ARCH-DIAGRAM ] " + "=" * 50)
        logger.info("[ ARCH-DIAGRAM ] Running remove_edges_with_group_nodes ...")

        edge_resources = self.get_edge_resources()
        resource_nodes_combined = self.get_resource_nodes_combined()
        resource_node_class_labels = [n["class_label"] for n in resource_nodes_combined]
        edge_resources_out = []
        new_resource_node_labels = []
        edges_removed = []

        for resource in edge_resources:
            if any(n["is_group"] for n in resource["resource_nodes"]):
                # add new node resource if not exist
                resource_nodes = resource["resource_nodes"]
                for resource_node in resource_nodes:
                    not_in_resource_node_class_labels = (
                        resource_node["class_label"] not in resource_node_class_labels
                    )
                    not_in_new_resource_node_labels = (
                        resource_node["class_label"] not in new_resource_node_labels
                    )
                    if (
                        not_in_resource_node_class_labels
                        and not_in_new_resource_node_labels
                    ):
                        new_resource = {
                            **self.get_new_resource("node"),
                            "resource_nodes": [resource_node],
                        }
                        new_resource_node_labels.append(resource_node["class_label"])
                        self.update_resource_list(new_resource)
                        continue
                    continue
                if (
                    resource_nodes[0]["class_label"] in resource_nodes[1]["class_label"]
                    or resource_nodes[1]["class_label"]
                    in resource_nodes[0]["class_label"]
                    or any(n["special_class"] == "provider" for n in resource_nodes)
                ):
                    edges_removed.append(
                        f"{resource_nodes[0]['class_label']}-{resource_nodes[1]['class_label']}"
                    )
                    continue
                edge_resources_out.append(resource)
                continue

            edge_resources_out.append(resource)
            continue

        if not len(edges_removed):
            logger.info("[ ARCH-DIAGRAM ] > No edge with group node found.")
            return self

        logger.info(
            f"[ ARCH-DIAGRAM ] > {len(edges_removed)} edges removed. {len(new_resource_node_labels)} nodes added."
        )
        self.replace_edge_resources(edge_resources_out)

        if print_metrics:
            self.print_resource_list("remove_edges_with_group_nodes")
        return self

    def remove_duplicate_edges(self, print_metrics=False):
        logger.info("[ ARCH-DIAGRAM ] " + "=" * 50)
        logger.info("[ ARCH-DIAGRAM ] Running remove_duplicate_edges ...")

        edge_resources = self.get_edge_resources()
        source_targets_dict = {}
        new_edge_resources = []
        edges_removed = []

        for resource in edge_resources:
            source_node = [
                n for n in resource["resource_nodes"] if n["type"] == "source"
            ][0]
            source_node_label = source_node["class_label"]
            target_node = [
                n for n in resource["resource_nodes"] if n["type"] == "target"
            ][0]
            target_node_label = target_node["class_label"]
            existing_targets = source_targets_dict.get(source_node_label)

            if not bool(existing_targets):
                source_targets_dict[source_node_label] = [target_node_label]
                new_edge_resources.append(resource)
                continue

            if target_node_label in existing_targets:
                edges_removed.append(f"{source_node_label}-{target_node_label}")
                continue
            existing_targets.append(target_node_label)
            new_edge_resources.append(resource)

        self.source_targets_dict = source_targets_dict
        if not len(edges_removed):
            logger.info("[ ARCH-DIAGRAM ] > No duplicate edge found.")
            return self

        logger.info(f"[ ARCH-DIAGRAM ] > {len(edges_removed)} duplicate edges removed.")
        self.replace_edge_resources(new_edge_resources)

        if print_metrics:
            self.print_resource_list("remove_duplicate_edges")
        return self
