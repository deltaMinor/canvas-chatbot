import json
import logging
from collections import defaultdict

from shared_libs.decorators import raise_exception

from .descriptions import (
    DataAccessDescription,
    DiagramDescription,
    EdgeDescription,
    VertexDescription,
)

logger = logging.getLogger(__name__)


class SystemDescriptionExtractor:
    """Builds normalized system-description text and per-user-story summaries.

    Purpose:
    Orchestrates diagram, edge, vertex, and access-control description
    components to produce:
    1) user-story keyed descriptions (`all_userstories_dict`), and
    2) a complete structured system description
       (`get_complete_system_description`).

    """

    def __init__(self, project_input_model: dict):
        logger.debug("[ RR-CORE ] Initializing SystemDescriptionExtractor ...")
        self.project_input_model = project_input_model
        self.diagram_desc = DiagramDescription(project_input_model)
        self.userstory_desc = self.diagram_desc.userstory_desc()

    @raise_exception("Failed to get all userstories dict.")
    def all_userstories_dict(self):
        return self.userstory_desc

    @staticmethod
    @raise_exception(
        "Failed to add word or to sentence.",
        exception_logger=logger,
    )
    def add_word_or_to_sentence(sentence):
        if ", " in sentence:
            last_comma = sentence.rfind(",")
            sentence = sentence[:last_comma] + ", or" + sentence[last_comma + 1 :]
        return sentence

    @staticmethod
    @raise_exception(
        "Failed to add word and to sentence.",
        exception_logger=logger,
    )
    def add_word_and_to_sentence(sentence):
        if ", " in sentence:
            last_comma = sentence.rfind(",")
            sentence = sentence[:last_comma] + ", and" + sentence[last_comma + 1 :]
        return sentence

    @raise_exception(
        "Failed to set description function.",
        exception_logger=logger,
    )
    def _set_description_functions(
        self,
        VertexDescription,
        EdgeDescription,
        DataAccessDescription,
    ):
        logger.debug("[ RR-CORE ] Setting description functions ...")
        self.diagram_desc.set_description_functions(
            VertexDescription,
            EdgeDescription,
            DataAccessDescription,
        )

    @raise_exception(
        "Failed to extract description.",
        exception_logger=logger,
    )
    def _extract_description(self):
        logger.debug("[ RR-CORE ] Extracting description ...")

        self.dataflow_edges_desc = self.diagram_desc.dataflow_edges_desc()
        self.architecture_edges_desc = self.diagram_desc.architecture_edges_desc()
        self.userstory_access_desc = self.diagram_desc.userstory_access_desc()
        self.userstory_feature_desc = self.diagram_desc.userstory_feature_desc()
        self.dataflow_vertices_desc = self.diagram_desc.dataflow_vertices_desc()

    @raise_exception(
        "Failed to extract all user stories and vertextype.",
        exception_logger=logger,
    )
    def _extract_all_user_stories_and_vertextype(self):
        logger.debug("[ RR-CORE ] Extracting system info as labeled JSON sections ...")

        def _pretty(obj):
            return json.dumps(obj, indent=2, ensure_ascii=False)

        diag = self.diagram_desc
        get_label = diag.get_label_from_value

        def _resolve(ref):
            if isinstance(ref, dict):
                return ref.get("label") or get_label(ref.get("value", "")) or ""
            return get_label(ref) or ref or ""

        def _resolve_list(refs):
            if not refs:
                return []
            return [_resolve(r) for r in refs]

        user_types = []
        for u in diag.users or []:
            user_types.append(
                {
                    "User Type": _resolve(u.get("value")),
                    "User Role Description": u.get("description", ""),
                    "Number Of Users In Role": _resolve(u.get("num_users")),
                    "Employment Type": _resolve(u.get("employment_type")),
                }
            )

        data_location_by_value = defaultdict(list)
        for v in diag.vertices or []:
            for data_ref in v.get("data_stored") or []:
                data_value = (
                    data_ref.get("value") if isinstance(data_ref, dict) else data_ref
                )
                if data_value:
                    data_location_by_value[data_value].append(
                        f"{v.get('name', '')} ({v.get('tosca_type', '')})"
                    )

        data_types = []
        for d in diag.data or []:
            data_value = d.get("value")
            data_types.append(
                {
                    "Data Type": _resolve(data_value),
                    "Data Description": d.get("description", ""),
                    "Type Of Data Access": _resolve(d.get("data_access_type")),
                    "Storage Location": data_location_by_value.get(data_value, []),
                }
            )

        # Access-control rows: prefer the enriched mapping, fall back to the
        # raw questionnaire table so the first-pass extractor still sees RBAC
        # rows before `complete_access_control_mapping` has run.
        access_table = diag.access_control or []
        if not access_table:
            acm = self.project_input_model.get("access_control_mapping", {}) or {}
            access_table = acm.get("table", []) if isinstance(acm, dict) else []
        if not access_table:
            ac = self.project_input_model.get("access_control", {}) or {}
            access_table = ac.get("table", []) if isinstance(ac, dict) else []

        rbac_pivot = defaultdict(dict)
        data_columns = []
        for a in access_table:
            user_ref = a.get("users") if a.get("users") is not None else a.get("user")
            data_ref = a.get("data")
            perm_ref = (
                a.get("permissions")
                if a.get("permissions") is not None
                else a.get("permission")
            )
            user_label = _resolve(user_ref)
            data_label = _resolve(data_ref)
            perm = _resolve(perm_ref)
            if not user_label:
                continue
            rbac_pivot[user_label][data_label] = perm
            if data_label and data_label not in data_columns:
                data_columns.append(data_label)
        rbac_matrix = []
        for user_label, perms in rbac_pivot.items():
            row = {"User Type": user_label}
            for col in data_columns:
                row[col] = perms.get(col, "No Permissions")
            rbac_matrix.append(row)

        user_stories_json = []
        for us_id in self.dataflow_edges_desc:
            user_story = diag.find_userstory_id(us_id) or {}
            user_stories_json.append(
                {
                    "User Story Title": user_story.get("title")
                    or user_story.get("user_intent", ""),
                    "Feature": _resolve(user_story.get("features", "")),
                    "User Device": _resolve_list(user_story.get("devices", [])),
                    "Interface": _resolve_list(user_story.get("interfaces", [])),
                    "User Types": _resolve_list(user_story.get("users", [])),
                    "Data Types": _resolve_list(user_story.get("data", [])),
                    "User Intent": user_story.get("user_intent", ""),
                    "Desired Result/Outcome": user_story.get("desired_outcome", ""),
                }
            )

        data_flows = []
        for us_id, path in self.dataflow_edges_desc.items():
            user_story = diag.find_userstory_id(us_id) or {}
            title = user_story.get("title") or user_story.get("user_intent", "")
            data_flows.append({"User Story Title": title, "Data Flow": path})

        sections = [
            "USER TYPES:",
            _pretty(user_types),
            "USER STORIES:",
            _pretty(user_stories_json),
            "DATA TYPES:",
            _pretty(data_types),
            "RBAC MATRIX:",
            _pretty(rbac_matrix),
            "SYSTEM ARCHITECTURE NODES:",
            _pretty(
                [
                    {
                        "id": v.get("id"),
                        "name": v.get("name"),
                        "tosca_type": v.get("tosca_type"),
                    }
                    for v in (diag.vertices or [])
                ]
            ),
            "DATA FLOWS:",
            _pretty(data_flows),
        ]
        return "\n".join(sections)

    @raise_exception(
        "Failed to get complete system description.",
        exception_logger=logger,
    )
    def get_complete_system_description(self):
        self._set_description_functions(
            VertexDescription.name_and_type,
            EdgeDescription.get_dataflow_path,
            DataAccessDescription.data_location_permissions,
        )
        self._extract_description()
        complete_sys_desc = self._extract_all_user_stories_and_vertextype()

        return complete_sys_desc
