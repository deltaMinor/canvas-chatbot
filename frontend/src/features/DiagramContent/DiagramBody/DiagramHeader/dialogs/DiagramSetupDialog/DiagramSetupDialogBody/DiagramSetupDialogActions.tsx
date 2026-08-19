import React from "react";

import { DialogActions } from "@mui/material";

import MuiButton from "#root/components/MuiButton";

interface DiagramSetupDialogActionsProps {
    noButtonText: string;
    handleCloseDialog: () => Promise<void>;
}

/**
 * The PDF-upload flow (the only setup option kept in this demo) manages its
 * own confirmation inside `ImportPdfOptionBody`, so this footer only offers
 * a way to skip/close the setup dialog and start with a blank canvas.
 */
const DiagramSetupDialogActionsComponent = ({
    noButtonText,
    handleCloseDialog,
}: DiagramSetupDialogActionsProps) => {
    const handleClickClose = React.useCallback(() => {
        void handleCloseDialog();
    }, [handleCloseDialog]);

    return (
        <DialogActions>
            <MuiButton onClick={handleClickClose}>{noButtonText}</MuiButton>
        </DialogActions>
    );
};

export default DiagramSetupDialogActionsComponent;
