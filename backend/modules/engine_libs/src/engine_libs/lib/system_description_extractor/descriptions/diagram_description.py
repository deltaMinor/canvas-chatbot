import logging

import networkx as nx

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class DiagramDescription:
    def __init__(self, project_input_model: dict):
        logger.debug("[ RR-CORE ] Initializing DiagramDescription ...")

        self.edges = project_input_model.get("dataflow", {}).get("edges", [])
        self.vertices = project_input_model.get("dataflow", {}).get("vertices", [])
        self.user_stories = project_input_model.get("user_stories", [])
        self.data = project_input_model.get("data", [])
        self.questionnaire_ref = project_input_model.get("questionnaire_ref", {})
        self.users = project_input_model.get("users", [])
        self.access_control = project_input_model.get("access_control_mapping", {}).get(
            "table", []
        )

    @raise_exception(
        "Failed to set description function in diagram description class.",
        exception_logger=logger,
    )
    def set_description_functions(
        self,
        vertex_desc_fn,
        edge_desc_fn,
        access_desc_fn,
    ):
        self.vertex_desc_fn = vertex_desc_fn
        self.edge_desc_fn = edge_desc_fn
        self.access_desc_fn = access_desc_fn

    @raise_exception(
        "Failed to get data flow edges desc in diagram description class.",
        exception_logger=logger,
    )
    def dataflow_edges_desc(self):
        final_description = {}
        dataflows = self.get_all_dataflows()
        for user_story_id in dataflows:
            dataflow = dataflows[user_story_id]
            flow_desc, all_vertex_id = self.edges_desc(dataflow)
            final_description[user_story_id] = flow_desc
        return final_description

    @raise_exception(
        "Failed to get data flow vertices desc in diagram description class.",
        exception_logger=logger,
    )
    def dataflow_vertices_desc(self):
        from .vertex_description import VertexDescription

        final_description = []
        dataflows = self.get_all_dataflows()
        all_vertex_id = set()
        for user_story_id in dataflows:
            dataflow = dataflows[user_story_id]
            flow_desc, vertex_id = self.edges_desc(dataflow)
            all_vertex_id.update(vertex_id)

        for vertex_id in all_vertex_id:
            vertex = self.find_vertex_by_id(vertex_id)
            vertex_desc = VertexDescription.sentence_description(vertex)
            final_description.append("- " + vertex_desc)

        return "\n".join(final_description)

    @raise_exception(
        "Failed to get edges desc in diagram description class.",
        exception_logger=logger,
    )
    def edges_desc(
        self,
        filtered_edges,
    ):
        if not filtered_edges:
            return [], set()

        graph = nx.DiGraph()
        for edge in filtered_edges:
            graph.add_edge(edge["source_vertex"], edge["target_vertex"])

        sources = [n for n in graph.nodes if graph.in_degree(n) == 0]
        sinks = [n for n in graph.nodes if graph.out_degree(n) == 0]

        path_vertices_list = []
        for src in sources:
            for tgt in sinks:
                if nx.has_path(graph, src, tgt):
                    path_vertices_list.extend(nx.all_simple_paths(graph, src, tgt))

        if not path_vertices_list:
            for component in nx.weakly_connected_components(graph):
                start = next(iter(component))
                path_vertices_list.append(
                    list(nx.dfs_preorder_nodes(graph.subgraph(component), start))
                )

        edges_str_list = []
        for path_vertices_id in path_vertices_list:
            all_vertex = [self.find_vertex_by_id(v) for v in path_vertices_id]
            edges_str_list.append(self.edge_desc_fn(all_vertex, self.vertex_desc_fn))

        return edges_str_list, set(graph.nodes)

    @raise_exception(
        "Failed to get architecture edges desc in diagram description class.",
        exception_logger=logger,
    )
    def architecture_edges_desc(self):
        all_archi_edges = self.get_architecture_edges()
        edges_str, all_vertex_id = self.edges_desc(all_archi_edges)
        return edges_str

    @raise_exception(
        "Failed to get user story feature desc in diagram description class.",
        exception_logger=logger,
    )
    def userstory_feature_desc(self):
        from engine_libs.lib.system_description_extractor import (
            SystemDescriptionExtractor,
        )

        dataflows = self.get_all_dataflows()
        feature_str = {}
        i = 1
        for user_story_id in dataflows:
            user_story = self.find_userstory_id(user_story_id)
            feature = self.get_label_from_value(user_story.get("features", ""))

            all_data = [
                self.get_label_from_value(_) for _ in user_story.get("data", [])
            ]

            data_list_str = SystemDescriptionExtractor.add_word_and_to_sentence(
                all_data
            )
            desc_str = f"User story {i} involves {feature if feature else 'no specific feature'} operated on {data_list_str}."
            i = i + 1
            feature_str[user_story_id] = desc_str
        return feature_str

    @raise_exception(
        "Failed to get user story access desc in diagram description class.",
        exception_logger=logger,
    )
    def userstory_access_desc(self):
        dataflows = self.get_all_dataflows()
        all_user_story_desc_str = {}
        for user_story_id in dataflows:
            user_story = self.find_userstory_id(user_story_id)

            all_data = [
                self.get_label_from_value(_) for _ in user_story.get("data", [])
            ]

            all_users = [
                self.get_label_from_value(_) for _ in user_story.get("users", [])
            ]

            filtered_access = self.filter_access_control(
                all_users,
                all_data,
            )
            story_desc_str = self.access_desc_fn(
                filtered_access,
            )
            all_user_story_desc_str[user_story_id] = story_desc_str
        return all_user_story_desc_str

    @raise_exception(
        "Failed to filter access control in diagram description class.",
        exception_logger=logger,
    )
    def filter_access_control(
        self,
        users,
        data,
    ):
        filtered_access = []
        if not self.access_control:
            return filtered_access
        for access in self.access_control:
            if access["data"] in data and access["user"] in users:
                filtered_access.append(access)
        return filtered_access

    @raise_exception(
        "Failed to get all data flows in diagram description class.",
        exception_logger=logger,
    )
    def get_all_dataflows(self) -> dict:
        card_ids = [_["id"] for _ in self.user_stories]
        dataflows = {k: [] for k in card_ids}
        if self.edges:
            for edge in self.edges:
                if edge["type"] == "data_flow":
                    user_story_id = edge.get("userstory_id", None)
                    if user_story_id is not None:
                        dataflows[user_story_id].append(edge)
        return dataflows

    @raise_exception(
        "Failed to get architecture edges in diagram description class.",
        exception_logger=logger,
    )
    def get_architecture_edges(self):
        architecture = []
        for edge in self.edges:
            if edge["type"] == "architecture":
                architecture.append(edge)
        return architecture

    @raise_exception(
        "Failed to find vertex by id in diagram description class.",
        exception_logger=logger,
    )
    def find_vertex_by_id(
        self,
        vertex_id,
    ):
        found_vertex = None

        for vertex in self.vertices:
            if vertex["id"] == vertex_id:
                found_vertex = vertex

        # TODO If two vertex share same name, return name + number
        return found_vertex

    @raise_exception(
        "Failed to find user story id in diagram description class.",
        exception_logger=logger,
    )
    def find_userstory_id(
        self,
        user_story_id,
    ):
        for user_story in self.user_stories:
            if user_story["id"] == user_story_id:
                return user_story
        return None

    @raise_exception(
        "Failed to find data id in diagram description class.",
        exception_logger=logger,
    )
    def find_data_id(
        self,
        data_id,
    ):
        for data in self.data:
            if data["id"] == data_id:
                return data
        return None

    @raise_exception(
        "Failed to find user id in diagram description class.",
        exception_logger=logger,
    )
    def find_user_id(
        self,
        user_id,
    ):
        for user in self.users:
            if user["id"] == user_id:
                return user
        return None

    @raise_exception("Failed to get user story desc.")
    def userstory_desc(self) -> dict:
        dataflows = self.get_all_dataflows()
        feature_str = {}
        # i = 1
        for user_story_id in dataflows:
            user_story = self.find_userstory_id(user_story_id)
            if user_story is None:
                continue

            feature = self.get_label_from_value(user_story.get("features", ""))

            devices = [
                self.get_label_from_value(_) for _ in user_story.get("devices", [])
            ]
            interfaces = [
                self.get_label_from_value(_) for _ in user_story.get("interfaces", [])
            ]

            all_data = [
                self.get_label_from_value(_) for _ in user_story.get("data", [])
            ]

            all_users = [
                self.get_label_from_value(_) for _ in user_story.get("users", [])
            ]

            desc_str = f"As a {all_users}, I want to do {feature} on {all_data} using the {interfaces} on my {devices}"

            feature_str[user_story_id] = desc_str
        return feature_str

    @raise_exception("Failed to get label from value.")
    def get_label_from_value(self, value: str) -> str:
        return self.questionnaire_ref.get(value, "")
