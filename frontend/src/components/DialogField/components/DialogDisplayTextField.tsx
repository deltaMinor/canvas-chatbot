import { Typography } from "@mui/material";

import { DialogFieldPropFields } from "#root/interfaces/dialogField";

import DialogFieldLabelWrapper from "./DialogFieldLabelWrapper";

interface DialogDisplayTextFieldProps {
    field: DialogFieldPropFields;
}

const DialogDisplayTextFieldComponent = ({
    field, //
    // refValues,
}: DialogDisplayTextFieldProps) => {
    const displayValue = (field?.defaultValue as string) || "";

    return (
        <DialogFieldLabelWrapper field={field}>
            {displayValue.length ? (
                <Typography>{displayValue}</Typography>
            ) : (
                <Typography variant="subtitle2">None</Typography>
            )}
        </DialogFieldLabelWrapper>
    );
};

export default DialogDisplayTextFieldComponent;
