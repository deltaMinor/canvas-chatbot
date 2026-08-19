import logging
import re

from shared_libs.exceptions.api_exceptions import InternalServerError

from .graph_resource_consolidator import GraphResourceConsolidator
from .graph_resource_extender import GraphResourceExtender
from .graph_resource_fixer import GraphResourceFixer
from .resource_node_manager import ResourceNodeManager

logger = logging.getLogger(__name__)


class GraphProcessor(
    GraphResourceExtender,
    GraphResourceConsolidator,
    GraphResourceFixer,
):
    def __init__(
        self,
        graph,
        asset_directory,
        out_filename,
        TerraformResourceNodeManager: ResourceNodeManager,
    ):
        self.graph = graph
        self.asset_directory = asset_directory
        self.out_filename = out_filename
        self.TerraformResourceNodeManager = TerraformResourceNodeManager
        self.resource_list = []
        GraphResourceExtender.__init__(
            self,
            resource_list=self.resource_list,
            asset_directory=self.asset_directory,
            out_filename=self.out_filename,
            TerraformResourceNodeManager=TerraformResourceNodeManager,
        )
        GraphResourceConsolidator.__init__(
            self,
            resource_list=self.resource_list,
            asset_directory=self.asset_directory,
            out_filename=self.out_filename,
            TerraformResourceNodeManager=TerraformResourceNodeManager,
        )
        GraphResourceFixer.__init__(
            self,
            resource_list=self.resource_list,
            asset_directory=self.asset_directory,
            out_filename=self.out_filename,
            TerraformResourceNodeManager=TerraformResourceNodeManager,
        )

    @staticmethod
    def get_resource_attributes(graph_attributes):
        resource_attributes = []
        if not len(graph_attributes):
            return resource_attributes
        for attr in graph_attributes:
            attr = attr.replace('"', "")
            key, value = attr.split(" = ")
            resource_attributes.append({key: value})
            continue
        return resource_attributes

    @staticmethod
    def get_graph_attributes(graph_row):
        return [
            n.replace('"', "").replace("\\", "").replace(",", "").replace("]", "")
            for n in re.findall(
                r"[a-zA-Z]+ = [\S]+",
                graph_row,
            )
        ]

    def get_resource_nodes(self, graph_nodes, resource_type):
        resource_nodes = []
        for graph_index, graph_node in enumerate(graph_nodes):
            graph_node_class_label = graph_node.split()[1]
            new_resource_node = self.TerraformResourceNodeManager.get_new_resource_node(
                graph_node_class_label,
                graph_node_class_label,
            )

            new_resource_node["type"] = (
                self.TerraformResourceNodeManager.get_resource_node_type(
                    resource_type, graph_index
                )
            )
            resource_nodes.append(new_resource_node)
            continue
        return resource_nodes

    def get_graph_nodes(self, graph_row):
        graph_id = self.graph["graph_id"]
        graph_nodes = [
            n.strip()
            for n in re.findall(
                rf"\[{graph_id}\] [\S]+[\s]*\(*[a-zA-Z]*\)*",
                graph_row,
            )
        ]
        if not len(graph_nodes):
            raise InternalServerError(f"node {graph_row} failed to parse graph_nodes.")
        return graph_nodes

    def parse_graph(self, print_metrics=False):
        logger.info("[ ARCH-DIAGRAM ] " + "=" * 50)
        logger.info("[ ARCH-DIAGRAM ] Running parse_graph ...")
        graph_rows = self.graph["graph_rows"]
        self.write_file(
            self.asset_directory,
            "graph_rows.txt",
            graph_rows,
        )

        for _index, graph_row in enumerate(graph_rows):
            graph_nodes = self.get_graph_nodes(graph_row)
            resource_type = "node" if len(graph_nodes) == 1 else "edge"
            graph_attributes = self.get_graph_attributes(graph_row)
            resource_attributes = self.get_resource_attributes(graph_attributes)
            resource_directed = bool(re.search(r"->", graph_row))
            resource_nodes = self.get_resource_nodes(graph_nodes, resource_type)
            new_resource = {
                "graph_nodes": graph_nodes,
                "resource_type": resource_type,
                "graph_attributes": graph_attributes,
                "resource_attributes": resource_attributes,
                "resource_directed": resource_directed,
                "resource_nodes": resource_nodes,
                "consolidated_resource_nodes": [],
                "consolidated_tosca_types": [],
            }
            self.update_resource_list(new_resource)

        if print_metrics:
            self.print_resource_list("parse_graph")
        return self
