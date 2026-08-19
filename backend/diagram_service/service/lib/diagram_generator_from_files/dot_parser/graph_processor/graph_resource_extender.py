import logging

from .resource_node_manager import ResourceNodeManager
from .resource_util import ResourceUtilities

logger = logging.getLogger(__name__)


class GraphResourceExtender(ResourceUtilities):
    def __init__(
        self,
        resource_list,
        asset_directory,
        out_filename,
        TerraformResourceNodeManager: ResourceNodeManager,
    ):
        self.resource_list = resource_list
        self.TerraformResourceNodeManager = TerraformResourceNodeManager
        self.AUTO_ANNOTATION_CLASSES = []
        self.AUTO_LINK_CLASSES = []

        ResourceUtilities.__init__(
            self,
            resource_list=resource_list,
            asset_directory=asset_directory,
            out_filename=out_filename,
        )

    @staticmethod
    def get_new_resource(resource_type):
        return {
            "consolidated_resource_nodes": [],
            "graph_attributes": [],
            "graph_nodes": [],
            "resource_attributes": [],
            "resource_directed": False if resource_type == "node" else True,
            "resource_nodes": [],
            "resource_type": resource_type,
            "is_auto_annotation": False,
            "is_auto_link": False,
            "is_visible": True,
        }

    def get_new_edge_resource(self, fore_node, aft_node, edge_direction):
        new_resource = {**self.get_new_resource("edge")}
        resource_nodes = []
        if edge_direction == "forward":
            resource_nodes.append({**fore_node, "type": "source"})
            resource_nodes.append({**aft_node, "type": "target"})
        elif edge_direction == "reverse":
            resource_nodes.append({**fore_node, "type": "target"})
            resource_nodes.append({**aft_node, "type": "source"})
        elif edge_direction == "none":
            resource_nodes.append({**fore_node, "type": "node"})
            resource_nodes.append({**aft_node, "type": "node"})
            new_resource["resource_directed"] = False
        else:
            logger.error(f"Edge direction {edge_direction} is invalid.")
            return None
        new_resource["resource_nodes"] = sorted(
            resource_nodes,
            key=lambda r: r["type"],
        )
        return new_resource

    def add_node_resource(self, resource_node_label, resource_node_class_label):
        resource_type = "node"
        new_resource = {**self.get_new_resource(resource_type)}
        new_resource_node = self.TerraformResourceNodeManager.get_new_resource_node(
            resource_node_label,
            resource_node_class_label,
        )
        new_resource_node["type"] = (
            self.TerraformResourceNodeManager.get_resource_node_type(resource_type)
        )
        new_resource["resource_nodes"] = [new_resource_node]
        self.update_resource_list(new_resource)
        return self

    def add_resources_from_auto_annotations(
        self, AUTO_ANNOTATION_CLASSES, print_metrics=False
    ):
        logger.info("[ ARCH-DIAGRAM ] " + "=" * 50)
        logger.info("[ ARCH-DIAGRAM ] Running add_resources_from_auto_annotations ...")

        self.AUTO_ANNOTATION_CLASSES = AUTO_ANNOTATION_CLASSES
        resource_nodes_combined = self.get_resource_nodes_combined()
        prefix_list = [
            anno["class_label_prefix"] for anno in self.AUTO_ANNOTATION_CLASSES
        ]
        resource_nodes_filtered = self.get_resource_nodes_filtered_by_class_label_match(
            resource_nodes_combined, prefix_list
        )
        if not len(resource_nodes_filtered):
            logger.info(
                "[ ARCH-DIAGRAM ] > No match found from auto annotation classes."
            )
            return self

        resource_node_labels = [r["class_label"] for r in resource_nodes_combined]
        new_node_count = 0
        new_edge_count = 0
        for resource_node in resource_nodes_filtered:
            for annotation in AUTO_ANNOTATION_CLASSES:
                for related_node in annotation["related_nodes"]:
                    related_node_label = related_node["label"]
                    related_node_class_label = related_node["class_label"]
                    if related_node_class_label not in resource_node_labels:
                        self.add_node_resource(
                            related_node_label,
                            related_node_class_label,
                        )
                        new_node_count += 1
                        resource_node_labels.append(related_node_class_label)

                    aft_node = self.TerraformResourceNodeManager.get_new_resource_node(
                        related_node_label,
                        related_node_class_label,
                    )
                    aft_node["type"] = (
                        self.TerraformResourceNodeManager.get_resource_node_type("node")
                    )
                    aft_node["is_auto_annotation"] = True

                    new_resource = self.get_new_edge_resource(
                        fore_node=resource_node,
                        aft_node=aft_node,
                        edge_direction=annotation["direction"],
                    )
                    new_resource["is_auto_annotation"] = True
                    self.update_resource_list(new_resource)
                    new_edge_count += 1
                    continue
                continue
            continue

        logger.info(
            f"[ ARCH-DIAGRAM ] > {new_node_count} nodes added, {new_edge_count} edges added."
        )

        if print_metrics:
            self.print_resource_list("add_resources_from_auto_annotations")
        return self

    def add_resources_from_auto_links(self, AUTO_LINK_CLASSES, print_metrics=False):
        logger.info("[ ARCH-DIAGRAM ] " + "=" * 50)
        logger.info("[ ARCH-DIAGRAM ] Running add_resources_from_auto_links ...")

        self.AUTO_LINK_CLASSES = AUTO_LINK_CLASSES
        resource_nodes_combined = self.get_resource_nodes_combined()
        prefix_list = [anno["class_label_prefix"] for anno in self.AUTO_LINK_CLASSES]
        resource_nodes_filtered = self.get_resource_nodes_filtered_by_class_label_match(
            resource_nodes_combined, prefix_list
        )
        if not len(resource_nodes_filtered):
            logger.info("[ ARCH-DIAGRAM ] > No match found from auto links classes.")
            return self

        new_edge_count = 0
        for resource_node in resource_nodes_filtered:
            for link in AUTO_LINK_CLASSES:
                related_resource_nodes = [
                    n
                    for n in resource_nodes_combined
                    if self.is_prefix_match(
                        link["related_class_label_prefixes"],
                        n["class_label"],
                    )
                ]
                for related_resource_node in related_resource_nodes:
                    new_resource = self.get_new_edge_resource(
                        fore_node=resource_node,
                        aft_node=related_resource_node,
                        edge_direction=link["direction"],
                    )
                    new_resource["is_auto_link"] = True
                    self.update_resource_list(new_resource)
                    new_edge_count += 1
                    continue
                continue
            continue

        logger.info(f"[ ARCH-DIAGRAM ] > {new_edge_count} edges added.")

        if print_metrics:
            self.print_resource_list("add_resources_from_auto_links")
        return self

    def add_missing_group_resource(self, print_metrics=False):
        logger.info("[ ARCH-DIAGRAM ] " + "=" * 50)
        logger.info("[ ARCH-DIAGRAM ] Running add_missing_parent_clusterNode ...")

        node_resources = self.get_node_resources()
        resource_nodes_combined = self.get_resource_nodes_combined()
        resource_nodes_combined_class_label = [
            n["class_label"] for n in resource_nodes_combined
        ]
        for resource in node_resources:
            resource_node = resource["resource_nodes"][0]
            parent_node = resource_node["parent_node"]
            if parent_node is None:
                continue
            parent_node_class_label = parent_node.get("class_label")
            if parent_node_class_label is None:
                continue
            if (
                parent_node_class_label in resource_nodes_combined_class_label
                or parent_node_class_label == self.provider
            ):
                continue

            self.add_node_resource(
                resource_node_label=parent_node_class_label,
                resource_node_class_label=parent_node_class_label,
            )
            continue

        if print_metrics:
            self.print_resource_list("add_missing_parent_clusterNode")
        return self
