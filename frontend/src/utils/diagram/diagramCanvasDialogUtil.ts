import { Viewport } from "@xyflow/react";

import { useProjectLoader } from "#root/hooks/backendLoaderHooks";
import { DiagramCanvas, DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { postGenerateLLMDataflow } from "#root/services/domain/diagram";
import { refreshProjectDiagram } from "#root/stores/backendRefreshStore";
import { getProjectDiagramFromStore } from "#root/stores/backendStore";
import { getDraftCanvasIdFromStore } from "#root/stores/projectDiagram/backend";
import {
    getDiagramDraftCanvasEdgesFromStore,
    getDiagramDraftCanvasFromStore,
    getDiagramDraftCanvasNodesFromStore,
    getDiagramDraftCanvasTypeFromStore,
    setDiagramDraftCanvas,
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
import { handleInitPolling } from "#root/utils/diagram/diagramContentUtil";

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

export const handleGenerateLLMDataflow = async ({
    instanceId,
    project_id,
    canvas_id,
    polling_interval,
}: {
    instanceId: string;
    project_id: string;
    canvas_id: string;
    polling_interval: number;
}) => {
    const setSelectedCanvas = (value: React.SetStateAction<DiagramCanvas | undefined>) =>
        setDiagramDraftCanvas(value, instanceId);

    setSelectedCanvas((prev) => {
        if (prev) {
            return {
                ...prev,
                llm_generation_status: 1,
            };
        }
        return undefined;
    });

    await postGenerateLLMDataflow(project_id, canvas_id, {});
    await handleInitPolling({
        project_id,
        canvas_id,
        polling_interval,
    });
};

export const refreshDataOnCompletePolling = async ({
    projectLoader,
}: {
    projectLoader: ReturnType<typeof useProjectLoader>;
}) => {
    await Promise.all([
        projectLoader.refresh(), //
        refreshProjectDiagram(),
    ]);
};
