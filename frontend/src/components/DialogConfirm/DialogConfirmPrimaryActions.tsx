import React from "react";

import { DialogActions } from "@mui/material";

import MuiButton from "#root/components/MuiButton";
import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";

interface DialogConfirmPrimaryActionsProps {
    handleCloseDialog: () => void;
    prop: ConfirmDialogProps;
    setShowSecondaryNo: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSecondaryYes: React.Dispatch<React.SetStateAction<boolean>>;
    showSecondaryNo: boolean;
    showSecondaryYes: boolean;
}

const DialogConfirmPrimaryActions = ({
    handleCloseDialog,
    prop,
    setShowSecondaryNo,
    setShowSecondaryYes,
    showSecondaryNo,
    showSecondaryYes,
}: DialogConfirmPrimaryActionsProps) => {
    return (
        <DialogActions>
            <MuiButton
                onClick={() => {
                    if (!!prop?.secondaryConfirmNo) {
                        setShowSecondaryNo(true);
                        return;
                    }
                    if (!!prop.onClickNo) prop.onClickNo();
                    handleCloseDialog();
                }}
                disabled={!!showSecondaryNo || !!showSecondaryYes}
                color="secondary"
                {...prop?.buttonProps?.no}
            >
                {prop?.buttonLabelMapping?.no || "No"}
            </MuiButton>
            <MuiButton
                onClick={() => {
                    if (!!prop?.secondaryConfirmYes) {
                        setShowSecondaryYes(true);
                        return;
                    }
                    if (!!prop.onClick) prop.onClick();
                    handleCloseDialog();
                }}
                autoFocus
                variant="contained"
                disabled={!!showSecondaryNo || !!showSecondaryYes}
                {...prop?.buttonProps?.yes}
            >
                {prop?.buttonLabelMapping?.yes || "Yes"}
            </MuiButton>
        </DialogActions>
    );
};

export default React.memo(DialogConfirmPrimaryActions);
