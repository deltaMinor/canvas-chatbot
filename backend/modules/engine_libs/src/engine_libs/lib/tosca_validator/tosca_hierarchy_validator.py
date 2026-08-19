from __future__ import annotations

import os

from engine_libs.lib.tosca_ontology_loader import ToscaOntologyLoader

from .helper_classes import (
    HierarchyValidityInfo,
    NodeForHierarchyInfo,
    RuleInfo,
)


class ToscaHierarchyValidator:
    def __init__(self, directory: str | None = None):
        self.directory = directory or os.path.dirname(os.path.abspath(__file__))

    def check_node_validity(
        self,
        node_info: NodeForHierarchyInfo,
        parent_node_info: NodeForHierarchyInfo,
        hrules_dict: dict[str, RuleInfo],
    ) -> HierarchyValidityInfo:
        """
        Check whether the child node follows the tosca hierarchy relationship rules.
        """
        if node_info.parent_node and parent_node_info:
            tosca_type_of_parent_node = parent_node_info.tosca_type
            hrule = hrules_dict.get(node_info.tosca_type)
            parent_expected_by_hrule = None

            if hrule is not None:
                parent_expected_by_hrule = hrule.source

            if (
                isinstance(parent_expected_by_hrule, list)
                and tosca_type_of_parent_node in parent_expected_by_hrule
            ):
                validity_info = HierarchyValidityInfo(
                    nodeId=node_info.id,
                    description=f"PASS: {node_info.label}({node_info.tosca_type}) has parent of type {tosca_type_of_parent_node}.",
                    priority=0,
                    title=f"PASS: {node_info.label}({node_info.tosca_type}) has parent of type {tosca_type_of_parent_node}.",
                )
            else:
                validity_info = HierarchyValidityInfo(
                    nodeId=node_info.id,
                    description=f"FAIL: {node_info.label}({node_info.tosca_type}) cannot have parent of type {tosca_type_of_parent_node}.",
                    priority=10,
                    title=f"FAIL: {node_info.label}({node_info.tosca_type}) cannot have parent of type {tosca_type_of_parent_node}.",
                )
        else:
            validity_info = HierarchyValidityInfo(
                nodeId=node_info.id,
                description=f"FAIL: {node_info.label}({node_info.tosca_type}) cannot be standalone.",
                priority=10,
                title=f"FAIL: {node_info.label}({node_info.tosca_type}) cannot be standalone.",
            )
        return validity_info.__dict__()

    def check_hier_validity(
        self,
        node_info_dict: dict[str, NodeForHierarchyInfo],
        hrules_dict: dict[str, RuleInfo],
    ) -> list[HierarchyValidityInfo]:
        """
        Iterate over every node and check whether it follows hierarchy rules.
        """
        tosca_report = []
        for node_info in node_info_dict.values():
            if (
                node_info.tosca_type == "arcs.nodes.Network.VPC"
                or node_info.tosca_type == "arcs.nodes.Internet"
            ):
                continue
            parent_node_info = node_info_dict.get(node_info.parent_node)
            if parent_node_info:
                tosca_report.append(
                    self.check_node_validity(node_info, parent_node_info, hrules_dict)
                )
        tosca_report = [
            hierarchyValidityInfo
            for hierarchyValidityInfo in tosca_report
            if hierarchyValidityInfo["result"] != "PASS"
        ]
        return tosca_report

    def check_diagram_validity(self, canvas_data: dict):
        """
        Initialise NodeForHierarchyInfo objects to generate HierarchyValidityInfo objects.
        """
        node_info_dict = {}
        nodes = canvas_data["nodes"]
        for node in nodes:
            node_data = node["data"]
            node_info = NodeForHierarchyInfo(
                node["id"],
                node_data["tosca_type"],
                node_data["label"],
                node["parentId"],
            )
            node_info_dict[node["id"]] = node_info

        hrules_file = os.path.join(self.directory, "hier_rules.json")
        hrules_dict = ToscaOntologyLoader.read_hrules_json(hrules_file)

        return self.check_hier_validity(node_info_dict, hrules_dict)


def check_node_validity(
    node_info: NodeForHierarchyInfo,
    parent_node_info: NodeForHierarchyInfo,
    hrules_dict: dict[str, RuleInfo],
) -> HierarchyValidityInfo:
    return ToscaHierarchyValidator().check_node_validity(
        node_info, parent_node_info, hrules_dict
    )


def check_hier_validity(
    node_info_dict: dict[str, NodeForHierarchyInfo],
    hrules_dict: dict[str, RuleInfo],
) -> list[HierarchyValidityInfo]:
    return ToscaHierarchyValidator().check_hier_validity(node_info_dict, hrules_dict)


def check_diagram_validity(canvas_data: dict):
    return ToscaHierarchyValidator().check_diagram_validity(canvas_data)
