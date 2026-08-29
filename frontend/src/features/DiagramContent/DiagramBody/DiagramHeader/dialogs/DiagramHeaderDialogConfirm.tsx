import React from "react";

import DialogConfirm from "#root/components/DialogConfirm";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useDraggableEdgeActions, useHandleSetProcessedNodesAndEdges } from "#root/hooks/diagram";
import { useDialogState } from "#root/hooks/dialogHooks";
import { DialogConfirmStateEnum } from "#root/interfaces/dialog";
import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";
import { runWithHeavyExecutionGuard } from "#root/utils/animationFrameUtil";

import { processConfirmClearDiagram } from "./helper";

/**
 * Confirm dialogs owned by the diagram header. Currently this only wires up
 * the "Clear Diagram" confirmation opened by the Header's ClearButton - the
 * `confirmSetDiagramComplete` / `confirmUnsetDiagramComplete` flows from the
 * full application are not present in this demo, since there is no submit /
 * lock canvas button here.
 */
const DiagramHeaderDialogConfirmComponent = () => {
    const instanceId = useDiagramInstanceId();
    const dialogConfirmState = useDialogState();
    const { resetOverlappingLineSegments } = useDraggableEdgeActions();
    const handleSetProcessedNodesAndEdges = useHandleSetProcessedNodesAndEdges();

    const handleClickClearDiagram = React.useCallback(async () => {
        await handleCloseDialogAsync(DialogConfirmStateEnum.confirmClearCanvas);
        await runWithHeavyExecutionGuard(async () => {
            await processConfirmClearDiagram({
                instanceId,
                handleSetProcessedNodesAndEdges,
                resetOverlappingLineSegments,
            });
        });
    }, [handleSetProcessedNodesAndEdges, instanceId, resetOverlappingLineSegments]);

    const handleCloseDiagramHeaderDialogConfirm = React.useCallback(async () => {
        await handleCloseDialogAsync(DialogConfirmStateEnum.confirmClearCanvas);
    }, []);

    const dialogConfirmProps = [
        {
            stateKey: DialogConfirmStateEnum.confirmClearCanvas,
            message: "Are you sure you want to delete all architecture nodes and edges in this canvas?",
            onClick: handleClickClearDiagram,
            title: "Clear Diagram",
            data: [],
            warningMessage:
                "Warning! All edges connected to the node(s), including those in other canvases, will also be deleted.",
        },
    ] as ConfirmDialogProps[];

    return (
        <DialogConfirm
            dialogConfirmProps={dialogConfirmProps}
            dialogConfirmState={dialogConfirmState}
            handleCloseDialogConfirm={handleCloseDiagramHeaderDialogConfirm}
        />
    );
};

export default React.memo(DiagramHeaderDialogConfirmComponent);
