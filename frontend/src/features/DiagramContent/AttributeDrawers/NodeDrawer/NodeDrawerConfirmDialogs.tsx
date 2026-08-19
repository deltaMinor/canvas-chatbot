import React from "react";

import { useAttributeDrawerFormBridge } from "#root/components/DiagramAttributeForm/useAttributeDrawerFormBridge";
import DialogConfirm from "#root/components/DialogConfirm";
import { dialogConfirmStateKeys } from "#root/constants/diagramDrawerNode";
import { useDiagramDraftNode } from "#root/hooks/diagram";
import { useDialogState } from "#root/hooks/dialogHooks";
import { DialogConfirmState } from "#root/interfaces/dialog";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";

interface NodeDrawerConfirmDialogsProps {
    onDelete: () => Promise<void>;
}

const NodeDrawerConfirmDialogsComponent = ({ onDelete }: NodeDrawerConfirmDialogsProps) => {
    const draftNode = useDiagramDraftNode();
    const dialogConfirmState = useDialogState();
    const formBridge = useAttributeDrawerFormBridge();

    const handleCloseDialogConfirm = React.useCallback(async () => {
        await handleCloseDialogAsync(dialogConfirmStateKeys.closeDrawerNode);
        await handleCloseDialogAsync(dialogConfirmStateKeys.deleteNode);
    }, []);

    const handleClickSaveDrawerNode = React.useCallback(async () => {
        await handleCloseDialogAsync(dialogConfirmStateKeys.closeDrawerNode);
        await formBridge.submitForm();
    }, [formBridge]);

    const handleClickDiscardDrawerNode = React.useCallback(async () => {
        await formBridge.closeWithoutSaving();
    }, [formBridge]);

    const handleClickDeleteDrawerNode = React.useCallback(async () => {
        await onDelete();
    }, [onDelete]);

    return (
        <DialogConfirm
            dialogConfirmProps={[
                {
                    stateKey: dialogConfirmStateKeys.closeDrawerNode as keyof DialogConfirmState,
                    title: "Save changes to this node?",
                    message: "",
                    data: [draftNode?.data?.label || "Node"],
                    onClick: handleClickSaveDrawerNode,
                    onClickNo: handleClickDiscardDrawerNode,
                    buttonLabelMapping: {
                        no: "Discard",
                        yes: "Save",
                    },
                },
                {
                    stateKey: dialogConfirmStateKeys.deleteNode as keyof DialogConfirmState,
                    title: "Delete Node",
                    message: "Are you sure you want to delete the selected node?",
                    data: [draftNode?.data?.label || "Node"],
                    warningMessage:
                        "Warning! All connected edges, including those in other canvases, will also be deleted.",
                    onClick: handleClickDeleteDrawerNode,
                },
            ]}
            dialogConfirmState={dialogConfirmState}
            handleCloseDialogConfirm={handleCloseDialogConfirm}
        />
    );
};

export default React.memo(
    NodeDrawerConfirmDialogsComponent
) as typeof NodeDrawerConfirmDialogsComponent;
