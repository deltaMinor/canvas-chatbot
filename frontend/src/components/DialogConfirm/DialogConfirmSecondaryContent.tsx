import React from "react";

import { Alert, DialogActions, DialogContent, DialogContentText, Stack } from "@mui/material";

import MuiButton from "#root/components/MuiButton";
import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";

type SecondaryConfirmProps = NonNullable<ConfirmDialogProps["secondaryConfirmNo"]>;

interface DialogConfirmSecondaryContentProps {
    className?: string;
    confirmProps: SecondaryConfirmProps;
    handleCancel: () => void;
    handleConfirm: () => void;
}

const DialogConfirmSecondaryContent = ({
    className,
    confirmProps,
    handleCancel,
    handleConfirm,
}: DialogConfirmSecondaryContentProps) => {
    return (
        <>
            <DialogContent {...(className && { className })}>
                <Stack spacing={1}>
                    <DialogContentText>{confirmProps.message}</DialogContentText>
                    {!!confirmProps.warningMessage && (
                        <Alert
                            variant="outlined"
                            severity="warning"
                        >
                            {confirmProps.warningMessage}
                        </Alert>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <MuiButton
                    onClick={handleCancel}
                    color="secondary"
                    size="medium"
                    {...confirmProps.buttonProps?.no}
                >
                    {confirmProps.buttonLabelMapping?.no || "No"}
                </MuiButton>
                <MuiButton
                    onClick={handleConfirm}
                    autoFocus
                    variant="contained"
                    size="medium"
                    {...confirmProps.buttonProps?.yes}
                >
                    {confirmProps.buttonLabelMapping?.yes || "Yes"}
                </MuiButton>
            </DialogActions>
        </>
    );
};

export default React.memo(DialogConfirmSecondaryContent);
