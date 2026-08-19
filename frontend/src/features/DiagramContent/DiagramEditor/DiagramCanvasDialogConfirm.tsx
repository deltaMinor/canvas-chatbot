import React from "react";

import { useReactFlow } from "@xyflow/react";
import { closeSnackbar } from "notistack";

import DialogConfirm from "#root/components/DialogConfirm";
import {
    POLLING_ERROR_MESSAGE_LLM_DATAFLOW,
    POLLING_INTERVAL_LLM_DATAFLOW,
    POLLING_MESSAGE_LLM_DATAFLOW,
    POLLING_SUCCESS_MESSAGE_LLM_DATAFLOW,
} from "#root/constants/diagramCanvas";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useProjectLoader } from "#root/hooks/backendLoaderHooks";
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
import { UuidIdentifierKey } from "#root/interfaces/identifier";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import { getProjectIdFromStore } from "#root/stores/backendStore";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";
import { getDraftCanvasIdFromStore } from "#root/stores/projectDiagram/backend";
import {
    getDiagramSelectedEdgeIdListFromStore,
    getDiagramSelectedNodeIdListFromStore,
} from "#root/stores/projectDiagram/selection";
import { runWithHeavyExecutionGuard } from "#root/utils/animationFrameUtil";
import {
    handleGenerateLLMDataflow,
    processConfirmDeleteSelectedNodesAndEdges,
    refreshDataOnCompletePolling,
} from "#root/utils/diagram/diagramCanvasDialogUtil";
import { generateUUID } from "#root/utils/identifierUtil";

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
    const projectLoader = useProjectLoader();

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

    const handleClickGenerateLLMDataflow = React.useCallback(async () => {
        const draftCanvasId = getDraftCanvasIdFromStore(instanceId) ?? "";
        const projectId = getProjectIdFromStore();
        const snackbarKey = generateUUID(UuidIdentifierKey.snackbar);

        await handleCloseDialogAsync(DialogConfirmStateEnum.confirmGenerateLLMDataflow);
        await runWithHeavyExecutionGuard(async () => {
            await CallApiWithSnackbar({
                async_func: async () => {
                    return await handleGenerateLLMDataflow({
                        instanceId,
                        project_id: projectId,
                        canvas_id: draftCanvasId,
                        polling_interval: POLLING_INTERVAL_LLM_DATAFLOW,
                    });
                },
                func_on_success: async () => {
                    deselectAllNodesAndEdges();
                    await refreshDataOnCompletePolling({ projectLoader });
                },
                func_on_completion: async () => {
                    closeSnackbar(snackbarKey);
                },
                snackbarKey,
                message: POLLING_MESSAGE_LLM_DATAFLOW,
                messageOnSuccess: POLLING_SUCCESS_MESSAGE_LLM_DATAFLOW,
                messageOnError: POLLING_ERROR_MESSAGE_LLM_DATAFLOW,
                keepSnackbarOpen: true,
            });
        });
    }, [deselectAllNodesAndEdges, instanceId, projectLoader]);

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
        await handleCloseDialogAsync(DialogConfirmStateEnum.confirmGenerateLLMDataflow);
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
        {
            stateKey: DialogConfirmStateEnum.confirmGenerateLLMDataflow,
            message: "Are you sure you want to generate dataflow using LLM?",
            onClick: handleClickGenerateLLMDataflow,
            title: "Generate Dataflow Using LLM",
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
