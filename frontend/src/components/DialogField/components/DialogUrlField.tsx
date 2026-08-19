import React from "react";

import { Stack } from "@mui/material";

import MuiTextField from "#root/components/MuiTextField";
import { DialogFieldComponentProps } from "#root/interfaces/dialogField";

import DialogFieldLabelWrapper from "./DialogFieldLabelWrapper";

interface DialogUrlFieldProps extends DialogFieldComponentProps {}

const DialogUrlFieldComponent = ({
    field, //
    refValues,
    disabled,
}: DialogUrlFieldProps) => {
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
            <Stack
                direction="row"
                className="items-center"
            >
                <MuiTextField
                    id={`MuiTextField-DialogUrlFieldComponent-https`} //
                    disabled={true}
                    size="small"
                    defaultValue="https://"
                />
                <MuiTextField
                    id={`MuiTextField-DialogUrlFieldComponent-${field.id}`} //
                    defaultValue={(field?.defaultValue as string) || ""}
                    //
                    handleChange={handleChange} //
                    disabled={!!disabled || !!fieldDisabled}
                    size="small"
                    {...(field?.maxChar && { maxChar: field.maxChar })}
                    {...(field?.validatorString && { validatorString: field.validatorString })}
                    allowSpaceChar={false}
                    {...(field?.validateTextInput !== undefined && {
                        validateTextInput: field.validateTextInput,
                    })}
                    fullWidth
                />
                <MuiTextField
                    id={`MuiTextField-DialogUrlFieldComponent-domain`} //
                    disabled={true}
                    fullWidth
                    size="small"
                    defaultValue={field?.domain}
                />
            </Stack>
        </DialogFieldLabelWrapper>
    );
};

export default DialogUrlFieldComponent;
