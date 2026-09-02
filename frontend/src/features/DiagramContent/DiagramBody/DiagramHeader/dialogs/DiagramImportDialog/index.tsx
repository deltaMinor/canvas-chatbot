import React from "react";

import MuiDialog from "#root/components/MuiDialog";
import { DialogStateEnum } from "#root/enums/dialog";
import { useDialogState } from "#root/hooks/dialogHooks";
import { DiagramFileOption } from "#root/interfaces/tab";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";

import DiagramImportDialogBody from "./DiagramImportDialogBody";
import DiagramImportDialogFeatureGate from "./DiagramImportDialogFeatureGate";

interface DiagramImportProps {
    dialogKey: DialogStateEnum;
    dialogTitle: string;
    noButtonText: string;
    mode: DiagramFileOption.pdf | DiagramFileOption.generatedJson;
}

const DiagramImportComponent = ({
    dialogKey, //
    dialogTitle,
    noButtonText,
    mode,
}: DiagramImportProps) => {
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
            <DiagramImportDialogFeatureGate>
                <DiagramImportDialogBody //
                    dialogTitle={dialogTitle}
                    noButtonText={noButtonText}
                    handleCloseDialog={handleCloseDialog}
                    mode={mode}
                />
            </DiagramImportDialogFeatureGate>
        </MuiDialog>
    );
};

export default React.memo(DiagramImportComponent) as typeof DiagramImportComponent;
