import { Viewport } from "@xyflow/react";

import { DiagramCanvas, DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { getProjectDiagramFromStore } from "#root/stores/backendStore";
import { getDraftCanvasIdFromStore } from "#root/stores/projectDiagram/backend";
import {
    getDiagramDraftCanvasEdgesFromStore,
    getDiagramDraftCanvasFromStore,
    getDiagramDraftCanvasNodesFromStore,
    getDiagramDraftCanvasTypeFromStore,
} from "#root/stores/projectDiagram/canvas";
import {
    getDiagramSelectedEdgeIdListFromStore,
    getDiagramSelectedNodeIdListFromStore,
} from "#root/stores/projectDiagram/selection";
import {
    updateCanvas,
    updateProjectDiagram,
} from "#root/stores/projectDiagramFeaturePersistenceStore";
import { processDeleteCanvasNodesAndEdges } from "#root/utils/diagram";

export const processConfirmDeleteSelectedNodesAndEdges = async ({
    instanceId,
    handleSetProcessedNodesAndEdges,
    appendCanvasHistory,
    resetOverlappingLineSegments,
    getViewport,
}: {
    instanceId: string;
    handleSetProcessedNodesAndEdges: (p: {
        canvasNodes: DiagramNode[];
        canvasEdges: DiagramEdge[];
        funcRef?: string;
    }) => Promise<void>;
    appendCanvasHistory: (selectedCanvas: DiagramCanvas) => void;
    resetOverlappingLineSegments: (edges: DiagramEdge[], new_edge: DiagramEdge) => void;
    getViewport?: () => Viewport;
}) => {
    const projectDiagram = getProjectDiagramFromStore();
    const context__nodes = getDiagramDraftCanvasNodesFromStore(instanceId);
    const context__edges = getDiagramDraftCanvasEdgesFromStore(instanceId);
    const selectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
    const draftCanvasId = getDraftCanvasIdFromStore(instanceId) ?? "";
    const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);
    const selectedNodeIdList = getDiagramSelectedNodeIdListFromStore(instanceId);
    const selectedEdgeIdList = getDiagramSelectedEdgeIdListFromStore(instanceId);

    if (!selectedCanvas || !projectDiagram) return;

    await processDeleteCanvasNodesAndEdges({
        projectDiagram,
        updateProjectDiagram: (params) => updateProjectDiagram(params),
        updateCanvas: async (params) => {
            const viewport = getViewport?.();
            const updatedCanvas = await updateCanvas({
                instanceId,
                ...params,
                ...(viewport && { viewport }),
            });
            if (updatedCanvas) {
                appendCanvasHistory(updatedCanvas);
            }
            return updatedCanvas;
        },
        selectedCanvasId: draftCanvasId,
        handleSetProcessedNodesAndEdges,
        context__nodes,
        context__edges,
        selectedCanvas,
        selectedCanvasType,
        resetOverlappingLineSegments,
        selectedNodeIdList,
        selectedEdgeIdList,
    });
};


