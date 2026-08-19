import React from "react";

import { Switch } from "@mui/material";

import { DialogFieldComponentProps } from "#root/interfaces/dialogField";

import DialogFieldLabelWrapper from "./DialogFieldLabelWrapper";

const DialogToggleField = ({ field, refValues, disabled }: DialogFieldComponentProps) => {
    const [checked, setChecked] = React.useState<boolean>(
        typeof field.defaultValue === "boolean" ? field.defaultValue : false
    );

    React.useEffect(() => {
        refValues.current[field.id] = checked;
    }, [checked, field.id, refValues]);

    const handleChange = () => {
        setChecked((prev) => !prev);
    };

    return (
        <DialogFieldLabelWrapper
            field={field}
            inline
        >
            <Switch
                checked={checked}
                onChange={handleChange}
                disabled={!!disabled || !!field.disabled}
            />
        </DialogFieldLabelWrapper>
    );
};

export default React.memo(DialogToggleField);
