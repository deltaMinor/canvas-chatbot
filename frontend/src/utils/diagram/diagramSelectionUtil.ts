import { DiagramCanvas, DiagramEdge, DiagramNode, ProjectDiagram } from "#root/interfaces/diagram";
import { AttackPath } from "#root/interfaces/register";

const emptyDiagramEdges: DiagramEdge[] = [];
const emptyDiagramNodes: DiagramNode[] = [];
const emptyAttackPaths: AttackPath[] = [];

export const getDiagramDraftCanvasEdges = (draftCanvas?: DiagramCanvas): DiagramEdge[] =>
    draftCanvas?.edges ?? emptyDiagramEdges;

export const getDiagramDraftCanvasNodes = (draftCanvas?: DiagramCanvas): DiagramNode[] =>
    draftCanvas?.nodes ?? emptyDiagramNodes;

export const getSelectedNodes = (
    nodes: DiagramNode[] = emptyDiagramNodes,
    selectedNodeIdList: string[] = []
): DiagramNode[] => {
    if (!selectedNodeIdList.length) {
        return emptyDiagramNodes;
    }

    return nodes.filter((node) => selectedNodeIdList.includes(node.id));
};

export const getSelectedEdges = (
    edges: DiagramEdge[] = emptyDiagramEdges,
    selectedEdgeIdList: string[] = []
): DiagramEdge[] => {
    if (!selectedEdgeIdList.length) {
        return emptyDiagramEdges;
    }

    return edges.filter((edge) => selectedEdgeIdList.includes(edge.id));
};

export const getDiagramEdgeSegmentedPath = (
    edgeSegmentedPaths: Record<string, string> | undefined,
    edgeId: string
): string => {
    return edgeSegmentedPaths?.[edgeId] ?? "";
};

export const getActiveEdges = (
    edges: DiagramEdge[] = emptyDiagramEdges,
    overlayEdges: DiagramEdge[] = emptyDiagramEdges
): DiagramEdge[] => {
    if (!overlayEdges.length) {
        return edges;
    }

    const seenEdgeIds = new Set(edges.map((edge) => edge.id));
    const dedupedOverlayEdges = overlayEdges.filter((edge) => !seenEdgeIds.has(edge.id));

    return [...edges, ...dedupedOverlayEdges];
};

export const getActiveNodes = (
    nodes: DiagramNode[] = emptyDiagramNodes,
    overlayNodes: DiagramNode[] = emptyDiagramNodes
): DiagramNode[] => {
    if (!overlayNodes.length) {
        return nodes;
    }

    return [...nodes, ...overlayNodes];
};

export const getAttackPaths = (draftCanvasRef?: DiagramCanvas["ref"]): AttackPath[] => {
    return draftCanvasRef?.threat_scenario_ref?.attackPaths ?? emptyAttackPaths;
};

export const getSelectedPath = (
    attackPaths: AttackPath[] = emptyAttackPaths,
    selectedPathId = ""
): AttackPath | undefined => {
    return attackPaths.find((path) => path.id === selectedPathId);
};

export const getActiveThreatScenarioSelection = ({
    projectDiagram,
    draftCanvasId,
    selectedPathId = "",
}: {
    projectDiagram?: ProjectDiagram | null;
    draftCanvasId?: string;
    selectedPathId?: string;
}): {
    activeCanvas: DiagramCanvas | undefined;
    attackPaths: AttackPath[];
    selectedPath: AttackPath | undefined;
} => {
    const activeCanvas = projectDiagram?.canvas?.find(
        (canvas) => canvas.canvas_id === draftCanvasId
    );
    const attackPaths = getAttackPaths(activeCanvas?.ref);

    return {
        activeCanvas,
        attackPaths,
        selectedPath: getSelectedPath(attackPaths, selectedPathId),
    };
};
