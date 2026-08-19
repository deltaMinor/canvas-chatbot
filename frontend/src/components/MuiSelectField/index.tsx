import React from "react";

import { SelectChangeEvent } from "@mui/material";
import { FormikValues, useFormikContext } from "formik";

import { SelectableValue } from "#root/interfaces";
import { Question } from "#root/interfaces/questionnaire";
import { ConceptionQuestionnaireFactory } from "#root/lib/ConceptionQuestionnaireFactory";

import StyledMuiSelectField from "./StyledMuiSelectField";

interface MuiSelectFieldProps {
    name: string;
    handleChange: (value: SelectableValue | SelectableValue[]) => void;
    fieldValue: SelectableValue | SelectableValue[];
    disabled?: boolean;
    options: SelectableValue[];
    question: Question;
    multiple?: boolean;
    size?: "small" | "medium";
}

const MuiSelectFieldComponent = ({
    handleChange,
    fieldValue,
    options,
    question,
    size,
    ...props
}: MuiSelectFieldProps) => {
    const [selectableValue, setSelectableValue] = React.useState<
        SelectableValue | SelectableValue[]
    >();

    const formContext = useFormikContext<FormikValues>();
    const formValues = formContext?.values;

    const handleSave = (selectableToSave: SelectableValue | SelectableValue[]) => {
        setSelectableValue(selectableToSave);
        handleChange(selectableToSave);
    };

    const handleSelect = (event: SelectChangeEvent<unknown>, _child: React.ReactNode) => {
        let _selectableValue =
            options?.find((o) => o?.value === event?.target?.value) || ({} as SelectableValue);

        const CQFactory = new ConceptionQuestionnaireFactory(question, formValues);
        _selectableValue = CQFactory.appendRefToSelectableValue(
            _selectableValue,
            question?.fieldId
        );

        handleSave(_selectableValue);
    };

    const handleSelectMultiple = (event: SelectChangeEvent<unknown>, _child: React.ReactNode) => {
        let _selectableValues = [] as SelectableValue[];
        (event?.target?.value as string[])?.forEach((value) => {
            const option = options?.find((o) => o?.value === value);
            if (!option) return;
            _selectableValues.push(option);
        });

        const CQFactory = new ConceptionQuestionnaireFactory(question, formValues);
        _selectableValues = CQFactory.appendRefToSelectableValues(
            _selectableValues,
            question?.fieldId
        );

        handleSave(_selectableValues);
    };

    React.useEffect(() => {
        setSelectableValue(
            fieldValue ?? (!!props?.multiple ? ([] as SelectableValue[]) : ({} as SelectableValue))
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fieldValue]);

    const value = ((selectableValue as SelectableValue) || {})?.value || "";
    const values =
        Array.isArray(selectableValue) && (selectableValue as SelectableValue[])?.length
            ? (selectableValue as SelectableValue[])?.map((v) => v?.value)
            : [];

    return props?.multiple ? (
        <StyledMuiSelectField //
            id="MuiSelectFieldComponent__multi"
            placeholder="Select one or more options"
            options={options}
            selectProps={{
                disabled: !!props?.disabled,
                multiple: true,
                name: props?.name, //
                value: values,
                size: size ?? "small",
                onChange: handleSelectMultiple,
            }}
        />
    ) : (
        <StyledMuiSelectField //
            id="MuiSelectFieldComponent__single"
            placeholder="Select an option"
            options={options}
            selectProps={{
                disabled: !!props?.disabled,
                multiple: false,
                name: props?.name, //
                value,
                size: size ?? "small",
                onChange: handleSelect,
            }}
        />
    );
};

export default React.memo(MuiSelectFieldComponent);
