import React from "react";

import DialogConfirm from "#root/components/DialogConfirm";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useHandleSetProcessedNodesAndEdges } from "#root/hooks/diagram";
import { useDialogState } from "#root/hooks/dialogHooks";
import { DialogConfirmStateEnum } from "#root/interfaces/dialog";
import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";
import { runWithHeavyExecutionGuard } from "#root/utils/animationFrameUtil";

import { processConfirmClearDiagram } from "./helper";

const DiagramHeaderDialogConfirmComponent = () => {
    const instanceId = useDiagramInstanceId();
    const dialogConfirmState = useDialogState();
    const handleSetProcessedNodesAndEdges = useHandleSetProcessedNodesAndEdges();

    const handleClearDiagram = React.useCallback(async () => {
        await CallApiWithSnackbar({
            async_func: async () => {
                await processConfirmClearDiagram({
                    instanceId,
                    handleSetProcessedNodesAndEdges,
                });
            },
            message: "Clearing diagram ...",
            messageOnError: "Failed to clear diagram.",
        });
    }, [handleSetProcessedNodesAndEdges, instanceId]);

    const handleClickClearDiagram = React.useCallback(async () => {
        await handleCloseDialogAsync(DialogConfirmStateEnum.confirmClearCanvas);
        await runWithHeavyExecutionGuard(handleClearDiagram);
    }, [handleClearDiagram]);

    const handleCloseDiagramHeaderDialogConfirm = React.useCallback(async () => {
        await handleCloseDialogAsync(DialogConfirmStateEnum.confirmClearCanvas);
    }, []);

    const dialogConfirmProps = [
        {
            stateKey: DialogConfirmStateEnum.confirmClearCanvas,
            message:
                "Are you sure you want to delete all architecture nodes and edges in this canvas?",
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
