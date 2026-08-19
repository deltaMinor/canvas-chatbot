import React from "react";

import { useReactFlow } from "@xyflow/react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAppendCanvasHistory,
    useDiagramDraftNode,
    useDraggableEdgeActions,
    useHandleSetProcessedNodesAndEdges,
} from "#root/hooks/diagram";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import { setDiagramDrawerState } from "#root/stores/projectDiagram/drawer";
import { runWithHeavyExecutionGuard } from "#root/utils/animationFrameUtil";
import { processConfirmDeleteDrawerNode } from "#root/utils/diagramAttributeDrawerUtil";

import NodeDrawerConfirmDialogs from "./NodeDrawerConfirmDialogs";
import NodeDrawerDialogFields from "./NodeDrawerDialogFields";
import NodeDrawerLogDialog from "./NodeDrawerLogDialog";

const NodeDrawerDialogsComponent = () => {
    const draftNode = useDiagramDraftNode();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();
    const instanceId = useDiagramInstanceId();
    const appendCanvasHistory = useAppendCanvasHistory();
    const { resetOverlappingLineSegments } = useDraggableEdgeActions();
    const handleSetProcessedNodesAndEdges = useHandleSetProcessedNodesAndEdges();

    const handleCloseDrawerNode = React.useCallback(async () => {
        setDiagramDrawerState(
            (prev) => ({
                ...prev,
                node_info: false,
            }),
            instanceId
        );
    }, [instanceId]);

    const handleConfirmDeleteDrawerNode = React.useCallback(async () => {
        if (!draftNode?.id) return;

        await runWithHeavyExecutionGuard(async () => {
            await CallApiWithSnackbar({
                async_func: async () => {
                    await processConfirmDeleteDrawerNode({
                        instanceId,
                        nodeId: draftNode.id,
                        handleSetProcessedNodesAndEdges,
                        appendCanvasHistory,
                        resetOverlappingLineSegments,
                        getViewport: reactFlow.getViewport,
                    });
                },
                func_on_success: handleCloseDrawerNode,
                message: "Deleting node ...",
                messageOnError: "Failed to delete node.",
            });
        });
    }, [
        appendCanvasHistory,
        draftNode,
        handleCloseDrawerNode,
        handleSetProcessedNodesAndEdges,
        instanceId,
        reactFlow,
        resetOverlappingLineSegments,
    ]);

    return (
        <>
            <NodeDrawerConfirmDialogs onDelete={handleConfirmDeleteDrawerNode} />
            <NodeDrawerDialogFields />
            <NodeDrawerLogDialog />
        </>
    );
};

export default React.memo(NodeDrawerDialogsComponent);
