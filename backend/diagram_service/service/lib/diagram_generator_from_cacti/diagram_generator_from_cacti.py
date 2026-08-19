from .edge import CactiEdge
from .node import CactiNode
from .react_flow.nodes import (
    HIDDEN_NODES,
    SUBNET_TYPES,
    NodeAttributes,
    RelationshipType,
    SpecialTypes,
    TerraformTypes,
)


class DiagramGeneratorFromCacti:
    def __init__(self, json_data):
        """
        Generate React Flow Diagram from CACTi JSON data

        Args:
            json_data: CACTi JSON object
        """
        self.json_data = json_data
        self.json_output = {
            "nodes": [],
            "edges": [],
            "viewport": {"x": 0, "y": 0, "zoom": 1},
        }
        self.nodes: dict[str, CactiNode] = {}
        self.edges: dict[str, CactiEdge] = {}
        # The key is cacti id, not node id
        self.node_id_mapping: dict[str, CactiNode] = {}

    def _add_all_nodes(self):
        """
        Recursively create and store all node objects
        """
        if self.json_data.get("ae_version") is None:
            for terraform_type, type_list in self.json_data.get("architecture").items():
                for _node in type_list:
                    self._add_node(_node, terraform_type)
        else:
            for _node in self.json_data.get("resources", []):
                self._add_node(_node, _node.get("type", ""), ae_version=True)
            for _relationship in self.json_data.get("relationships", []):
                if _relationship.get("type", "") == RelationshipType.CONTAINED_IN.value:
                    child_node = self.node_id_mapping[_relationship.get("start", "")]
                    parent_node = self.node_id_mapping[_relationship.get("end", "")]
                    child_node.parent_node = parent_node
                    # Add subnet id list attribute to nodes that will be moved to VPC
                    if parent_node.terraform_type in SUBNET_TYPES:
                        subnet_ids = child_node.attributes.setdefault("subnet_ids", [])
                        if parent_node.id not in subnet_ids:
                            subnet_ids.append(parent_node.id)
        self._add_availability_zone_nodes()

    def _add_all_edges(self):
        """
        Recursively create and store all edge objects
        """
        if self.json_data.get("ae_version") is None:
            all_connections = list(
                self.json_data.get("connections").get("private").values()
            ) + list(self.json_data.get("connections").get("public").values())
            for _edge in all_connections:
                self._add_edge_without_ae_version(_edge)
        else:
            for _edge in self.json_data.get("relationships", []):
                self._add_edge(_edge)

    def _add_node(
        self,
        node: dict,
        terraform_type: str,
        parent_node: CactiNode = None,
        ae_version: bool = False,
    ):
        """
        Create single node object for CACTi json without ae_version

        Args:
            node: dict containing node's attributes
            terraform_type: terraform type of node
            parent_node (optional): parent node of the current node
        """
        node_obj = CactiNode(node, terraform_type, parent_node, ae_version=ae_version)
        if ae_version:
            self.node_id_mapping[node.get("id", "")] = node_obj
        self.nodes[node_obj.id] = node_obj
        for terraform_type, type_list in node.get("resources", {}).items():
            for _node in type_list:
                self._add_node(_node, terraform_type, node_obj, ae_version)

    def _find_private_subnets(self):
        """
        differentiate between public and private subnets
        """
        subnet_nodes = [
            node
            for node in self.nodes.values()
            if node.terraform_type == TerraformTypes.SUBNET.value
        ]

        if self.json_data.get("ae_version") is None:
            for subnet in subnet_nodes:
                for terraform_type, type_list in self.json_data.get(
                    "architecture"
                ).items():
                    for _node in type_list:
                        self._find_route_table_with_subnet(
                            _node, terraform_type, subnet.id
                        )
        else:
            for subnet in subnet_nodes:
                for _node in self.json_data.get("resources", []):
                    self._find_route_table_with_subnet(
                        _node, _node.get("type", ""), subnet.id
                    )

    def _find_route_table_with_subnet(
        self, node: dict, terraform_type: str, subnet_id: str
    ):
        """
        Recursively search for route table dicts that contain node

        Args:
            node: dict containing a node's attributes
            terraform_type: terraform type of node
            subnet_id: subnet id property of node
        """
        node_attributes = node.get("attributes")
        if terraform_type == TerraformTypes.ROUTE_TABLE.value and _check_attribute(
            node_attributes, NodeAttributes.SUBNET_IDS.value
        ):
            subnet_ids = node_attributes.get(NodeAttributes.SUBNET_IDS.value)

            if subnet_ids and subnet_id not in subnet_ids:
                return

            if _check_attribute(
                node_attributes, NodeAttributes.ROUTE.value
            ) and _check_empty_route(node_attributes.get(NodeAttributes.ROUTE.value)):
                route_attributes = node_attributes[NodeAttributes.ROUTE.value][0]

                if (
                    _check_attribute(route_attributes, NodeAttributes.GATEWAY_ID.value)
                    and route_attributes[NodeAttributes.GATEWAY_ID.value] in self.nodes
                ):
                    gateway_id = route_attributes[NodeAttributes.GATEWAY_ID.value]

                    if (
                        self.nodes[gateway_id].terraform_type
                        == TerraformTypes.IGW.value
                    ):
                        self.nodes.get(subnet_id).set_private_subnet()
            return

        for terraform_type, type_list in node.get("resources", {}).items():
            for _node in type_list:
                self._find_route_table_with_subnet(_node, terraform_type, subnet_id)

    def _add_availability_zone_nodes(self):
        """
        insert availability zone react flow using information from nodes in CACTi json_data
        """
        nodes_with_az = [node for node in self.nodes.values() if node.availability_zone]
        for node in nodes_with_az:
            az_id = node.get_parent().id + node.availability_zone
            if az_id not in self.nodes:
                # initialise az node
                az_node_obj = CactiNode(
                    {
                        "id": az_id,
                        "attributes": {"zone": node.availability_zone},
                    },
                    terraform_type="availability_zone",
                    parent_node=node.get_parent(),
                    is_az=True,
                )
                self.nodes[az_id] = az_node_obj
            # set current node's parent to be the az node object
            node.parent_node = self.nodes[az_id]

    def _add_edge(self, edge: dict):
        """
        Add an edge object for CACTi json with ae_version (latest version)

        Args:
            edge (dict): dict containing edge attributes
        """
        source_node_id = edge.get("start", "")
        target_node_id = edge.get("end", "")
        relationship_type = edge.get("type", "")

        if (
            source_node_id not in self.node_id_mapping
            or target_node_id not in self.node_id_mapping
        ):
            return

        source_node = self.node_id_mapping.get(source_node_id)
        target_node = self.node_id_mapping.get(target_node_id)
        if relationship_type == RelationshipType.CAN_CONNECT.value:
            if (
                target_node.terraform_type == TerraformTypes.ALB.value
                and source_node.terraform_type != TerraformTypes.IGW.value
            ):
                source_node, target_node = target_node, source_node

            source_target_edge_id = f"{source_node.id}.{target_node.id}"

            source_target_edge_obj = CactiEdge(
                source_target_edge_id, edge, source_node, target_node
            )

            if not self._check_bidirectional_edge(source_node, target_node):
                self.edges[source_target_edge_id] = source_target_edge_obj

    def _add_edge_without_ae_version(self, edge: dict):
        """
        add an edge object for CACTi json without ae_version

        Args:
            edge: dict containing edge attributes
        """
        middle_exists = edge.get("middle") is not None

        middle_node_id = edge.get("middle", {}).get("id", "")
        source_node_id = edge.get("start", {}).get("id", "")
        target_node_id = edge.get("end", {}).get("id", "")

        middle_node_type = edge.get("middle", {}).get("type")
        source_node_type = edge.get("start", {}).get("type")
        target_node_type = edge.get("end", {}).get("type")

        # initialise source, middle or target node if any of them are not in the node dict.
        if source_node_id not in self.nodes:
            self.nodes[source_node_id] = CactiNode(
                {"id": source_node_id}, source_node_type
            )
        if middle_exists and middle_node_id not in self.nodes:
            self.nodes[middle_node_id] = CactiNode(
                {"id": middle_node_id}, middle_node_type
            )
        if target_node_id not in self.nodes:
            self.nodes[target_node_id] = CactiNode(
                {"id": target_node_id}, target_node_type
            )

        middle_node = self.nodes.get(middle_node_id)
        source_node = self.nodes.get(source_node_id)
        target_node = self.nodes.get(target_node_id)
        if middle_node:  # if middle exists, split the connection into two edges: source-middle and middle-target
            if (
                middle_node.terraform_type == TerraformTypes.IGW.value
                and source_node.terraform_type != SpecialTypes.INTERNET.value
            ):
                source_node, target_node = target_node, source_node

            source_middle_edge_id = f"{source_node.id}.{middle_node.id}"
            middle_target_edge_id = f"{middle_node.id}.{target_node.id}"

            source_middle_edge_obj = CactiEdge(
                source_middle_edge_id, edge, source_node, middle_node
            )
            middle_target_edge_obj = CactiEdge(
                middle_target_edge_id, edge, middle_node, target_node
            )
            if not self._check_bidirectional_edge(source_node, middle_node):
                self.edges[source_middle_edge_id] = source_middle_edge_obj
            if not self._check_bidirectional_edge(middle_node, target_node):
                self.edges[middle_target_edge_id] = middle_target_edge_obj
        else:
            # switch edge direction if target node is aws_alb and source node is anything other than
            # igw (CACTi Rule)
            if (
                target_node.terraform_type == TerraformTypes.ALB.value
                and source_node.terraform_type != TerraformTypes.IGW.value
            ):
                source_node, target_node = target_node, source_node

            source_target_edge_id = f"{source_node.id}.{target_node.id}"

            source_target_edge_obj = CactiEdge(
                source_target_edge_id, edge, source_node, target_node
            )

            if not self._check_bidirectional_edge(source_node, target_node):
                self.edges[source_target_edge_id] = source_target_edge_obj

    def _check_bidirectional_edge(self, source: CactiNode, target: CactiNode):
        """
        check if an edge between a source and target is bidirectional (occurs twice in opposite
        directions)

        Args:
            source: a CactiNode object that is the source to be checked
            target: a CactiNode object that is the target to be checked
        """
        for edge in self.edges.values():
            if target.id == edge.source.id and source.id == edge.target.id:
                edge.bidirectional = True
                return True
        return False

    def _modify_subnet_terraform_type(self):
        """
        modify subnet terraform type according to whether its private or public
        """
        for node_id, node in self.nodes.items():
            if node.terraform_type == TerraformTypes.SUBNET.value:
                if node.private_subnet:
                    self.nodes[
                        node_id
                    ].terraform_type = TerraformTypes.SUBNET_PRIVATE.value
                else:
                    self.nodes[
                        node_id
                    ].terraform_type = TerraformTypes.SUBNET_PUBLIC.value

    def start_diagram_generation_workflow(self):
        """
        start diagram generation workflow
        """
        self._add_all_nodes()
        self._add_all_edges()
        self._find_private_subnets()
        self._modify_subnet_terraform_type()
        self.json_output["nodes"] = [
            _node.__dict__()
            for _node in self.nodes.values()
            if _node.terraform_type not in HIDDEN_NODES
        ]
        self.json_output["edges"] = [_edge.__dict__() for _edge in self.edges.values()]

    def get_generated_diagram(self):
        """
        retrieve generated react flow diagram

        Returns:
            dict containing the react flow diagram generated
        """
        self.start_diagram_generation_workflow()
        return self.json_output


def _check_attribute(attribute_dict, attribute_searched):
    """
    check whether searched attribute is in the attribute dict

    Args:
        attribute_dict: a dict of attributes
        attribute_searched: an attribute to check in attribute_dict
    """
    return isinstance(attribute_dict, dict) and attribute_searched in attribute_dict


def _check_empty_route(route_list):
    """
    check whether a route in a route table is empty

    Args:
        route_list: list of routes to be checked
    """
    return isinstance(route_list, list) and len(route_list) > 0
