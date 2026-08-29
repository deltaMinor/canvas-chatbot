import React from "react";

import { DialogActions } from "@mui/material";

import MuiButton from "#root/components/MuiButton";

interface DiagramImportDialogActionsProps {
    noButtonText: string;
    handleCloseDialog: () => Promise<void>;
}

/**
 * The PDF-upload flow (the only import option kept in this demo) manages its
 * own confirmation inside `ImportPdfOptionBody`, so this footer only offers
 * a way to skip/close the import dialog and start with a blank canvas.
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
