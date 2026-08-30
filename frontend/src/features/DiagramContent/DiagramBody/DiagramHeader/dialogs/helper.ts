import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { getProjectDiagramFromStore, getProjectIdFromStore } from "#root/stores/backendStore";
import { getDraftCanvasIdFromStore } from "#root/stores/projectDiagram/backend";
import { updateProjectDiagram } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { clearProjectCanvasHistory } from "#root/utils/diagram/diagramCanvasHistoryUtil";
import { getSelectedCanvasFromId } from "#root/utils/diagram/diagramCanvasUtil";

export const processConfirmClearDiagram = async ({
    instanceId,
    handleSetProcessedNodesAndEdges,
}: {
    instanceId: string;
    handleSetProcessedNodesAndEdges: (p: {
        canvasNodes: DiagramNode[];
        canvasEdges: DiagramEdge[];
        funcRef?: string;
    }) => Promise<void>;
}) => {
    const projectDiagram = getProjectDiagramFromStore();
    if (!projectDiagram) return;

    const draftCanvasId = getDraftCanvasIdFromStore(instanceId) ?? "";
    const selectedCanvas = getSelectedCanvasFromId({ projectDiagram, draftCanvasId });
    if (!selectedCanvas) return;

    const updatedCanvas = projectDiagram.canvas.map((canvas) =>
        canvas.canvas_id === selectedCanvas.canvas_id ? { ...canvas, nodes: [], edges: [] } : canvas
    );

    await updateProjectDiagram({ canvas: updatedCanvas });
    await handleSetProcessedNodesAndEdges({
        canvasNodes: [],
        canvasEdges: [],
        funcRef: "processConfirmClearDiagram",
    });

    const project_id = getProjectIdFromStore();
    if (project_id) {
        clearProjectCanvasHistory({
            instanceId,
            project_id,
        });
    }
};
