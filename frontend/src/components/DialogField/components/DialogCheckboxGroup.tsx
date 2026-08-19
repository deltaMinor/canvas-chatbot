import React from "react";

import { Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText } from "@mui/material";

import { OptionLabel } from "#root/interfaces";
import { DialogFieldComponentProps } from "#root/interfaces/dialogField";

import DialogFieldLabelWrapper from "./DialogFieldLabelWrapper";

const DialogCheckboxGroupComponent = ({
    field,
    refValues,
    disabled,
}: DialogFieldComponentProps) => {
    const options = (field?.options || []) as OptionLabel[];

    const getInitialValues = () => {
        if (!field?.defaultValue || !Array.isArray(field?.defaultValue)) {
            return [];
        }
        return (field?.defaultValue as string[]) || [];
    };

    // Hooks
    const [selectedValues, setSelectedValues] = React.useState<string[]>(getInitialValues());

    const isComponentDisabled = !!disabled || !!field.disabled;

    const updateCheckedField = React.useCallback(
        (checked: boolean, optionValue: string) => {
            let newSelectedValues: string[];

            if (checked) {
                newSelectedValues = [...selectedValues, optionValue];
            } else {
                newSelectedValues = selectedValues.filter((val) => val !== optionValue);
            }

            setSelectedValues(newSelectedValues);

            if (!!field.handleChange) field.handleChange(newSelectedValues);
            refValues.current[field.id] = newSelectedValues;
            if (!!field?.updateHiddenStates) field.updateHiddenStates();
        },
        [selectedValues, field, refValues]
    );

    const isOptionSelected = (optionValue: string) => {
        return selectedValues.includes(optionValue);
    };

    React.useEffect(() => {
        if (!field?.required) return;
        refValues.current[field.id] = field?.defaultValue ?? [];
        if (!!field?.updateHiddenStates) field.updateHiddenStates();
    }, [field, refValues]);

    return (
        <DialogFieldLabelWrapper field={field}>
            <FormControl
                component="fieldset"
                disabled={isComponentDisabled}
            >
                <FormGroup>
                    {options.map((option) => (
                        <FormControlLabel
                            key={option.value}
                            control={
                                <Checkbox
                                    size="small"
                                    id={`${field.id}_${option.value}`}
                                    checked={isOptionSelected(option?.value.toString())}
                                    onChange={(_event, checked) =>
                                        updateCheckedField(checked, option?.value.toString())
                                    }
                                    disabled={isComponentDisabled || option.isDisabled}
                                />
                            }
                            label={option.label}
                        />
                    ))}
                </FormGroup>
                {field?.value && <FormHelperText>{field?.value?.toString()}</FormHelperText>}
            </FormControl>
        </DialogFieldLabelWrapper>
    );
};

export default React.memo(DialogCheckboxGroupComponent);
