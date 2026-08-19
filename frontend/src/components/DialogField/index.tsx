import React from "react";

import MuiDialog from "#root/components/MuiDialog";
import { DialogFieldProp } from "#root/interfaces/dialogField";

import DialogFieldBody from "./DialogFieldBody";

interface FieldDialogProps {
    open: boolean;
    onClose: () => void;
    dialogFieldProp: DialogFieldProp;
}

const DialogFieldComponent = ({
    open, //
    onClose,
    dialogFieldProp,
}: FieldDialogProps) => {
    const [closeRequestCount, setCloseRequestCount] = React.useState(0);

    // Hooked
    const isLargeFieldPresent = !!dialogFieldProp?.fields?.find((f) => {
        return !!f?.largeField;
    });
    const {
        maxWidth = isLargeFieldPresent ? "lg" : "xs", //
    } = dialogFieldProp;

    const handleClose = React.useCallback(() => {
        setCloseRequestCount((count) => count + 1);
    }, []);

    React.useEffect(() => {
        if (open) return;

        setCloseRequestCount(0);
    }, [open]);

    return (
        <MuiDialog //
            open={open}
            onClose={handleClose}
            maxWidth={maxWidth}
            fullWidth
        >
            <DialogFieldBody
                dialogFieldProp={dialogFieldProp} //
                maxWidth={maxWidth}
                closeRequestCount={closeRequestCount}
                onClose={onClose}
            />
        </MuiDialog>
    );
};

export default React.memo(DialogFieldComponent);
