import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";

export interface DiagramElementActionContextInterface {
    handleDeleteItems: (props: { nodes?: DiagramNode[]; edges?: DiagramEdge[] }) => void;
    handleDeleteSelectedItems: () => void;
}

export type HandleSetProcessedNodesAndEdges = (p: {
    canvasNodes: DiagramNode[];
    canvasEdges: DiagramEdge[];
    funcRef?: string;
    applyEdgeHandleRealignment?: boolean;
}) => Promise<void>;

export interface DiagramElementActionContextValue {}

export type DiagramElementActionContextHandlers = DiagramElementActionContextInterface & {
    handleSetProcessedNodesAndEdges: HandleSetProcessedNodesAndEdges;
};

export interface DiagramElementActionContextProviderProps {
    children: React.ReactNode;
}

export interface DiagramElementActionContextHookedLayerProps {
    children: React.ReactNode;
    value: DiagramElementActionContextInterface;
}

export enum DrawerStateEnum {
    diagram_resource = "diagram_resource",
    diagram_user_story = "diagram_user_story",
    edge_info = "edge_info",
    layout = "layout",
    node = "node",
    node_info = "node_info",
    diagram_threat_scenario = "digram_threat_scenario",
    diagram_threat_scenario_nodes = "diagram_threat_scenario_nodes",
    diagram_threat_scenario_edges = "diagram_threat_scenario_edges",
}

export type DrawerStateEnumKeys = keyof typeof DrawerStateEnum;
export type DrawerState = { [key in DrawerStateEnumKeys]: boolean };
export type ThreatScenarioDrawerTransitionKey = "attackPath" | "overview" | "nodes" | "edges";
export type ThreatScenarioVisualActiveDrawerKey = ThreatScenarioDrawerTransitionKey | null;

export interface DiagramNodeHandleContextProviderProps {
    children: React.ReactNode;
}
