import React from "react";

import { DialogActions } from "@mui/material";

import MuiButton from "#root/components/MuiButton";

interface DiagramImportDialogActionsProps {
    noButtonText: string;
    handleCloseDialog: () => Promise<void>;
}

/**
 * Both the PDF-upload dialog and the generated-diagrams dialog manage their
 * own confirmation inside their respective option body components, so this
 * shared footer only offers a way to skip/close the dialog.
 */
const DiagramImportDialogActionsComponent = ({
    noButtonText,
    handleCloseDialog,
}: DiagramImportDialogActionsProps) => {
    const handleClickClose = React.useCallback(() => {
        void handleCloseDialog();
    }, [handleCloseDialog]);

    return (
        <DialogActions>
            <MuiButton onClick={handleClickClose}>{noButtonText}</MuiButton>
        </DialogActions>
    );
};

export default DiagramImportDialogActionsComponent;
