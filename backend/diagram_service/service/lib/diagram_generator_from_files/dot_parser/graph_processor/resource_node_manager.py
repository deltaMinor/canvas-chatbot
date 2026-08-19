import re
from enum import Enum

from service.lib.diagram_generator_from_files.dot_parser.dot_parser_util import (
    DotParserUtil,
)


class DotGraphResourceType(Enum):
    module = "module"
    provider = "provider"


class NodeSpecialClass(Enum):
    edge = "edge"
    group = "group"
    group_module = "group_module"
    group_shared = "group_shared"
    outer = "outer"
    provider = "provider"
    standalone = "standalone"
    unclassified = "unclassified"


class ResourceNodeManager(DotParserUtil):
    def __init__(
        self,
        IMPLIED_CONNECTION_CLASSES,
        INCLUDED_CLASSES,
        EXCLUDED_CLASSES,
        SPECIAL_RESOURCE_CLASSES,
        OUTER_NODE_CLASSES,
        EDGE_NODE_CLASSES,
        SHARED_SERVICE_CLASSES,
        GROUP_NODE_CLASSES,
    ):
        self.IMPLIED_CONNECTION_CLASSES = IMPLIED_CONNECTION_CLASSES
        self.INCLUDED_CLASSES = INCLUDED_CLASSES
        self.EXCLUDED_CLASSES = EXCLUDED_CLASSES
        self.SPECIAL_RESOURCE_CLASSES = SPECIAL_RESOURCE_CLASSES
        self.OUTER_NODE_CLASSES = OUTER_NODE_CLASSES
        self.EDGE_NODE_CLASSES = EDGE_NODE_CLASSES
        self.SHARED_SERVICE_CLASSES = SHARED_SERVICE_CLASSES
        self.GROUP_NODE_CLASSES = GROUP_NODE_CLASSES
        DotParserUtil.__init__(self)

    @staticmethod
    def get_resource_node_classes(class_label):
        classes = {}
        # TO DO: regex match make robust
        if re.search(r"\[[\S]+\]", class_label):
            classes["base_class"] = class_label.split("[")[0].strip()
            classes["edge_class"] = class_label.split("/")[-1].replace("]", "").strip()
        else:
            resource_node_labels = class_label.split(".")
            for node_index, node in enumerate(resource_node_labels):
                node_key = f"L{node_index}_class"
                if node_index == 0:
                    classes["base_class"] = node
                classes[node_key] = node
                if node_index == len(resource_node_labels) - 1:
                    classes["edge_class"] = node
        return classes

    @staticmethod
    def get_primary_class(classes):
        base_class = classes["base_class"]
        if base_class == DotGraphResourceType.provider.value:
            primary_class = classes["edge_class"]
            return primary_class
        elif base_class == DotGraphResourceType.module.value:
            primary_class = classes.get("L2_class")
            if not bool(primary_class):
                return base_class
            return primary_class
        return base_class

    @staticmethod
    def get_local_module_name(classes):
        if classes["base_class"] == DotGraphResourceType.module.value:
            return classes.get("L1_class")
        return None

    @staticmethod
    def get_local_resource_name(classes):
        base_class = classes["base_class"]
        if base_class == DotGraphResourceType.provider.value:
            return None
        elif base_class == DotGraphResourceType.module.value:
            return classes.get("L3_class")
        return classes.get("L1_class")

    @staticmethod
    def get_parent_node(classes, classification):
        if (
            classes["base_class"] == DotGraphResourceType.module.value
            and classes.get("L2_class") is not None
        ):
            return {
                "class_label": f"{DotGraphResourceType.module.value}.{classes.get('L1_class')}"
            }
        if (
            classes["base_class"] == DotGraphResourceType.provider.value
            or classification["special_class"] == NodeSpecialClass.outer.value
        ):
            return None
        return {"class_label": "aws"}

    @staticmethod
    def get_resource_node_type(resource_type, graph_index=-1):
        if resource_type == "node" or graph_index == -1:
            return "node"
        elif resource_type == "edge":
            if graph_index == 0:
                return "source"
            elif graph_index == 1:
                return "target"
        return None

    @staticmethod
    def get_class_exact_match(CLASSES, key):
        for CLASS in CLASSES:
            if CLASS["class_label"] == key:
                return CLASS
            continue
        return None

    @staticmethod
    def get_class_prefix_match(CLASSES, key):
        for CLASS in CLASSES:
            if key.startswith(CLASS["class_label_prefix"]):
                return CLASS
            continue
        return None

    def get_classification_from_key(self, primary_class, classes):
        CLASS = self.get_class_prefix_match(self.OUTER_NODE_CLASSES, primary_class)
        if bool(CLASS):
            return {
                "special_class": NodeSpecialClass.outer.value,
                "group": None,
                "is_special_class": True,
                "is_identified": True,
                "is_group": False,
            }

        CLASS = self.get_class_prefix_match(self.EDGE_NODE_CLASSES, primary_class)
        if bool(CLASS):
            return {
                "special_class": NodeSpecialClass.edge.value,
                "group": None,
                "is_special_class": True,
                "is_identified": True,
                "is_group": False,
            }

        # group (must be exact match)
        # CLASS = self.get_class_exact_match(self.GROUP_NODE_CLASSES, primary_class)
        # if bool(CLASS):
        #     return {
        #         "special_class": NodeSpecialClass.group.value,
        #         "group": {**CLASS, "class_label": CLASS["class_label"]},
        #         "is_special_class": True,
        #         "is_identified": True,
        #         "is_group": True,
        #     }

        # group_shared
        CLASS = self.get_class_prefix_match(self.SHARED_SERVICE_CLASSES, primary_class)
        if bool(CLASS):
            return {
                "special_class": NodeSpecialClass.group_shared.value,
                "group": {**CLASS, "class_label": "SS_Shared_Services"},
                "is_special_class": True,
                "is_identified": True,
                "is_group": True,
            }

        # group_module
        if (
            classes["base_class"] == DotGraphResourceType.module.value
            and classes.get("L2_class") is None
        ):
            return {
                "special_class": NodeSpecialClass.group_module.value,
                "group": {"class_label": classes.get("L1_class")},
                "is_special_class": True,
                "is_identified": True,
                "is_group": True,
            }

        # provider
        if classes["base_class"] == DotGraphResourceType.provider.value:
            return {
                "special_class": NodeSpecialClass.provider.value,
                "group": {"class_label": classes.get("edge_class")},
                "is_special_class": True,
                "is_identified": True,
                "is_group": True,
            }

        return {
            "special_class": None,
            "group": None,
            "is_special_class": False,
            "is_identified": False,
            "is_group": False,
        }

    def get_implied_connection(
        self,
        resource_node_class_label,
    ):
        for conn in self.IMPLIED_CONNECTION_CLASSES:
            if conn["class_label_prefix"] in resource_node_class_label:
                return conn
            continue
        return None

    def get_new_resource_node(
        self,
        resource_node_label,
        resource_node_class_label,
    ):
        implied_connection = self.get_implied_connection(resource_node_class_label)
        resource_node_label = (
            implied_connection["implied_label"]
            if implied_connection
            else resource_node_label
        )
        resource_node_class_label = (
            implied_connection["implied_class_label"]
            if implied_connection
            else resource_node_class_label
        )
        is_implied_connection = True if implied_connection else False
        classes = self.get_resource_node_classes(resource_node_class_label)
        primary_class = self.get_primary_class(classes)
        local_module_name = self.get_local_module_name(classes)
        local_resource_name = self.get_local_resource_name(classes)
        classification = self.get_classification_from_key(primary_class, classes)
        parent_node = self.get_parent_node(classes, classification)
        is_included = primary_class in self.INCLUDED_CLASSES
        is_excluded = primary_class in self.EXCLUDED_CLASSES
        is_module = classes["base_class"] == DotGraphResourceType.module.value
        is_special_class = classification.get("is_special_class")
        return {
            "label": resource_node_label,
            "class_label": resource_node_class_label,
            "type": "unknown",
            "classes": classes,
            "primary_class": primary_class,
            "special_class": classification.get("special_class"),
            "local_module_name": local_module_name,
            "local_resource_name": local_resource_name,
            "parent_node": parent_node,
            "group": classification.get("group"),
            "is_included": is_included,
            "is_excluded": is_excluded,
            "is_implied_connection": is_implied_connection,
            "is_auto_annotation": False,
            "is_consolidated": False,
            "is_module": is_module,
            "is_group": classification.get("is_group"),
            "is_special_class": is_special_class,
            "is_identified": is_included or is_excluded or is_special_class,
        }
