import React from "react";

import { useReactFlow } from "@xyflow/react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAppendCanvasHistory,
    useDiagramDraftEdge,
    useDraggableEdgeActions,
    useHandleSetProcessedNodesAndEdges,
} from "#root/hooks/diagram";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import { setDiagramDrawerState } from "#root/stores/projectDiagram/drawer";
import { runWithHeavyExecutionGuard } from "#root/utils/animationFrameUtil";
import { processConfirmDeleteDrawerEdge } from "#root/utils/diagramAttributeDrawerUtil";

import EdgeDrawerConfirmDialogs from "./EdgeDrawerConfirmDialogs";
import EdgeDrawerDialogFields from "./EdgeDrawerDialogFields";
import EdgeDrawerLogDialog from "./EdgeDrawerLogDialog";

const EdgeDrawerDialogsComponent = () => {
    const draftEdge = useDiagramDraftEdge();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();
    const instanceId = useDiagramInstanceId();
    const appendCanvasHistory = useAppendCanvasHistory();
    const { resetOverlappingLineSegments } = useDraggableEdgeActions();
    const handleSetProcessedNodesAndEdges = useHandleSetProcessedNodesAndEdges();

    const handleCloseDrawerEdge = React.useCallback(async () => {
        setDiagramDrawerState(
            (prev) => ({
                ...prev,
                edge_info: false,
            }),
            instanceId
        );
    }, [instanceId]);

    const handleConfirmDeleteDrawerEdge = React.useCallback(async () => {
        if (!draftEdge?.id) return;

        await runWithHeavyExecutionGuard(async () => {
            await CallApiWithSnackbar({
                async_func: async () => {
                    await processConfirmDeleteDrawerEdge({
                        instanceId,
                        edgeId: draftEdge.id,
                        handleSetProcessedNodesAndEdges,
                        appendCanvasHistory,
                        resetOverlappingLineSegments,
                        getViewport: reactFlow.getViewport,
                    });
                },
                func_on_success: handleCloseDrawerEdge,
                message: "Deleting edge ...",
                messageOnError: "Failed to delete edge.",
            });
        });
    }, [
        appendCanvasHistory,
        draftEdge,
        handleCloseDrawerEdge,
        handleSetProcessedNodesAndEdges,
        instanceId,
        reactFlow,
        resetOverlappingLineSegments,
    ]);

    return (
        <>
            <EdgeDrawerConfirmDialogs onDelete={handleConfirmDeleteDrawerEdge} />
            <EdgeDrawerDialogFields />
            <EdgeDrawerLogDialog />
        </>
    );
};

export default React.memo(EdgeDrawerDialogsComponent);
