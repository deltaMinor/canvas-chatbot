import { IsAuthorized } from "#root/interfaces/authorization";
import { DiagramCanvas, DiagramEdge, DiagramNode, ProjectDiagram } from "#root/interfaces/diagram";
import { getInitCanvasId } from "#root/utils/diagram/diagramCanvasUtil";
import { getProcessedEdges } from "#root/utils/diagram/diagramEdgeUtil";
import { getProcessedNodes } from "#root/utils/diagram/diagramNodeUtil";

export const getPrimaryCanvasPreviewNodesAndEdges = (
    importedCanvas: DiagramCanvas[]
): { nodes: DiagramNode[]; edges: DiagramEdge[] } | null => {
    const primaryCanvasId = getInitCanvasId({ canvas: importedCanvas });
    const primaryCanvas = importedCanvas.find((canvas) => canvas.canvas_id === primaryCanvasId);
    if (!primaryCanvas) return null;

    // Only used to satisfy the util's signature: visibility/authorization
    // filtering is disabled below, so these fields are never read.
    const previewProjectDiagram = { canvas: importedCanvas } as ProjectDiagram;
    const previewIsAuthorized = {} as IsAuthorized;

    const nodes = getProcessedNodes({
        projectDiagram: previewProjectDiagram,
        canvasNodes: primaryCanvas.nodes,
        selectedCanvas: primaryCanvas,
        selectedCanvasViewOnly: !!primaryCanvas.view_only,
        filterAuthorizedNodes: false,
        filterSelectedViewNodes: false,
    }) as DiagramNode[];

    const edges = getProcessedEdges({
        projectDiagram__isAuthorized: previewIsAuthorized,
        projectDiagram: previewProjectDiagram,
        canvasEdges: primaryCanvas.edges,
        selectedCanvas: primaryCanvas,
        selectedCanvasViewOnly: !!primaryCanvas.view_only,
        filterAuthorizedEdges: false,
        filterSelectedViewEdges: false,
    }) as DiagramEdge[];

    return { nodes, edges };
};
