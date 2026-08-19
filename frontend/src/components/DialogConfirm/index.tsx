import React from "react";

import MuiDialog from "#root/components/MuiDialog";
import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";

import DialogConfirmContent from "./DialogConfirmContent";

interface DialogConfirmComponentProps {
    dialogConfirmProps: ConfirmDialogProps[];
    dialogConfirmState: Record<string, boolean>;
    handleCloseDialogConfirm: () => void;
    handleCloseDialogClickOut?: () => void;
}

const DialogConfirmComponent = ({
    handleCloseDialogConfirm,
    handleCloseDialogClickOut,
    dialogConfirmProps,
    dialogConfirmState,
}: DialogConfirmComponentProps) => {
    const handleCloseDialog = () => handleCloseDialogConfirm();

    // Force user to provide an answer to the dialog
    const handleCloseDialogClickOutDefault = () => {
        handleCloseDialog();
    };

    const handleClose = () => {
        if (!!handleCloseDialogClickOut) {
            return handleCloseDialogClickOut();
        }
        handleCloseDialogClickOutDefault();
    };

    return (
        <>
            {dialogConfirmProps?.map((prop: ConfirmDialogProps, index: number) => {
                const { stateKey } = prop;
                const open = !!dialogConfirmState?.[stateKey as keyof typeof dialogConfirmState];
                return (
                    <MuiDialog
                        key={`${prop?.stateKey}_${index}`}
                        open={open}
                        onClose={handleClose}
                        maxWidth={prop?.maxWidth ? prop?.maxWidth : "sm"}
                        fullWidth
                    >
                        <DialogConfirmContent
                            handleCloseDialog={handleCloseDialog}
                            prop={prop}
                        />
                    </MuiDialog>
                );
            })}
        </>
    );
};

export default React.memo(DialogConfirmComponent);
