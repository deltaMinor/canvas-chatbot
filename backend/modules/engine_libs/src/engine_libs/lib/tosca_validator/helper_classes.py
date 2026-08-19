from __future__ import annotations

from datetime import datetime, tzinfo

from engine_libs.config import DEFAULT_TZINFO

TZINFO = DEFAULT_TZINFO


class NodeForEdgeInfo:
    """Class to store information for a node's role in an edge relationship"""

    def __init__(self, _id, tosca_type, label):
        self.id = _id
        self.tosca_type = tosca_type
        self.label = label
        self.previous = None
        self.previous_type = None
        self.mermaid_id = None


class NodeForHierarchyInfo:
    """Class to store information for a node's role in a hierarchical relationship"""

    def __init__(self, _id, tosca_type, label, parent):
        self.id = _id
        self.tosca_type = tosca_type
        self.label = label
        self.previous = None
        self.previous_type = None
        # initialize it with "parent". If the node is a child node, it will be updated
        self.parent_node = parent


class EdgeInfo:
    def __init__(self, _id, source, target):
        self.id = _id
        self.source = source
        self.target = target


class RuleInfo:
    def __init__(self, enforce, source, comment):
        self.enforce = enforce
        self.source = source
        self.comment = comment


class ValidityInfo:
    def __init__(
        self,
        priority,
        description,
        title,
        *,
        tzinfo_override: tzinfo | None = None,
    ):
        self.priority = priority
        self.description = description
        self.title = title
        self.timestamp = datetime.now(tzinfo_override or TZINFO)

    def __dict__(self):
        return {
            "priority": self.priority,
            "result": self._get_result(),
            "description": self.description,
            "title": self.title,
            "timestamp": self.timestamp,
        }

    def __eq__(self, other: ValidityInfo):
        if self.description == other.description and self.priority == other.priority:
            return True
        return False

    def _get_result(self):
        if self.priority == 0:
            return "PASS"

        elif 0 < self.priority <= 5:
            return "WARN"

        elif 5 < self.priority < 10:
            return "ERROR"

        else:
            return "FAIL"


class EdgeValidityInfo(ValidityInfo):
    def __init__(
        self,
        edgeId,
        priority,
        description,
        title,
        *,
        tzinfo_override: tzinfo | None = None,
    ):
        super().__init__(
            priority,
            description,
            title,
            tzinfo_override=tzinfo_override,
        )
        self.edgeId = edgeId

    def __dict__(self):
        return {
            "edgeId": self.edgeId,
            "priority": self.priority,
            "result": self._get_result(),
            "description": self.description,
            "title": self.title,
            "timestamp": self.timestamp,
        }


class HierarchyValidityInfo(ValidityInfo):
    def __init__(
        self,
        nodeId,
        priority,
        description,
        title,
        *,
        tzinfo_override: tzinfo | None = None,
    ):
        super().__init__(
            priority,
            description,
            title,
            tzinfo_override=tzinfo_override,
        )
        self.nodeId = nodeId

    def __dict__(self):
        return {
            "nodeId": self.nodeId,
            "priority": self.priority,
            "result": self._get_result(),
            "description": self.description,
            "title": self.title,
            "timestamp": self.timestamp,
        }
