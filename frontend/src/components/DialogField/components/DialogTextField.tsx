import React from "react";

import MuiTextField from "#root/components/MuiTextField";
import { DialogFieldComponentProps } from "#root/interfaces/dialogField";

import DialogFieldLabelWrapper from "./DialogFieldLabelWrapper";

interface DialogTextFieldProps extends DialogFieldComponentProps {
    displayAsTextArea?: boolean;
    multiline?: boolean;
}

const DialogTextFieldComponent = ({
    field,
    refValues,
    disabled,
    ...props //
}: DialogTextFieldProps) => {
    const { disabled: fieldDisabled } = field;

    const handleChange = async (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> //
    ) => {
        const _value = event.target.value;
        if (!!field.handleChange) field.handleChange(_value);
        refValues.current[field.id] = _value as string;
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
            <MuiTextField
                id={`MuiTextField-DialogTextFieldComponent-${field.id}`}
                defaultValue={(field?.defaultValue as string) || ""}
                //
                handleChange={handleChange} //
                {...(field?.autoComplete && { autoComplete: field.autoComplete })}
                disabled={!!disabled || !!fieldDisabled}
                size="small"
                {...(field?.maxChar && { maxChar: field.maxChar })}
                {...(field?.validatorString && { validatorString: field.validatorString })}
                {...(field?.allowSpaceChar !== undefined && {
                    allowSpaceChar: field.allowSpaceChar,
                })}
                {...(field?.validateTextInput !== undefined && {
                    validateTextInput: field.validateTextInput,
                })}
                fullWidth
                displayAsTextArea={!!props?.displayAsTextArea}
                multiline={!!props?.multiline}
            />
        </DialogFieldLabelWrapper>
    );
};

export default DialogTextFieldComponent;
