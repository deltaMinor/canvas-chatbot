import React from "react";

import MuiDialog from "#root/components/MuiDialog";
import { DialogStateEnum } from "#root/enums/dialog";
import { useDialogState } from "#root/hooks/dialogHooks";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";

import DiagramSetupDialogBody from "./DiagramSetupDialogBody";
import DiagramSetupDialogFeatureGate from "./DiagramSetupDialogFeatureGate";

interface DiagramSetupProps {
    dialogKey: DialogStateEnum;
    dialogTitle: string;
    noButtonText: string;
}

const DiagramSetupComponent = ({
    dialogKey, //
    dialogTitle,
    noButtonText,
}: DiagramSetupProps) => {
    const dialogState = useDialogState();

    const handleCloseDialog = React.useCallback(async () => {
        await handleCloseDialogAsync(dialogKey);
    }, [dialogKey]);

    return (
        <MuiDialog
            open={!!dialogState?.[dialogKey]} //
            onClose={handleCloseDialog}
            className="dialog"
            fullWidth
            maxWidth="md"
        >
            <DiagramSetupDialogFeatureGate>
                <DiagramSetupDialogBody //
                    dialogTitle={dialogTitle}
                    noButtonText={noButtonText}
                    handleCloseDialog={handleCloseDialog}
                />
            </DiagramSetupDialogFeatureGate>
        </MuiDialog>
    );
};

export default React.memo(DiagramSetupComponent) as typeof DiagramSetupComponent;
