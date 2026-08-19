import glob
import json
import logging
import os

from service.constants.dot_parser import GRAPH_DIR

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import InternalServerError

from .config.cloud_config import (
    AWS_AUTO_ANNOTATIONS,
    AWS_AUTO_LINKS,
    AWS_CONSOLIDATED_NODES,
    AWS_EDGE_NODES,
    AWS_GROUP_NODES,
    AWS_IMPLIED_CONNECTIONS,
    AWS_OUTER_NODES,
    AWS_REVERSE_ARROW_LIST,
    AWS_SHARED_SERVICES,
    AWS_SPECIAL_RESOURCES,
)
from .config.cloud_config_exclude import EXCLUDE_RESOURCE
from .config.cloud_config_include import INCLUDE_RESOURCE
from .file_processor.dot_file_processor import DotFileProcessor
from .file_writers.react_json import ReactJSON
from .graph_processor.graph_processor import GraphProcessor
from .graph_processor.resource_node_manager import (
    DotGraphResourceType,
    NodeSpecialClass,
    ResourceNodeManager,
)

logger = logging.getLogger(__name__)


class DotParser:
    def __init__(self):
        pass

    @staticmethod
    @raise_exception(
        "Failed to set default.",
        exception_logger=logger,
    )
    def set_default(obj):
        if isinstance(obj, set):
            return list(obj)
        raise TypeError

    @raise_exception(
        "Failed to draw reactJson.",
        exception_logger=logger,
    )
    def draw_reactJson(
        self,
        file_out,
        tfStorage,
        provider,
        group_dict,
        edges,
        resource_list,
    ):
        react_json = ReactJSON(
            edges=edges,
            group_dict=group_dict,
            provider=provider,
            tfStorage=tfStorage,
            resource_list=resource_list,
        )
        data = react_json.create()

        # path of json output file
        with open(file_out, "w+", encoding="utf-8") as fout:
            json.dump(data, fout, indent=4, default=self.set_default)

        return data

    @raise_exception(
        "Failed to create tf dict.",
        exception_logger=logger,
    )
    def create_tf_dict(self, td):
        import hcl2

        os.chdir(td)
        oneLine = ""
        for tfFile in glob.glob("*.tf"):
            with open(tfFile) as f:
                for line in f:
                    oneLine += line
        tfStorage = hcl2.loads(oneLine)
        return tfStorage

    @raise_exception(
        "Failed to execute merge.",
        exception_logger=logger,
    )
    def merge(self, a, b, path=None):
        "merges b into a"
        if path is None:
            path = []
        for key in b:
            if key in a:
                if isinstance(a[key], dict) and isinstance(b[key], dict):
                    self.merge(a[key], b[key], path + [str(key)])
                elif a[key] == b[key]:
                    pass  # same leaf value
                else:  # same key different value
                    raise Exception("Conflict at " + ".".join(path + [str(key)]))
            else:
                a[key] = b[key]
        return a

    @raise_exception(
        "Failed to execute list to dict.",
        exception_logger=logger,
    )
    def listToDict(self, tfStorage: dict):
        for k in tfStorage:
            if isinstance(tfStorage[k], list):
                if len(tfStorage[k]) > 1:
                    temp = {}
                    for element in tfStorage[k]:
                        temp = self.merge(temp, element)
                    tfStorage[k] = temp
                else:
                    tfStorage[k] = tfStorage[k][0]
        return tfStorage

    @raise_exception(
        "Failed to update subgroups.",
        exception_logger=logger,
    )
    def update_subgroups(
        self,
        node_resources,
        provider,
        group_dict,
    ):
        subgroup_class_labels = []
        resources_in_subgroups = [
            r
            for r in node_resources
            if r["resource_nodes"][0]["parent_node"] is not None
            and r["resource_nodes"][0]["parent_node"].get("class_label")
            not in [provider]
            and not r["resource_nodes"][0]["is_group"]
            and r["resource_nodes"][0]["special_class"]
            is not NodeSpecialClass.provider.value
        ]
        for r in resources_in_subgroups:
            resource_node = r["resource_nodes"][0]
            class_label = resource_node["class_label"]
            parent_node_class_label_address = resource_node["parent_node"][
                "class_label"
            ].replace(f"{DotGraphResourceType.module.value}.", "")
            subgroup_class_labels.append(class_label)

            node_address = f"root.{provider}.{parent_node_class_label_address}"
            if group_dict.get(node_address) is None:
                group_dict[node_address] = [
                    {
                        "special_class": None,
                        "node_type": "default",
                        "child_node_labels": [class_label],
                    }
                ]
                continue
            group_dict[node_address][0]["child_node_labels"].append(class_label)
            continue
        return subgroup_class_labels

    @raise_exception(
        "Failed to update drawing params.",
        exception_logger=logger,
    )
    def update_drawing_params(
        self,
        resource_list,
        provider,
        group_dict,
    ):
        group_dict["root"] = []
        group_dict[f"root.{provider}"] = []
        node_resources = [r for r in resource_list if r["resource_type"] == "node"]
        classified_class_labels = []

        group_dict["root"].append(
            {
                "special_class": NodeSpecialClass.provider.value,
                "node_type": "clusterNode",
                "child_node_labels": [provider],
            }
        )
        subgroup_class_labels = self.update_subgroups(
            node_resources,
            provider=provider,
            group_dict=group_dict,
        )
        if len(subgroup_class_labels):
            classified_class_labels.extend(subgroup_class_labels)

        outer_resource_class_labels = [
            r["resource_nodes"][0]["class_label"]
            for r in node_resources
            if r["resource_nodes"][0]["special_class"] == NodeSpecialClass.outer.value
            and r["resource_nodes"][0]["class_label"] not in classified_class_labels
        ]
        if len(outer_resource_class_labels):
            group_dict["root"].append(
                {
                    "special_class": NodeSpecialClass.outer.value,
                    "node_type": "default",
                    "child_node_labels": outer_resource_class_labels,
                }
            )
            classified_class_labels.extend(outer_resource_class_labels)

        group_module_node_resource_class_labels = [
            r["resource_nodes"][0]["class_label"]
            for r in node_resources
            if r["resource_nodes"][0]["special_class"]
            == NodeSpecialClass.group_module.value
            and r["resource_nodes"][0]["class_label"] not in classified_class_labels
        ]
        if len(group_module_node_resource_class_labels):
            group_dict[f"root.{provider}"].append(
                {
                    "special_class": NodeSpecialClass.group_module.value,
                    "node_type": "clusterNode",
                    "child_node_labels": group_module_node_resource_class_labels,
                }
            )
            classified_class_labels.extend(group_module_node_resource_class_labels)

        edge_resource_class_labels = [
            r["resource_nodes"][0]["class_label"]
            for r in node_resources
            if r["resource_nodes"][0]["special_class"] == NodeSpecialClass.edge.value
            and r["resource_nodes"][0]["class_label"] not in classified_class_labels
        ]
        if len(edge_resource_class_labels):
            group_dict[f"root.{provider}"].append(
                {
                    "special_class": NodeSpecialClass.edge.value,
                    "node_type": "default",
                    "child_node_labels": edge_resource_class_labels,
                }
            )
            classified_class_labels.extend(edge_resource_class_labels)

        standalone_resource_class_labels = [
            r["resource_nodes"][0]["class_label"]
            for r in node_resources
            if not r["resource_nodes"][0]["is_group"]
            and r["resource_nodes"][0]["class_label"] not in classified_class_labels
            and r["resource_nodes"][0]["parent_node"].get("class_label") == provider
        ]
        # standalone_resource_tosca_types = [
        #     r["resource_nodes"][0]["tosca_type"]
        #     for r in node_resources
        #     if r["resource_nodes"][0]["class_label"] in standalone_resource_class_labels
        # ]
        if len(standalone_resource_class_labels):
            group_dict[f"root.{provider}"].append(
                {
                    "special_class": NodeSpecialClass.standalone.value,
                    "node_type": "default",
                    "child_node_labels": standalone_resource_class_labels,
                }
            )
            classified_class_labels.extend(standalone_resource_class_labels)

        unclassified_class_labels = [
            r["resource_nodes"][0]["class_label"]
            for r in node_resources
            if r["resource_nodes"][0]["class_label"] not in classified_class_labels
            and r["resource_nodes"][0]["special_class"] != "provider"
        ]
        if len(unclassified_class_labels):
            group_dict["root"].append(
                {
                    "special_class": NodeSpecialClass.unclassified.value,
                    "node_type": "default",
                    "child_node_labels": unclassified_class_labels,
                }
            )

    @raise_exception(
        "Failed to retrieve resource list from graph.",
        exception_logger=logger,
    )
    def get_resource_list_from_graph(
        self,
        graph,
        out_filename,
    ):
        TerraformResourceNodeManager = ResourceNodeManager(
            IMPLIED_CONNECTION_CLASSES=AWS_IMPLIED_CONNECTIONS,
            INCLUDED_CLASSES=INCLUDE_RESOURCE,
            EXCLUDED_CLASSES=EXCLUDE_RESOURCE,
            SPECIAL_RESOURCE_CLASSES=AWS_SPECIAL_RESOURCES,
            OUTER_NODE_CLASSES=AWS_OUTER_NODES,
            EDGE_NODE_CLASSES=AWS_EDGE_NODES,
            SHARED_SERVICE_CLASSES=AWS_SHARED_SERVICES,
            GROUP_NODE_CLASSES=AWS_GROUP_NODES,
        )
        TerraformGraphProcessor = GraphProcessor(
            graph,
            asset_directory=GRAPH_DIR,
            out_filename=out_filename,
            TerraformResourceNodeManager=TerraformResourceNodeManager,
        )
        TerraformGraphProcessor.parse_graph(
            print_metrics=False,
        )

        # Remove excluded resource
        TerraformGraphProcessor.remove_excluded_resources(
            print_metrics=False,
        )

        # Update graph provider
        TerraformGraphProcessor.update_provider()

        # Add auto annotation resources. Exclude modules.
        TerraformGraphProcessor.add_resources_from_auto_annotations(
            AUTO_ANNOTATION_CLASSES=AWS_AUTO_ANNOTATIONS,
            print_metrics=False,
        )

        # Add auto link resources. This searches for nodes in the resource list to draw links.
        TerraformGraphProcessor.add_resources_from_auto_links(
            AUTO_LINK_CLASSES=AWS_AUTO_LINKS,
            print_metrics=False,
        )

        # Fix directions of arrows
        TerraformGraphProcessor.reverse_edge_direction(
            REVERSE_ARROW_LIST=AWS_REVERSE_ARROW_LIST,
            print_metrics=False,
        )

        # Consolidate/merge resource nodes and edges
        TerraformGraphProcessor.consolidate_resources(
            CONSOLIDATED_NODE_CLASSES=AWS_CONSOLIDATED_NODES,
            print_metrics=False,
        )

        # Remove self-directed edges
        TerraformGraphProcessor.remove_self_directed_edges(
            print_metrics=False,
        )

        # Remove edges with group nodes
        TerraformGraphProcessor.remove_edges_with_group_nodes(
            print_metrics=False,
        )

        # Remove duplicate connections
        TerraformGraphProcessor.remove_duplicate_edges(
            print_metrics=False,
        )

        # Add missing parent clusterNodes
        TerraformGraphProcessor.add_missing_group_resource(
            print_metrics=False,
        )

        # result
        resource_list = TerraformGraphProcessor.resource_list

        source_targets_dict = TerraformGraphProcessor.source_targets_dict
        provider = TerraformGraphProcessor.provider
        return resource_list, source_targets_dict, provider

    @raise_exception(
        "Failed to parse dot file.",
        exception_logger=logger,
    )
    def parseDot(
        self,
        in_filename,
        out_filename,
        tf_filename,
        TERRAFORM_FILES_DIR,
        WORKING_DIR,
    ):
        """
        Parses a DOT (graph description language) file and generates a JSON representation.

        This function takes a DOT file as input, processes it to extract the graph data, and generates a JSON
        representation of the graph. It also creates a dictionary of Terraform files and writes it to a JSON file.

        Args:
            in_filename (str): The name of the input DOT file.
            out_filename (str): The name of the output JSON file.
            tf_filename (str): The name of the output JSON file for the Terraform files dictionary.
            TERRAFORM_FILES_DIR (str): The directory where the Terraform files are located.
            WORKING_DIR (str): The working directory for the function.

        Returns:
            tuple: A tuple containing the data of the generated JSON representation (dict) and the provider (str).

        Raises:
            InternalServerError: If the input or output filename is None, or if the provider is not found.
        """
        if in_filename is None or out_filename is None:
            raise InternalServerError("file_in or file_out is undefined.")

        TerraformDotFileProcessor = DotFileProcessor(
            in_filename,
            WORKING_DIR,
        )
        TerraformDotFileProcessor.parse_dot_file()
        graphs = TerraformDotFileProcessor.graphs

        # indivResource = []
        # outerResource = []
        # edgeResource = []
        group_dict = {}
        provider = ""
        for index, graph in enumerate(graphs):
            resource_list_filename = (
                f"resource_list_{graph.get('graph_id', index)}.json"
            )
            resource_list, edges, _provider = self.get_resource_list_from_graph(
                graph, resource_list_filename
            )

            if _provider is not None:
                provider = f"{_provider}"
                resource_list_filename = f"resource_list_{provider}.json"

            self.update_drawing_params(
                resource_list,
                provider,
                # indivResource=indivResource,
                # outerResource=outerResource,
                # edgeResource=edgeResource,
                group_dict=group_dict,
            )
            # write resource_list to json
            with open(f"{WORKING_DIR}/{resource_list_filename}", "w+") as outfile:
                json.dump(resource_list, outfile)

            # write group_dict to json
            with open(
                f"{WORKING_DIR}/resource_list_{provider}_group_dict.json", "w+"
            ) as outfile:
                json.dump(group_dict, outfile)

        if provider is None:
            raise InternalServerError("provider not found.")
        # raise InternalServerError("breaker")

        # draw dotGraph
        # dot_graph_generator = DotGraphGenerator()
        # dot_graph_generator.draw_dotGraph(
        #     file_out,
        #     outerResource,
        #     provider,
        #     edgeResource,
        #     indivResource,
        #     grping,
        #     subGroups,
        #     edges,
        # )

        # getting arguments
        tfStorage = self.create_tf_dict(TERRAFORM_FILES_DIR)
        tfStorage = self.listToDict(tfStorage)
        with open(f"{WORKING_DIR}/{tf_filename}", "w+") as outfile:
            json.dump(tfStorage, outfile)

        current_directory = os.path.dirname(
            os.path.abspath(__file__)
        )  # get directory where this script is located
        os.chdir(current_directory)
        # draw reactflow json
        data = self.draw_reactJson(
            f"{WORKING_DIR}/{out_filename}",
            tfStorage=tfStorage,
            provider=provider,
            group_dict=group_dict,
            edges=edges,
            resource_list=resource_list,
        )

        return data, provider
