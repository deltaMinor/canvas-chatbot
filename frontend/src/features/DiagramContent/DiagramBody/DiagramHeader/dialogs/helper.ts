import { CanvasType, DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { getProjectDiagramFromStore, getProjectIdFromStore } from "#root/stores/backendStore";
import { getDraftCanvasIdFromStore } from "#root/stores/projectDiagram/backend";
import {
    getDiagramDraftCanvasEdgesFromStore,
    getDiagramDraftCanvasFromStore,
    getDiagramDraftCanvasNodesFromStore,
    getDiagramDraftCanvasTypeFromStore,
} from "#root/stores/projectDiagram/canvas";
import { updateProjectDiagram } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { processDeleteAllNodesAndEdges } from "#root/utils/diagram";
import { clearProjectCanvasHistory } from "#root/utils/diagram/diagramCanvasHistoryUtil";

export const processConfirmClearDiagram = async ({
    instanceId,
    handleSetProcessedNodesAndEdges,
    resetOverlappingLineSegments,
}: {
    instanceId: string;
    handleSetProcessedNodesAndEdges: (p: {
        canvasNodes: DiagramNode[];
        canvasEdges: DiagramEdge[];
        funcRef?: string;
    }) => Promise<void>;
    resetOverlappingLineSegments: (edges: DiagramEdge[], new_edge: DiagramEdge) => void;
}) => {
    const projectDiagram = getProjectDiagramFromStore();
    if (!projectDiagram) return;
    const project_id = getProjectIdFromStore();
    const draftCanvasId = getDraftCanvasIdFromStore(instanceId) ?? "";
    const selectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
    const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);
    const context__nodes = getDiagramDraftCanvasNodesFromStore(instanceId);
    const context__edges = getDiagramDraftCanvasEdgesFromStore(instanceId);

    if (!selectedCanvas) return;

    const canvasToClear =
        projectDiagram.canvas.find((canvas) => canvas.canvas_id === draftCanvasId) ??
        selectedCanvas;

    let canvasNodeIdList: string[] = [];

    //  only architecture canvas nodes are deletable
    if (selectedCanvasType === CanvasType.architecture) {
        canvasNodeIdList = canvasToClear.nodes.map((n) => n.id);
    }

    const canvasEdgeIdList = canvasToClear.edges.map((e) => e.id);

    if (!selectedCanvas) return;

    await processDeleteAllNodesAndEdges({
        projectDiagram,
        updateProjectDiagram: (params) => updateProjectDiagram(params),
        selectedCanvasId: draftCanvasId,
        handleSetProcessedNodesAndEdges,
        context__nodes,
        context__edges,
        selectedCanvas,
        selectedCanvasType,
        resetOverlappingLineSegments,
        selectedNodeIdList: canvasNodeIdList,
        selectedEdgeIdList: canvasEdgeIdList,
    });

    if (project_id) {
        clearProjectCanvasHistory({
            instanceId,
            project_id,
        });
    }
};
