from __future__ import annotations

import logging
import os
from typing import TYPE_CHECKING

from engine_libs.lib.tosca_ontology_loader import ToscaOntologyLoader

from .helper_classes import EdgeInfo, EdgeValidityInfo, NodeForEdgeInfo, RuleInfo

if TYPE_CHECKING:
    from shared_libs.protocols import OntologyProtocol

logger = logging.getLogger(__name__)


class ToscaEdgeValidator:
    def __init__(self, directory: str | None = None):
        self.directory = directory or os.path.dirname(os.path.abspath(__file__))

    def check_edge_validity(
        self,
        onto_data: OntologyProtocol,
        edge_info: EdgeInfo,
        node_info_dict: dict[str, NodeForEdgeInfo],
        rule_info_dict: dict[str, RuleInfo],
    ) -> dict:
        """
        Check whether the edge in the diagram matches any of the tosca relationship rules.
        """
        diagram_edge_target = node_info_dict[edge_info.target]
        diagram_edge_source = node_info_dict[edge_info.source]
        edge_source_within_rule_source_ancestors = False
        if diagram_edge_target.tosca_type in rule_info_dict.keys():
            enforce = rule_info_dict[diagram_edge_target.tosca_type].enforce
        else:
            description = f"{diagram_edge_target.tosca_type} not in rules dict, edge automatically passes"
            title = f"PASS: {diagram_edge_target.tosca_type} not in rules dict, edge automatically passes"
            return EdgeValidityInfo(edge_info.id, 0, description, title).__dict__()

        rule_source_type_list = rule_info_dict[diagram_edge_target.tosca_type].source
        diagram_edge_source_type = node_info_dict[edge_info.source].tosca_type
        validity_info = None
        for rule_source_type in rule_source_type_list:
            rule_source_ancestors = [rule_source_type]

            try:
                rule_source_ancestors.extend(
                    onto_data.get_parents_of(onto_data[rule_source_type])
                )

            except AttributeError as e:
                logger.error("%s does not exist in ontology", rule_source_type)
                logger.error(e)

            if diagram_edge_source_type in rule_source_ancestors:
                edge_source_within_rule_source_ancestors = True

            if edge_source_within_rule_source_ancestors and enforce == "mandatory":
                validity_info = EdgeValidityInfo(
                    edgeId=edge_info.id,
                    description=f"Edge ID {edge_info.id}\n,Traffic from {diagram_edge_source.label} to {diagram_edge_target.label}\nTosca type expected from edge: {rule_source_type_list}\nTosca type of source/parent of source: {diagram_edge_source_type}",
                    title=f"PASS: Traffic from {diagram_edge_source.label} to {diagram_edge_target.label}",
                    priority=0,
                )

            elif edge_source_within_rule_source_ancestors and enforce == "optional":
                validity_info = EdgeValidityInfo(
                    edgeId=edge_info.id,
                    description=f"Edge ID {edge_info.id},\nTraffic from {diagram_edge_source.label} to {diagram_edge_target.label}\nTosca type expected from edge: {rule_source_type_list}\nTosca type of source/parent of source: {diagram_edge_source_type}",
                    title=f"WARN: Traffic from {diagram_edge_source.label} to {diagram_edge_target.label}",
                    priority=4,
                )

            elif not edge_source_within_rule_source_ancestors:
                validity_info = EdgeValidityInfo(
                    edgeId=edge_info.id,
                    description=f"Edge ID {edge_info.id},\nTraffic from {diagram_edge_source.label} to {diagram_edge_target.label}\nTarget type is {diagram_edge_target.tosca_type}. No rules matching",
                    title=f"FAIL: Target type is {diagram_edge_target.tosca_type}. No rules matching",
                    priority=9,
                )

        if not validity_info:
            description = f"{diagram_edge_target.tosca_type} not in rules dict, edge automatically passes"
            title = f"PASS: {diagram_edge_target.tosca_type} not in rules dict, edge automatically passes"
            validity_info = EdgeValidityInfo(edge_info.id, 0, description, title)

        return validity_info.__dict__()

    def check_diagram_validity(self, canvas_data: dict) -> list[EdgeValidityInfo]:
        """
        Initialise EdgeInfo and NodeForEdgeInfo objects to generate EdgeValidityInfo object for each
        edge in canvas_data.
        """
        nodes = canvas_data["nodes"]

        node_info_dict: dict[str, NodeForEdgeInfo] = {}
        for node in nodes:
            node_data = node["data"]
            node_info = NodeForEdgeInfo(
                node["id"], node_data["tosca_type"], node_data["label"]
            )
            node_info_dict[node["id"]] = node_info

        edges = canvas_data["edges"]

        edge_info_list: list[EdgeInfo] = []
        for edge in edges:
            edge_info = EdgeInfo(edge["id"], edge["source"], edge["target"])
            edge_info_list.append(edge_info)

        for node_info in node_info_dict.values():
            for edge_info in edge_info_list:
                if edge_info.target == node_info.id:
                    node_info.previous = edge_info.source
                    node_info.previous_type = [
                        lookup_node.label
                        for lookup_node in node_info_dict.values()
                        if lookup_node.id == edge_info.source
                    ]

        rules_file = os.path.join(self.directory, "prod.rules.json")
        rule_info_dict = ToscaOntologyLoader.read_rules_json(rules_file)
        onto_data = ToscaOntologyLoader().load_for_validator()

        tosca_report = []
        for edge_info in edge_info_list:
            edge_validity_info = self.check_edge_validity(
                onto_data, edge_info, node_info_dict, rule_info_dict
            )
            tosca_report.append(edge_validity_info)
        tosca_report = [
            edgeInfo for edgeInfo in tosca_report if edgeInfo["result"] != "PASS"
        ]
        return tosca_report


def check_edge_validity(
    onto_data: OntologyProtocol,
    edge_info: EdgeInfo,
    node_info_dict: dict[str, NodeForEdgeInfo],
    rule_info_dict: dict[str, RuleInfo],
) -> dict:
    return ToscaEdgeValidator().check_edge_validity(
        onto_data, edge_info, node_info_dict, rule_info_dict
    )


def check_diagram_validity(canvas_data: dict) -> list[EdgeValidityInfo]:
    return ToscaEdgeValidator().check_diagram_validity(canvas_data)
