import React from "react";

import DialogField from "#root/components/DialogField";
import { DialogFieldProp } from "#root/interfaces/dialogField";

interface DialogProps {
    dialogFieldProps: DialogFieldProp[];
    dialogFieldState: Record<string, boolean>;
    handleCloseDialogField: () => void;
}

const DialogFieldsComponent = ({
    dialogFieldProps,
    dialogFieldState,
    handleCloseDialogField,
}: DialogProps) => {
    return (
        <>
            {dialogFieldProps?.map((prop) => {
                return (
                    <DialogField //
                        key={prop.stateKey}
                        open={!!dialogFieldState?.[prop.stateKey as keyof typeof dialogFieldState]}
                        onClose={handleCloseDialogField}
                        dialogFieldProp={prop}
                    />
                );
            })}
        </>
    );
};

export default React.memo(DialogFieldsComponent);
