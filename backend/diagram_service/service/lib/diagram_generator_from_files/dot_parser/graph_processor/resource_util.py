import logging
from collections import defaultdict

from service.lib.diagram_generator_from_files.dot_parser.dot_parser_util import (
    DotParserUtil,
)

from shared_libs.exceptions.api_exceptions import InternalServerError

from .resource_node_manager import DotGraphResourceType

logger = logging.getLogger(__name__)


class ResourceUtilities(DotParserUtil):
    """
    A utility class for managing resources.

    This class inherits from the `DotParserUtil` class and provides additional methods for managing resources. It maintains a list of resources and provides methods for getting the visibility of a resource and creating a new resource.

    Attributes:
        resource_list (list): The list of resources managed by this utility.
        asset_directory (str): The directory where assets are stored.
        out_filename (str): The name of the output file.
        provider (str): The provider of the resources.
    """

    def __init__(
        self,
        resource_list,
        asset_directory,
        out_filename,
    ):
        """
        Initializes a new instance of the `ResourceUtilities` class.

        Args:
            resource_list (list): The list of resources to manage.
            asset_directory (str): The directory where assets are stored.
            out_filename (str): The name of the output file.
        """
        self.resource_list = resource_list
        self.asset_directory = asset_directory
        self.out_filename = out_filename
        self.provider = None
        DotParserUtil.__init__(self)

    @staticmethod
    def get_resource_visiblity(resource):
        """
        Determines the visibility of a resource.

        This method checks the 'is_included' attribute of each resource node in the resource. If all nodes are included and none of them is a group, the resource is visible. If any node is a group or not all nodes are included, the resource is not visible.

        Args:
            resource (dict): The resource to check.

        Returns:
            bool: True if the resource is visible, False otherwise.
        """
        resource_nodes = resource["resource_nodes"]
        resource_nodes_visibility = [n["is_included"] for n in resource_nodes]
        if (
            any(n["is_group"] for n in resource_nodes)
            and resource["resource_type"] == "edge"
        ):
            return False
        return all(resource_nodes_visibility)

    @staticmethod
    def get_new_resource(resource_type):
        """
        Creates a new resource.

        This method creates a new resource with the specified resource type. The new resource has empty lists for 'consolidated_resource_nodes', 'graph_attributes', 'graph_nodes', 'resource_attributes', and 'resource_nodes'. It also has 'resource_directed' set to False if the resource type is 'node' and True otherwise.

        Args:
            resource_type (str): The type of the new resource.

        Returns:
            dict: The new resource.
        """
        return {
            "consolidated_resource_nodes": [],
            "graph_attributes": [],
            "graph_nodes": [],
            "resource_attributes": [],
            "resource_directed": False if resource_type == "node" else True,
            "resource_nodes": [],
            "resource_type": resource_type,
        }

    def get_node_resources(self):
        """
        Retrieves all node resources from the resource list.

        This method iterates over the resources in `self.resource_list` and yields each resource where the resource type is "node".

        Returns:
            generator: A generator yielding all node resources from the resource list.
        """
        return (r for r in self.resource_list if r["resource_type"] == "node")

    def get_edge_resources(self):
        """
        Retrieves all edge resources from the resource list.

        This method iterates over the resources in `self.resource_list` and yields each resource where the resource type is "edge".

        Returns:
            generator: A generator yielding all edge resources from the resource list.
        """
        return (r for r in self.resource_list if r["resource_type"] == "edge")

    def replace_resource_list(self, new_resource_list):
        """
        Replaces the current resource list with a new one.

        This method first clears the current resource list. It then adds all resources from `new_resource_list` to the current resource list.

        Args:
            new_resource_list (list): The new resource list to replace the current one.
        """
        self.resource_list.clear()
        self.resource_list += new_resource_list

    def replace_edge_resources(self, edge_resources):
        """
        Replaces the edge resources in the current resource list.

        This method first updates the 'is_visible' attribute of each edge resource by calling the `get_resource_visiblity` method. It then retrieves all node resources from the current resource list by calling the `get_node_resources` method. After that, it clears the current resource list and adds the node resources and updated edge resources to it.

        Args:
            edge_resources (list): The new edge resources to replace the current ones.
        """
        edge_resources = [
            {
                **edge_resource,
                "is_visible": self.get_resource_visiblity(edge_resource),
            }
            for edge_resource in edge_resources
        ]
        node_resources = self.get_node_resources()
        self.resource_list.clear()
        self.resource_list += node_resources + edge_resources

    def update_resource_list(self, new_resource):
        """
        Updates the resource list with a new resource.

        This method first updates the 'is_visible' attribute of the new resource by calling the `get_resource_visiblity` method. It then appends the new resource to `self.resource_list`.

        Args:
            new_resource (dict): The new resource to add to the resource list.
        """
        new_resource["is_visible"] = self.get_resource_visiblity(new_resource)
        self.resource_list.append(new_resource)

    def get_resource_nodes_combined(self):
        """
        Retrieves the first resource node from each resource in the resource list.

        This method first retrieves all node resources from `self.resource_list` by calling the `get_node_resources` method. It then returns a list of the first resource node from each node resource.

        Returns:
            list: A list of the first resource node from each node resource in the resource list.
        """
        node_resources = self.get_node_resources()
        return [r["resource_nodes"][0] for r in node_resources]

    def get_resource_nodes_filtered_by_class_label_match(
        self,
        resource_nodes,
        prefix_list,
    ):
        """
        Filters the resource nodes based on the class label match.

        This method iterates over the `resource_nodes` list. For each node, it checks if the node's class label matches any prefix in the `prefix_list` by calling the `is_prefix_match` method. If the class label matches, the node is included in the returned list.

        Args:
            resource_nodes (list): The list of resource nodes to filter.
            prefix_list (list): The list of prefixes to match against the class label of the nodes.

        Returns:
            list: A list of nodes where the class label matches any prefix in the `prefix_list`.
        """
        return [
            node
            for node in resource_nodes
            if self.is_prefix_match(prefix_list, node["class_label"])
        ]

    def get_resource_nodes_filtered_by_primary_class_match(
        self,
        resource_nodes,
        ref_class_label_list,
    ):
        """
        Filters the resource nodes based on the primary class match.

        This method iterates over the `resource_nodes` list. For each node, it checks if the node's primary class exactly matches any class in the `ref_class_label_list` by calling the `is_exact_match` method. If the primary class matches, the node is included in the returned list.

        Args:
            resource_nodes (list): The list of resource nodes to filter.
            ref_class_label_list (list): The list of class labels to match against the primary class of the nodes.

        Returns:
            list: A list of nodes where the primary class exactly matches any class in the `ref_class_label_list`.
        """
        return [
            node
            for node in resource_nodes
            if self.is_exact_match(ref_class_label_list, node["primary_class"])
        ]

    def check_duplicate_label(self):
        """
        Checks for duplicate labels in the resource nodes.

        This method iterates over all the resources returned by the `get_node_resources` method.
        For each resource, it iterates over the nodes in the `resource_nodes` list and counts the occurrences of each label.
        If it finds a label that occurs more than once, it logs a message and stops checking.
        If it checks all labels and does not find any duplicates, it logs a different message.

        This method does not return a value.
        """
        label_counts = defaultdict(int)

        for r in self.get_node_resources():
            for n in r["resource_nodes"]:
                label_counts[n["class_label"]] += 1

        for label, count in label_counts.items():
            if count > 1:
                logger.warning(f"> Duplicates found. {label}. count {count}.")
                break
        else:
            logger.info("[ ARCH-DIAGRAM ] > No duplicate found.")

    def print_resource_list(self, title):
        """
        Prints a summary of the resources and writes the resource list to a file.

        This method calculates the total count of resources, nodes, edges, and groups in the resource list.
        After logging the counts, it checks for duplicate labels in the resource nodes by calling the `check_duplicate_label` method.
        Finally, it writes the resource list to a file by calling the `write_file` method.

        Args:
            title (str): The title to be used in the filename of the output file.

        This method does not return a value.
        """
        resource_list_len = len(self.resource_list)
        node_resources = list(self.get_node_resources())
        edge_resources = list(self.get_edge_resources())
        total_group_count = sum(
            1
            for r in self.resource_list
            if any(n["is_group"] for n in r["resource_nodes"])
        )

        logger.info("[ ARCH-DIAGRAM ] Resource Summary:")
        logger.info(f"[ ARCH-DIAGRAM ] > total resource count: {resource_list_len},")
        logger.info(
            f"[ ARCH-DIAGRAM ] > total node count: {len(node_resources)} / {resource_list_len},"
        )
        logger.info(
            f"[ ARCH-DIAGRAM ] > total edge count: {len(edge_resources)} / {resource_list_len},"
        )
        logger.info(f"[ ARCH-DIAGRAM ] > total group count: {total_group_count},")

        self.check_duplicate_label()

        self.write_file(
            self.asset_directory,
            f"{self.out_filename}_{title}.json",
            self.resource_list,
        )

    def update_provider(self):
        """
        Retrieves the provider from the graph and updates the instance variable.

        This method iterates over the resources in `self.resource_list`. For each resource, it checks if the resource type is "node" and the base class of the first resource node is "provider". If both conditions are met, it considers the primary class of the first resource node as a provider.

        It then sets `self.provider` to the first provider it finds. If it finds more than one provider, it raises an `InternalServerError`.

        Returns:
            self: Returns the instance of the class.

        Raises:
            InternalServerError: If more than one provider is found in the graph.
        """
        providers = (
            resource["resource_nodes"][0]["primary_class"]
            for resource in self.resource_list
            if resource["resource_type"] == "node"
            and resource["resource_nodes"][0]["classes"]["base_class"]
            == DotGraphResourceType.provider.value
        )

        self.provider = next(providers, None)

        if next(providers, None) is not None:
            raise InternalServerError(f"Multiple providers found. {self.provider}")

        return self
