import React from "react";

import dayjs from "dayjs";

import MuiDatePicker from "#root/components/DatePicker";
import { DialogFieldComponentProps } from "#root/interfaces/dialogField";

import DialogFieldLabelWrapper from "./DialogFieldLabelWrapper";

interface DialogDatePickerFieldProps extends DialogFieldComponentProps {}

const DialogDatePickerFieldComponent = ({
    field, //
    refValues,
    disabled,
}: DialogDatePickerFieldProps) => {
    const { disabled: fieldDisabled } = field;

    const handleChange = async (value: dayjs.Dayjs | null, _context: unknown) => {
        const _value = value?.format("YYYY-MM-DD");
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
            <div>
                <MuiDatePicker
                    defaultValue={(field?.defaultValue as string) ?? ""} //
                    disabled={!!disabled || !!fieldDisabled}
                    onChange={handleChange}
                />
            </div>
        </DialogFieldLabelWrapper>
    );
};

export default DialogDatePickerFieldComponent;
