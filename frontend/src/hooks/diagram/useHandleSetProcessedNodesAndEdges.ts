import React from "react";

import { enqueueSnackbar } from "notistack";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useDraggableEdgeActions,
    useHandleSetProcessedEdges,
    useHandleSetProcessedNodes,
    useReloadNodeHandleEdgeMappingList,
} from "#root/hooks/diagram";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import {
    getDiagramDraftCanvasFromStore,
    setDiagramDraftCanvasEdges,
    setDiagramDraftCanvasNodes,
} from "#root/stores/projectDiagram/canvas";
import { updateCanvas } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { resolveDiagramLayoutOverlaps } from "#root/utils/diagram/diagramLayoutOverlapResolver";

export const useHandleSetProcessedNodesAndEdges = () => {
    const instanceId = useDiagramInstanceId();
    const handleSetProcessedEdges = useHandleSetProcessedEdges();
    const handleSetProcessedNodes = useHandleSetProcessedNodes();
    const reloadNodeHandleEdgeMappingList = useReloadNodeHandleEdgeMappingList();
    const { refreshLineSegments } = useDraggableEdgeActions();

    return React.useCallback(
        async ({
            canvasNodes,
            canvasEdges,
            funcRef = "unknown",
            applyEdgeHandleRealignment = false,
        }: {
            canvasNodes: DiagramNode[];
            canvasEdges: DiagramEdge[];
            funcRef?: string;
            applyEdgeHandleRealignment?: boolean;
        }) => {
            const selectedCanvas = getDiagramDraftCanvasFromStore(instanceId);

            if (!selectedCanvas) return;

            let processedNodes = handleSetProcessedNodes({
                canvasNodes,
                skipRefreshNodeHandleEdgeMappingList: true,
                funcRef,
            });
            let processedEdges = handleSetProcessedEdges({
                canvasEdges,
                skipRefreshNodeEdgeMappingList: true,
                funcRef,
            });

            // Applied last, after the standard reparse above, so it has final
            // say over sourceHandle/targetHandle. Guarded so that a failure
            // here can't prevent refreshLineSegments/reloadNodeHandleEdgeMappingList
            // below from running.
            if (applyEdgeHandleRealignment) {
                try {
                    const reoganised = resolveDiagramLayoutOverlaps(processedNodes, processedEdges);
                    processedNodes = reoganised.nodes;
                    processedEdges = reoganised.edges;

                    setDiagramDraftCanvasNodes(processedNodes, instanceId);
                    setDiagramDraftCanvasEdges(processedEdges, instanceId);

                    await updateCanvas({
                        instanceId,
                        canvasNodes: processedNodes,
                        canvasEdges: processedEdges,
                    });
                } catch (error) {
                    enqueueSnackbar(`Failed to realign edge handles. ${error}`, {
                        variant: "error",
                    });
                }
            }

            refreshLineSegments(processedEdges);
            reloadNodeHandleEdgeMappingList({
                nodes: processedNodes,
                edges: processedEdges,
            });
        },
        [
            handleSetProcessedEdges,
            handleSetProcessedNodes,
            instanceId,
            refreshLineSegments,
            reloadNodeHandleEdgeMappingList,
        ]
    );
};
