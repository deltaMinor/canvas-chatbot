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
    updateCanvas,
    updateProjectDiagram,
} from "#root/stores/projectDiagramFeaturePersistenceStore";
import { processDeleteCanvasNodesAndEdges } from "#root/utils/diagram";

export const getFilteredNode = (_node: DiagramNode, key_list: string[]) => {
    return Object.entries(_node)?.reduce(
        (acc, [key, value]) => {
            if (!key_list?.includes(key)) return acc;
            acc[key as keyof DiagramNode] = value as DiagramNode[keyof DiagramNode];
            return acc;
        },
        {} as Record<keyof DiagramNode, DiagramNode[keyof DiagramNode]>
    );
};

export const getFilteredEdge = (_edge: DiagramEdge, key_list: string[]) => {
    return Object.entries(_edge)?.reduce(
        (acc, [key, value]) => {
            if (!key_list?.includes(key)) return acc;
            acc[key as keyof DiagramEdge] = value as DiagramEdge[keyof DiagramEdge];
            return acc;
        },
        {} as Record<keyof DiagramEdge, DiagramEdge[keyof DiagramEdge]>
    );
};

export const processConfirmDeleteDrawerNode = async ({
    instanceId,
    nodeId,
    handleSetProcessedNodesAndEdges,
    appendCanvasHistory,
    resetOverlappingLineSegments,
    getViewport,
}: {
    instanceId: string;
    nodeId: string;
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
    const draftCanvasId = getDraftCanvasIdFromStore(instanceId) ?? selectedCanvas?.canvas_id ?? "";
    const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);

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
        selectedNodeIdList: [nodeId],
    });
};

export const processConfirmDeleteDrawerEdge = async ({
    instanceId,
    edgeId,
    handleSetProcessedNodesAndEdges,
    appendCanvasHistory,
    resetOverlappingLineSegments,
    getViewport,
}: {
    instanceId: string;
    edgeId: string;
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
    const draftCanvasId = getDraftCanvasIdFromStore(instanceId) ?? selectedCanvas?.canvas_id ?? "";
    const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);

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
        selectedEdgeIdList: [edgeId],
    });
};
