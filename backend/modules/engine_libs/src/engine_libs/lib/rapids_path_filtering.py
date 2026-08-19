import networkx as nx
from engine_libs.lib.llm_prompt_builder import LLMPromptBuilder
from engine_libs.utils.llm_util import LLMUtil

from shared_libs.types.graph_types import GraphConstructProtocol


class RapidsPathFiltering:
    def __init__(self, graph_construct: GraphConstructProtocol) -> None:
        self.dataflow: nx.DiGraph = graph_construct.data_flow_graph
        self.child_of: nx.DiGraph = graph_construct.child_of_graph

    def extract_starting_point(self, filter_rule: object) -> dict[str, list[dict]]:
        # TODO: Replace this part with old filtering code to extract vertices
        starting_point: dict[str, list[dict]] = {"user": [], "ext_services": []}

        for vertex_id in self.dataflow.nodes:
            v = self.dataflow.nodes[vertex_id]
            if v["tosca_type"] == "arcs.nodes.User":
                starting_point["user"].append({"name": v["name"], "id": vertex_id})
            elif "arcs.nodes.Service" in v["tosca_type"]:
                starting_point["ext_services"].append(
                    {"name": v["name"], "id": vertex_id}
                )
        return starting_point

    def extract_ending_point(self, filter_rule: object) -> list[tuple[dict, str]]:
        # TODO: Replace this part with old filtering code to extract vertices
        ending_point: list[tuple[dict, str]] = []

        for vertex_id in self.dataflow.nodes:
            v = self.dataflow.nodes[vertex_id]
            if "data_stored" in v:
                ending_point.append(
                    ({"name": v["name"], "id": vertex_id}, "data_store")
                )
            if v["tosca_type"] in ["arcs.nodes.Service.DeploymentService"]:
                ending_point.append(
                    ({"name": v["name"], "id": vertex_id}, "resource_mgmt")
                )
            # TODO: Add the filtering for critical node
        return ending_point

    def find_path(self, start: dict, end: dict) -> list[list]:
        return list(nx.all_simple_paths(self.dataflow, start["id"], end["id"]))

    def analyze_path(
        self,
        list_dest_nodes: list[str],
        list_dest_type: list[str],
        list_userstory_edges: list[list[str]],
        device: str,
    ) -> set[tuple[str, str]]:
        possible_threats: set[tuple[str, str]] = set()
        if len(list_userstory_edges) > 1:
            if list_userstory_edges[0][0] in list_userstory_edges[1]:
                for i in range(0, len(list_dest_nodes)):
                    if list_dest_type[i] == "arcs.nodes.Compute":
                        possible_threats.add(
                            (
                                "Exploit public-facing service",
                                list_dest_nodes[i],
                            )
                        )
                    elif list_dest_type[i] == "arcs.nodes.Service.DeploymentService":
                        possible_threats.add(
                            ("Supply chain compromise", list_dest_nodes[i])
                        )

        if (
            "Personal Internet Device" in device
            or "Government Non-Managed Device" in device
        ):
            possible_threats.add(("Phishing", device))

        return possible_threats

    def enumerate_combi_path(
        self,
        starting_points: dict[str, list[dict]],
        ending_points: list[tuple[dict, str]],
    ) -> list[dict]:
        all_threats: list[dict] = []

        for u in starting_points["user"]:
            for end_node, type_ending in ending_points:
                list_threats: set[tuple[str, str]] = set()
                # TODO: Only add if there is a path
                for p in self.find_path(u, end_node):
                    path_graph = nx.path_graph(p)

                    list_dest_nodes: list[str] = []
                    list_dest_type: list[str] = []
                    list_userstory_edges: list[list[str]] = []

                    i = 0
                    interface_id = 0
                    for ea in path_graph.edges():
                        if i == 0:
                            interface_id = ea[1]
                            i = i + 1

                        list_dest_nodes.append(self.dataflow.nodes[ea[1]]["name"])
                        list_dest_type.append(self.dataflow.nodes[ea[1]]["tosca_type"])
                        list_userstory_edges.append(
                            [
                                e["userstory_id"]
                                for e in list(
                                    self.dataflow.get_edge_data(ea[0], ea[1]).values()
                                )
                            ]
                        )

                    list_parent_interface = list(
                        self.child_of.out_edges(interface_id, keys=True)
                    )
                    device = ""
                    if len(list_parent_interface) > 0:
                        device = self.child_of.nodes[list_parent_interface[0][1]][
                            "name"
                        ]

                    possible_threats = self.analyze_path(
                        list_dest_nodes,
                        list_dest_type,
                        list_userstory_edges,
                        device,
                    )

                    list_threats.update(possible_threats)

                all_threat_vectors = []
                for threat, target in list_threats:
                    all_threat_vectors.append({"vector": threat, "target": target})

                goal: list[str] = []
                if type_ending == "resource_mgmt":
                    goal = ["Denial of Service", "resource hijacking"]
                elif type_ending == "data_store":
                    goal = [
                        "ransomware",
                        "data exfiltration",
                        "data manipulation",
                    ]

                all_threats.append(
                    {
                        "possible_threats": all_threat_vectors,
                        "goal": goal,
                        "end_node": end_node,
                        "start_node": u,
                    }
                )
        return all_threats


class GuidedPrompt:
    def __init__(self, all_paths: list[dict]) -> None:
        self.paths = all_paths

    def get_start_and_goal_prompt(self) -> list[str]:
        all_goal_prompts: list[str] = []
        guided_goal_prompt_template = str(
            getattr(LLMPromptBuilder, "task_guided_goal", "")
        )
        guided_start_prompt_template = str(
            getattr(LLMPromptBuilder, "task_guided_start", "")
        )
        for path in self.paths:
            goals = ", ".join(path["goal"])
            target = path["end_node"]["name"]
            goal_str = LLMUtil.add_word_or_to_sentence(goals) + " on " + target

            start = path["start_node"]["name"]

            guided_goal_prompt = guided_goal_prompt_template.format(list_goals=goal_str)
            guided_start_prompt = guided_start_prompt_template.format(node=start)

            all_goal_prompts.append(guided_goal_prompt + guided_start_prompt)
        return all_goal_prompts

    def get_threat_vector_prompt(self) -> list[str]:
        all_threat_prompts: list[str] = []
        guided_prompt_template = str(
            getattr(LLMPromptBuilder, "task_guided_attack", "")
        )
        for path in self.paths:
            threats = ""
            for threat in path["possible_threats"]:
                threats += threat["vector"] + " on " + threat["target"] + ", "
            threat_vector_str = LLMUtil.add_word_or_to_sentence(threats[:-2])

            all_threat_prompts.append(
                guided_prompt_template.format(list_vectors=threat_vector_str)
            )
        return all_threat_prompts
