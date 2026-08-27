import React from "react";

import { useReactFlow } from "@xyflow/react";

import DialogConfirm from "#root/components/DialogConfirm";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAppendCanvasHistory,
    useDeselectAllNodesAndEdges,
    useDiagramDraftCanvasEdges,
    useDiagramDraftCanvasNodes,
    useDraggableEdgeActions,
    useHandleSetProcessedNodesAndEdges,
} from "#root/hooks/diagram";
import { useDialogState } from "#root/hooks/dialogHooks";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { DialogConfirmStateEnum } from "#root/interfaces/dialog";
import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";
import {
    getDiagramSelectedEdgeIdListFromStore,
    getDiagramSelectedNodeIdListFromStore,
} from "#root/stores/projectDiagram/selection";
import { runWithHeavyExecutionGuard } from "#root/utils/animationFrameUtil";
import { processConfirmDeleteSelectedNodesAndEdges } from "#root/utils/diagram/diagramCanvasDialogUtil";

const DiagramCanvasDialogConfirmComponent = () => {
    const instanceId = useDiagramInstanceId();
    const appendCanvasHistory = useAppendCanvasHistory();
    const selectedCanvasEdges = useDiagramDraftCanvasEdges();
    const selectedCanvasNodes = useDiagramDraftCanvasNodes();
    const handleSetProcessedNodesAndEdges = useHandleSetProcessedNodesAndEdges();
    const dialogConfirmState = useDialogState();
    const deselectAllNodesAndEdges = useDeselectAllNodesAndEdges();
    const { resetOverlappingLineSegments } = useDraggableEdgeActions();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();

    const handleDeleteSelectedNodesAndEdges = React.useCallback(async () => {
        await CallApiWithSnackbar({
            async_func: async () => {
                await processConfirmDeleteSelectedNodesAndEdges({
                    instanceId,
                    handleSetProcessedNodesAndEdges,
                    appendCanvasHistory,
                    resetOverlappingLineSegments,
                    getViewport: reactFlow.getViewport,
                });
            },
            func_on_success: async () => {
                deselectAllNodesAndEdges();
            },
            message: "Deleting nodes and edges ...",
            messageOnError: "Failed to delete nodes and edges.",
        });
    }, [
        appendCanvasHistory,
        deselectAllNodesAndEdges,
        handleSetProcessedNodesAndEdges,
        instanceId,
        reactFlow,
        resetOverlappingLineSegments,
    ]);

    const handleClickDeleteNodesAndEdges = React.useCallback(async () => {
        await handleCloseDialogAsync(DialogConfirmStateEnum.confirmDeleteNodesAndEdges);
        await runWithHeavyExecutionGuard(handleDeleteSelectedNodesAndEdges);
    }, [handleDeleteSelectedNodesAndEdges]);

    const getConfirmDeleteNodesAndEdgesData = React.useCallback(() => {
        const selectedNodeIdList = getDiagramSelectedNodeIdListFromStore(instanceId);
        const selectedEdgeIdList = getDiagramSelectedEdgeIdListFromStore(instanceId);

        const selectedNodeLabels =
            selectedCanvasNodes
                ?.filter((n) => !!selectedNodeIdList?.includes(n?.id))
                ?.map((n) => n?.data?.label) || [];
        const selectedEdgeIDs =
            selectedCanvasEdges
                ?.filter((n: DiagramEdge) => !!selectedEdgeIdList?.includes(n?.id))
                ?.map((n: DiagramEdge) => n?.id) || [];

        return [...selectedNodeLabels, ...selectedEdgeIDs];
    }, [instanceId, selectedCanvasEdges, selectedCanvasNodes]);

    const handleCloseCanvasDialogConfirm = React.useCallback(async () => {
        await handleCloseDialogAsync(DialogConfirmStateEnum.confirmDeleteNodesAndEdges);
    }, []);

    const dialogConfirmProps = [
        {
            stateKey: DialogConfirmStateEnum.confirmDeleteNodesAndEdges,
            message: "Are you sure you want to delete the selected node(s) and edge(s)?",
            onClick: handleClickDeleteNodesAndEdges,
            title: "Delete Node(s) and Edge(s)",
            getDataFunc: getConfirmDeleteNodesAndEdgesData,
            warningMessage:
                "Warning! All connected edges, including those in other canvases, will also be deleted.",
        },
    ] as ConfirmDialogProps[];

    return (
        <DialogConfirm
            dialogConfirmProps={dialogConfirmProps}
            dialogConfirmState={dialogConfirmState}
            handleCloseDialogConfirm={handleCloseCanvasDialogConfirm}
        />
    );
};

export default React.memo(DiagramCanvasDialogConfirmComponent);
