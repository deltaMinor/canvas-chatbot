import React from "react";

import { SelectChangeEvent } from "@mui/material";
import { FormikValues, useFormikContext } from "formik";

import { SelectableValue, SelectableValueGroup } from "#root/interfaces";
import { Question } from "#root/interfaces/questionnaire";
import { ConceptionQuestionnaireFactory } from "#root/lib/ConceptionQuestionnaireFactory";

import StyledMuiSelectFieldGroup from "./StyledMuiSelectFieldGroup";

interface MuiSelectFieldGroupProps {
    name: string;
    handleChange: (value: SelectableValue | SelectableValue[]) => void;
    fieldValue: SelectableValue | SelectableValue[];
    disabled?: boolean;
    options: SelectableValueGroup[];
    question: Question;
    multiple?: boolean;
    size?: "small" | "medium";
}

const MuiSelectFieldGroupComponent = ({
    handleChange,
    fieldValue,
    options,
    question,
    size,
    ...props
}: MuiSelectFieldGroupProps) => {
    const [selectableValue, setSelectableValue] = React.useState<
        SelectableValue | SelectableValue[]
    >();

    const formContext = useFormikContext<FormikValues>();
    const formValues = formContext?.values;

    const all_options = options?.flatMap((o) => o.options) || [];

    const handleSave = (selectableToSave: SelectableValue | SelectableValue[]) => {
        setSelectableValue(selectableToSave);
        handleChange(selectableToSave);
    };

    const handleSelect = (event: SelectChangeEvent<unknown>, _child: React.ReactNode) => {
        let _selectableValue =
            all_options?.find((o) => o?.value === event?.target?.value) || ({} as SelectableValue);

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
            const option = all_options?.find((o) => o?.value === value);
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

    const value = ((selectableValue as SelectableValue) || {})?.value || undefined;
    const values =
        Array.isArray(selectableValue) && (selectableValue as SelectableValue[])?.length
            ? (selectableValue as SelectableValue[])?.map((v) => v?.value)
            : [];
    return props?.multiple ? (
        <StyledMuiSelectFieldGroup //
            id="MuiSelectFieldGroupComponent__multi"
            placeholder="Select one or more options"
            options={options}
            selectProps={{
                disabled: props?.disabled ?? true,
                multiple: true,
                name: props?.name, //
                value: values,
                size: size ?? "small",
                onChange: handleSelectMultiple,
            }}
        />
    ) : (
        <StyledMuiSelectFieldGroup //
            id="MuiSelectFieldGroupComponent__single"
            placeholder="Select an option"
            options={options}
            selectProps={{
                disabled: props?.disabled ?? true,
                multiple: false,
                name: props?.name, //
                value: value ?? "",
                displayEmpty: true,
                ...(value ? {} : { renderValue: () => "Select an option" }),
                size: size ?? "small",
                onChange: handleSelect,
            }}
        />
    );
};

export default React.memo(MuiSelectFieldGroupComponent);
