import logging

from shared_libs.exceptions.api_exceptions import InternalServerError

from .resource_node_manager import ResourceNodeManager
from .resource_util import ResourceUtilities

logger = logging.getLogger(__name__)


class GraphResourceConsolidator(ResourceUtilities):
    def __init__(
        self,
        resource_list,
        asset_directory,
        out_filename,
        TerraformResourceNodeManager: ResourceNodeManager,
    ):
        self.resource_list = resource_list
        self.TerraformResourceNodeManager = TerraformResourceNodeManager
        self.CONSOLIDATED_NODE_CLASSES = []
        self.resource_nodes_consolidated = []

        ResourceUtilities.__init__(
            self,
            resource_list=resource_list,
            asset_directory=asset_directory,
            out_filename=out_filename,
        )

    @staticmethod
    def get_consolidated_node_dict(resource_nodes_consolidated_by_one_prefix):
        consolidated_node_dict = {}
        for resource_node in resource_nodes_consolidated_by_one_prefix:
            parent_node_class_label = resource_node["parent_node"].get(
                "class_label", "root"
            )
            if consolidated_node_dict.get(parent_node_class_label) is None:
                consolidated_node_dict[parent_node_class_label] = [resource_node]
                continue
            consolidated_node_dict[parent_node_class_label].append(resource_node)
            continue

        return consolidated_node_dict

    def update_resource_list_with_consolidated_resource(self, new_resources, CLASS):
        node_resources = self.get_node_resources()
        for new_resource in new_resources:
            # Update existing resource in resource list
            existing_resources = [
                r
                for r in node_resources
                if r["resource_nodes"][0]["class_label"]
                == CLASS["consolidated_class_label"]
                and r["resource_nodes"][0]["parent_node"].get("class_label")
                == new_resource["resource_nodes"][0]["parent_node"].get("class_label")
            ]
            if len(existing_resources):
                existing_resource = existing_resources[0]
                existing_resource["consolidated_resource_nodes"].extend(
                    new_resource["consolidated_resource_nodes"]
                )
                continue

            # Add new resource to resource list
            self.update_resource_list(new_resource)
            continue

    def get_new_consolidated_resource(
        self, resource_nodes, CLASS, parent_node_class_label=None
    ):
        resource_node_label = CLASS["consolidated_label"]
        resource_node_class_label = CLASS["consolidated_class_label"]
        if parent_node_class_label is not None and parent_node_class_label not in [
            self.provider
        ]:
            resource_node_label = f"{parent_node_class_label}.{resource_node_label}"
            resource_node_class_label = (
                f"{parent_node_class_label}.{resource_node_class_label}"
            )

        new_resource_node = self.TerraformResourceNodeManager.get_new_resource_node(
            resource_node_label=resource_node_label,
            resource_node_class_label=resource_node_class_label,
        )
        new_resource_node["is_consolidated"] = True
        new_resource_node["is_identified"] = True
        new_resource_node["parent_node"] = {"class_label": parent_node_class_label}

        if parent_node_class_label is None:
            consolidated_resource_nodes = [
                n
                for n in resource_nodes
                if CLASS["consolidated_class_label"] != n["class_label"]
                and n["parent_node"].get("class_label") is None
            ]
        else:
            consolidated_resource_nodes = [
                n
                for n in resource_nodes
                if CLASS["consolidated_class_label"] != n["class_label"]
                and n["parent_node"].get("class_label") == parent_node_class_label
            ]
        if not len(consolidated_resource_nodes):
            return None
        consolidated_tosca_types = [
            {
                "consolidated_resource_node_class_label": n["class_label"],
                "tosca_type": n["tosca_type"],
            }
            for n in consolidated_resource_nodes
        ]
        return {
            **self.get_new_resource("node"),
            "parent_node": {"class_label": parent_node_class_label},
            "resource_nodes": [new_resource_node],
            "consolidated_resource_nodes": consolidated_resource_nodes,
            "consolidated_tosca_types": consolidated_tosca_types,
        }

    def remove_node_resources_with_consolidated_nodes(self):
        resource_node_class_labels_consolidated = [
            n["class_label"] for n in self.resource_nodes_consolidated
        ]
        resources_not_consolidated = [
            r
            for r in self.resource_list
            if r["resource_nodes"][0]["class_label"]
            not in resource_node_class_labels_consolidated
        ]
        self.resource_list.clear()
        self.resource_list.extend(resources_not_consolidated)

    def update_resource_nodes_consolidated(self):
        resource_nodes_combined = self.get_resource_nodes_combined()
        CONSOLIDATED_NODE_CLASS_LABEL_LIST = []
        for CLASS in self.CONSOLIDATED_NODE_CLASSES:
            CONSOLIDATED_NODE_CLASS_LABEL_LIST.extend(CLASS["class_label_list"])

        resource_nodes_consolidated = (
            self.get_resource_nodes_filtered_by_primary_class_match(
                resource_nodes_combined, CONSOLIDATED_NODE_CLASS_LABEL_LIST
            )
        )

        self.resource_nodes_consolidated = resource_nodes_consolidated

    def consolidate_node_resources(self):
        self.update_resource_nodes_consolidated()
        if not len(self.resource_nodes_consolidated):
            logger.info("[ ARCH-DIAGRAM ] No match found from aws consolidated nodes.")
            return self

        # Remove resource from resource list
        self.remove_node_resources_with_consolidated_nodes()

        consolidated_node_count = 0
        for CLASS in self.CONSOLIDATED_NODE_CLASSES:
            consolidated_resource_nodes = (
                self.get_resource_nodes_filtered_by_primary_class_match(
                    self.resource_nodes_consolidated, CLASS["class_label_list"]
                )
            )
            if not len(consolidated_resource_nodes):
                continue

            consolidated_node_dict_by_class = self.get_consolidated_node_dict(
                consolidated_resource_nodes
            )
            new_resources = []
            for parent_node_class_label in consolidated_node_dict_by_class:
                new_resource = self.get_new_consolidated_resource(
                    consolidated_resource_nodes,
                    CLASS=CLASS,
                    parent_node_class_label=parent_node_class_label,
                )
                if new_resource is None:
                    continue
                new_resources.append(new_resource)
                consolidated_node_count += 1

            self.update_resource_list_with_consolidated_resource(
                new_resources, CLASS=CLASS
            )
            continue

        if consolidated_node_count == 0:
            logger.info("[ ARCH-DIAGRAM ] No match found for consolidated nodes.")
            return self

        logger.info(
            f"[ ARCH-DIAGRAM ] {len(self.resource_nodes_consolidated)} nodes consolidated into {consolidated_node_count} nodes."
        )
        return self

    def consolidate_edge_resources(self):
        if not len(self.resource_nodes_consolidated):
            return self

        edge_resources = self.get_edge_resources()
        resource_node_class_labels_consolidated = [
            n["class_label"] for n in self.resource_nodes_consolidated
        ]
        node_resources_consolidated = [
            r for r in self.resource_list if len(r["consolidated_resource_nodes"]) > 0
        ]
        for edge_resource in edge_resources:
            for edge_resource_node in edge_resource["resource_nodes"]:
                edge_resource_node_class_label = edge_resource_node["class_label"]
                if (
                    edge_resource_node_class_label
                    not in resource_node_class_labels_consolidated
                ):
                    continue
                specific_resource_nodes = [
                    r["resource_nodes"][0]
                    for r in node_resources_consolidated
                    if any(
                        n["class_label"] == edge_resource_node_class_label
                        for n in r["consolidated_resource_nodes"]
                    )
                ]
                if not len(specific_resource_nodes):
                    err = f"specific_node_resources matching class_label {edge_resource_node_class_label} not found"
                    logger.error(err)
                    raise InternalServerError(err)

                specific_resource_node = specific_resource_nodes[0]
                specific_resource_node.pop("type", None)
                for key in specific_resource_node:
                    edge_resource_node[key] = specific_resource_node[key]
                continue
            continue
        return self

    def consolidate_resources(self, CONSOLIDATED_NODE_CLASSES, print_metrics=False):
        logger.info("[ ARCH-DIAGRAM ] " + "=" * 50)
        logger.info("[ ARCH-DIAGRAM ] Running consolidate_resources ...")

        self.CONSOLIDATED_NODE_CLASSES = CONSOLIDATED_NODE_CLASSES
        self.consolidate_node_resources()
        self.consolidate_edge_resources()
        if print_metrics:
            self.print_resource_list("consolidate_resources")
        return self
