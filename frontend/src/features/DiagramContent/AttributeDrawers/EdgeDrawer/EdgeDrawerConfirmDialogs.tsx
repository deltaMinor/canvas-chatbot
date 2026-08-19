import React from "react";

import { useAttributeDrawerFormBridge } from "#root/components/DiagramAttributeForm/useAttributeDrawerFormBridge";
import DialogConfirm from "#root/components/DialogConfirm";
import { dialogConfirmStateKeys } from "#root/constants/diagramDrawerEdge";
import { useDiagramDraftEdge } from "#root/hooks/diagram";
import { useDialogState } from "#root/hooks/dialogHooks";
import { DialogConfirmState } from "#root/interfaces/dialog";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";

interface EdgeDrawerConfirmDialogsProps {
    onDelete: () => Promise<void>;
}

const EdgeDrawerConfirmDialogsComponent = ({ onDelete }: EdgeDrawerConfirmDialogsProps) => {
    const draftEdge = useDiagramDraftEdge();
    const dialogConfirmState = useDialogState();
    const formBridge = useAttributeDrawerFormBridge();

    const handleCloseDialogConfirm = React.useCallback(async () => {
        await handleCloseDialogAsync(dialogConfirmStateKeys.closeDrawerEdge);
        await handleCloseDialogAsync(dialogConfirmStateKeys.deleteEdge);
    }, []);

    const handleClickSaveDrawerEdge = React.useCallback(async () => {
        await handleCloseDialogAsync(dialogConfirmStateKeys.closeDrawerEdge);
        await formBridge.submitForm();
    }, [formBridge]);

    const handleClickDiscardDrawerEdge = React.useCallback(async () => {
        await formBridge.closeWithoutSaving();
    }, [formBridge]);

    const handleClickDeleteDrawerEdge = React.useCallback(async () => {
        await onDelete();
    }, [onDelete]);

    return (
        <DialogConfirm
            dialogConfirmProps={[
                {
                    stateKey: dialogConfirmStateKeys.closeDrawerEdge as keyof DialogConfirmState,
                    title: "Save changes to this edge?",
                    message: "",
                    data: [draftEdge?.data?.label || "Edge"],
                    onClick: handleClickSaveDrawerEdge,
                    onClickNo: handleClickDiscardDrawerEdge,
                    buttonLabelMapping: {
                        no: "Discard",
                        yes: "Save",
                    },
                },
                {
                    stateKey: dialogConfirmStateKeys.deleteEdge as keyof DialogConfirmState,
                    title: "Delete Edge",
                    message: "Are you sure you want to delete the selected edge?",
                    data: [draftEdge?.data?.label || "Edge"],
                    onClick: handleClickDeleteDrawerEdge,
                },
            ]}
            dialogConfirmState={dialogConfirmState}
            handleCloseDialogConfirm={handleCloseDialogConfirm}
        />
    );
};

export default React.memo(
    EdgeDrawerConfirmDialogsComponent
) as typeof EdgeDrawerConfirmDialogsComponent;
