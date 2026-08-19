import React from "react";

import MuiTextFieldPassword from "#root/components/MuiTextFieldPassword";
import { DialogFieldComponentProps } from "#root/interfaces/dialogField";

import DialogFieldLabelWrapper from "./DialogFieldLabelWrapper";

interface DialogPasswordFieldProps extends DialogFieldComponentProps {}

const DialogPasswordFieldComponent = ({
    field, //
    refValues,
    disabled,
}: DialogPasswordFieldProps) => {
    const isComponentDisabled = !!disabled || !!field.disabled;

    const handleChangePassword = async (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const fieldValue = e.target.value;
        if (!!field.handleChange) field.handleChange(fieldValue);
        refValues.current[field.id] = fieldValue;
        if (!!field?.updateHiddenStates) field.updateHiddenStates();
    };

    React.useEffect(() => {
        if (!field?.required) return;
        refValues.current[field.id] = field?.defaultValue ?? "";
        if (!!field?.updateHiddenStates) field.updateHiddenStates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <DialogFieldLabelWrapper field={field}>
            <MuiTextFieldPassword
                id={field?.id}
                // label={field?.label || "Unknown"}
                name={field?.label || "Unknown"}
                handleChangePassword={handleChangePassword}
                //
                {...(field?.validatorString && { validatorString: field.validatorString })}
                allowSpaceChar={!!field?.allowSpaceChar}
                disabled={!!isComponentDisabled}
            />
        </DialogFieldLabelWrapper>
    );
};

export default DialogPasswordFieldComponent;
