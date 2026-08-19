import copy
import json
import math
import random

from shared_libs.constants.diagram import CONSOLIDATED_CLASS_LABEL_TO_INFONODE_MAPPING

from .constants import uppercase_node_list


class ReactJSON:
    def __init__(
        self,
        edges,
        group_dict,
        provider,
        tfStorage,
        resource_list,
    ):
        # keep track of nodes and edges, will be converted to json later after running self.create()
        self.data = {
            "nodes": [],
            "edges": [],
            "viewport": {"x": 0, "y": 0, "zoom": 1},
        }
        # record of terraform params parsed by hcl2
        self.tfStorage = tfStorage
        self.resource_list = resource_list

        # types of resources
        # self.outerResource = outerResource
        # self.edgeResource = edgeResource
        # self.indivResource = indivResource
        self.provider = provider
        self.group_dict = group_dict

        # edges
        self.edges = edges
        self.counter = 0
        self.node_spacing = 50
        self.min_node_width = 150
        self.forbidden_node_data_keys = ["type"]
        self.initial_x = 0
        self.initial_y = 0

    def create_node(
        self,
        node_id,
        node_type,
        node_data,
        width,
        height,
        x,
        y,
        zIndex,
        parentId=None,
    ):
        """
        collect all node information, including style, id, type, data, x, y and parentId
        """
        r = random.randrange(0, 255)
        g = random.randrange(0, 255)
        b = random.randrange(0, 255)
        clusterNodeColor = f"rgba({r}, {g}, {b}, 0.3)"

        color = "#fff"
        if node_type == "clusterNode" and node_id == self.provider:
            color = clusterNodeColor
        elif node_type == "infoNode":
            color = "rgba(255,255,255,0)"

        new_node = {
            "id": node_id,
            "type": node_type,
            "data": {**node_data, "type": "architecture"},
            "zIndex": zIndex,
            "draggable": False if (node_id == self.provider) else True,
            "position": {
                "x": x,
                "y": y,
            },
            "style": {
                "width": width,
                "height": height,
                "fontFamily": "Roboto Mono",
                "backgroundColor": color,
                "textAlign": "left",
            },
        }
        # check if this node has a parent node
        if parentId:
            new_node["parentId"] = parentId

        self.data["nodes"].append(new_node)
        self.counter += 1

    def add_node(
        self,
        node_id,
        node_data,
        width,
        height,
        x,
        y,
        zIndex,
        node_type="default",
        parentId=None,
    ):
        self.create_node(
            node_id,
            node_type=node_type,
            node_data=node_data,
            width=width,
            height=height,
            x=x,
            y=y,
            zIndex=zIndex,
            parentId=parentId,
        )

    def add_edge(self, source, target, edgeCounter):
        new_edge = self.collect_edge_data(source, target)
        self.data["edges"].append(new_edge)
        return edgeCounter + 1

    def get_node_label_from_node_id(self, node_id):
        split_node_id = node_id.split(".")
        node_label = f"{node_id}"
        if split_node_id[0] == "module" and len(split_node_id) == 2:
            return node_label

        if len(split_node_id) == 1:
            node_label = split_node_id[0]
        # elif len(split_node_id) == 2:
        #     node_label = split_node_id[1]
        elif len(split_node_id) >= 3:
            node_label = split_node_id[2]
        split_node_label = node_label.split("_")

        split_node_label = [
            (word.upper() if word.upper() in uppercase_node_list else word.capitalize())
            for word in split_node_label
        ]
        node_label = " ".join(split_node_label)
        return node_label

    def collect_node_data_without_parent(self, node_id, provider=False):
        nested_keys = []
        data = {}
        if provider:
            keys_in_nested_dict(self.tfStorage["provider"][node_id], nested_keys)

            # retrieve args from tfStorage ( which stores the terraform resource's variables)
            args = self.tfStorage["provider"][node_id]

            # use the args as the data for this node
            data = self.draw_args(nested_keys, args)

        elif "." in node_id:
            keys = node_id.split(".")
            newkeys = process_keys(keys)

            # retrieve args from tfStorage ( which stores the terraform resource's variables)
            args = get_args(newkeys, self.tfStorage)

            # flatten the args dictionary
            keys_in_nested_dict(args, nested_keys)

            # use the flattened args as the data for this node
            data = self.draw_args(nested_keys, args)
        # set the label for this node

        data["class"] = node_id
        data["label"] = self.get_node_label_from_node_id(node_id)

        return data

    def collect_node_data_with_parent(self, node_id):
        nested_keys = []
        data = {}
        if "." in node_id:
            keys = node_id.split(".")
            newkeys = process_keys(keys)

            # retrieve args from tfStorage ( which stores the terraform resource's variables)
            args = get_args(newkeys, self.tfStorage)

            # flatten the args dictionary
            keys_in_nested_dict(args, nested_keys)

            # use the flattened args as the data for this node
            data = self.draw_args(nested_keys, args)

        data["class"] = node_id
        data["label"] = self.get_node_label_from_node_id(node_id)

        return data

    def collect_edge_data(self, source, target):
        if "none" in source:
            source = source.split("(")[0]
        new_edge = {
            "id": f"{source}-{target}",
            "source": f"{source}",
            "target": f"{target}",
            # "label": "architecture",
            "data": {"type": "architecture"},
        }
        return new_edge

    def draw_args(self, keys: list, args: dict):
        valid_keys = []
        data = {}
        for k in keys:
            if k in args:
                valid_keys.append(k)
        for k in valid_keys:
            if k in self.forbidden_node_data_keys:
                continue
            value = args[k]
            if isinstance(value, list):
                data[k] = json.dumps(value, default=str)
                continue
            elif isinstance(value, dict):
                data[k] = json.dumps(value, default=str)
                continue
            else:
                try:
                    value = json.loads(value)
                    data[k] = json.dumps(value, default=str)
                    continue
                except Exception:
                    pass
            data[k] = f"{value}"
        return data

    @staticmethod
    def get_width_from_node_id(node_id):
        char_width = 7.2
        raw_width = len(node_id) * char_width + 22.5
        rounded_width = math.ceil(raw_width / 10) * 10
        return rounded_width

    @staticmethod
    def get_height_from_node_id():
        char_height = 18 + 22.5
        rounded_width = math.ceil(char_height / 10) * 10
        return rounded_width

    def add_consolidated_tosca_types(self, node_id, node_data):
        node_resources = [
            r
            for r in self.resource_list
            if r["resource_type"] == "node"
            and r["resource_nodes"][0]["class_label"] == node_id
        ]
        if not len(node_resources):
            return None
        consolidated_tosca_types = node_resources[0]["consolidated_tosca_types"]

        if len(consolidated_tosca_types):
            node_data["consolidated_tosca_types"] = consolidated_tosca_types

    def add_consolidated_class_labels(self, node_id, node_data):
        node_resources = [
            r
            for r in self.resource_list
            if r["resource_type"] == "node"
            and r["resource_nodes"][0]["class_label"] == node_id
        ]
        if not len(node_resources):
            return None
        consolidated_resource_nodes = node_resources[0]["consolidated_resource_nodes"]
        consolidated_class_labels = [
            n["class_label"] for n in consolidated_resource_nodes
        ]
        if len(consolidated_class_labels):
            node_data["consolidated_resource_nodes"] = consolidated_class_labels

    @staticmethod
    def evaluate_if_infoNode(node_id):
        # consolidated_node = ""

        # _consolidated_node = node_id.split(".")
        # _consolidated_node = [_key for _key in node_id.split(".") if "aws_" in _key]
        # if len(_consolidated_node) == 1:
        #     consolidated_node = _consolidated_node[-1]

        consolidated_node = node_id.split(".")[-1]
        if consolidated_node not in CONSOLIDATED_CLASS_LABEL_TO_INFONODE_MAPPING.keys():
            return False, ""
        # if (
        #     consolidated_node != ""
        #     and consolidated_node in CONSOLIDATED_CLASS_LABEL_TO_INFONODE_MAPPING.keys()
        #     and CONSOLIDATED_CLASS_LABEL_TO_INFONODE_MAPPING[consolidated_node] != ""
        # ):
        icon_key = CONSOLIDATED_CLASS_LABEL_TO_INFONODE_MAPPING[consolidated_node]
        return True, icon_key

    def draw_default_nodes(
        self,
        node_list,
        parentId,
        x,
        y,
        zIndex=50,
    ):
        max_width = 0
        max_height = 0

        for _index, node_id in enumerate(node_list):
            node_type = "default"
            width = max(self.get_width_from_node_id(node_id), self.min_node_width)
            height = self.get_height_from_node_id()

            if parentId:
                node_data = self.collect_node_data_with_parent(node_id)
            else:
                node_data = self.collect_node_data_without_parent(node_id)

            self.add_consolidated_class_labels(node_id, node_data)
            self.add_consolidated_tosca_types(node_id, node_data)
            is_infoNode, infoNode_icon_key = self.evaluate_if_infoNode(node_id)

            if is_infoNode:
                node_type = "infoNode"
                node_data["icon"] = infoNode_icon_key
                width = 100
                height = 100

            self.add_node(
                node_id,
                node_data=node_data,
                width=width,
                height=height,
                x=x,
                y=y,
                zIndex=zIndex,
                node_type=node_type,
                parentId=parentId,
            )
            y_increment = self.node_spacing + height
            y += y_increment
            max_width = max(max_width, width)
            max_height += y_increment
            continue

        return max_width, max_height

    def draw_cluster_node(
        self,
        cluster_id,
        parentId,
        x,
        y,
        height,
        width,
        zIndex=10,
    ):
        if cluster_id == "root":
            return

        node_id = cluster_id.replace("root.", "").replace("root", "")
        if parentId:
            node_data = self.collect_node_data_with_parent(node_id)
        else:
            node_data = self.collect_node_data_without_parent(node_id, provider=False)

        self.add_node(
            node_id,
            node_data=node_data,
            width=width,
            height=height,
            x=x,
            y=y,
            zIndex=zIndex,
            node_type="clusterNode",
            parentId=parentId,
        )

    def add_nodes_from_group_list(self, parent_group_key):
        max_width = 0
        max_height = 0
        x = 0

        parent_group_list = self.group_dict.get(parent_group_key)
        if parent_group_list is None:
            return max_width, max_height

        parentId = ""
        if "root." in parent_group_key:
            primary_key = parent_group_key.split(".")[-1]
            if parent_group_key == f"root.{self.provider}":
                parentId = f"{self.provider}"
            else:
                parentId = f"module.{primary_key}"

        for group in parent_group_list:
            if group["node_type"] == "clusterNode":
                for child_node_label in group["child_node_labels"]:
                    cluster_node_label = child_node_label.replace("module.", "")
                    child_group_key = f"{parent_group_key}.{cluster_node_label}"

                    x += self.node_spacing
                    _max_width, _max_height = self.add_nodes_from_group_list(
                        child_group_key
                    )
                    if _max_width == 0 or _max_height == 0:
                        continue
                    max_width += self.node_spacing
                    max_height = max(max_height, _max_height)

                    y = self.initial_y + self.node_spacing * (
                        len(child_group_key.split(".")) - 2
                    )
                    self.draw_cluster_node(
                        child_node_label,
                        parentId=parentId,
                        x=x,
                        y=y,
                        height=_max_height + self.node_spacing * 3,
                        width=_max_width + self.node_spacing,
                        zIndex=(len(child_group_key.split(".")) - 1) + 10,
                    )

                    x += _max_width + self.node_spacing
                    max_width += _max_width + self.node_spacing
                    continue
                continue

            if group["node_type"] == "default":
                x += self.node_spacing
                y = self.initial_y + self.node_spacing
                _max_width, _max_height = self.draw_default_nodes(
                    group["child_node_labels"],
                    parentId,
                    x,
                    y,
                )
                if _max_width == 0 or _max_height == 0:
                    continue
                max_width += self.node_spacing
                max_height = max(max_height, _max_height)

                x += _max_width
                max_width += _max_width
                continue

        # max_width += self.node_spacing
        return max_width, max_height

    def draw_react_json(self):
        # Initiate origin
        # x = self.initial_x
        # y = self.initial_y

        # self.add_nodes_from_group_list("root")
        self.add_nodes_from_group_list("root")
        if len(self.edges) > 0:
            edgeCounter = 0
            for source in self.edges:
                for target in self.edges[source]:
                    edgeCounter = self.add_edge(source, target, edgeCounter)
        return

    def create(self):
        self.draw_react_json()
        return self.data


#####################################
#           Helper Functions        #
#####################################
def move_node_down(node_height, node_y):
    node_y += node_height
    return node_y


def move_node_right(node_width, node_x):
    node_x += node_width
    return node_x


def get_args(keys: list, dictionary):
    out = copy.deepcopy(dictionary)
    for key in keys:
        if out.get(key) is None:
            return {}
        out = out[key]
    return out


def keys_in_nested_dict(dictionary: dict, keys: list, prefix: str = ""):
    for key, value in dictionary.items():
        keys.append(key)
        if isinstance(value, dict):
            keys_in_nested_dict(value, keys, prefix=f"{prefix}{key}.")


def process_keys(keys: list, ModModified: bool = False):
    if keys[0] == "module":
        return keys
    # elif keys[0] == "module" and len(keys) > 2:
    #     new_keys = process_keys(keys[2:])
    #     if not ModModified:
    #         while len(keys) > 2:
    #             keys.pop()
    #     else:
    #         keys = keys[0:2] + new_keys
    #     return keys
    elif keys[0] == "data":
        while len(keys) > 3:
            keys.pop()
        return keys
    elif keys[0] == "var":
        keys[0] = "variable"
        while len(keys) > 2:
            keys.pop()
        return keys
    elif keys[0] == "local":
        index = None
        keys[0] = "locals"
        if "[" in keys[-1]:  # '[' indicates a list in the value
            ls = keys[-1].split("[")
            keys[-1] = ls[0]
            index = int(ls[1][0])
        while len(keys) > 2:
            keys.pop()
        return keys, index
    else:
        keys.insert(0, "resource")
        # while len(keys) > 3:
        #     keys.pop()
        return keys[:3]
