import React from "react";
import { ActionMeta, MultiValue, SingleValue } from "react-select";

import ReactSelectGrouped from "#root/components/ReactSelect/ReactSelectGrouped";
import { OptionLabel, SelectableValueGroup } from "#root/interfaces";
import { DialogFieldComponentProps } from "#root/interfaces/dialogField";
import { convertSelectableValueGroupToGroupLabel } from "#root/lib/react-select";

import DialogFieldLabelWrapper from "./DialogFieldLabelWrapper";

interface DialogSelectGroupFieldProps extends DialogFieldComponentProps {
    isMulti?: boolean;
}

const normalizeGroupOptions = (groups: SelectableValueGroup[] = []) => {
    return groups.map((group) => ({
        label: group.label,
        options: (group.options || []).map((option) => ({
            ...option,
            value: option.value ?? (option as { optionId?: string }).optionId ?? "",
        })),
    }));
};

const DialogSelectGroupFieldComponent = ({
    field,
    refValues,
    disabled,
    isMulti,
}: DialogSelectGroupFieldProps) => {
    const isComponentDisabled = !!disabled || !!field.disabled;

    const rawGroups =
        (field as unknown as { optionsGroup?: SelectableValueGroup[] }).optionsGroup || [];
    const groups = normalizeGroupOptions(rawGroups);
    const hasOptionTags = groups.some((group) =>
        group.options.some((opt) => (opt.tags?.length ?? 0) > 0)
    );

    const groupLabels = groups.map(convertSelectableValueGroupToGroupLabel);

    const getInitValueSingle = () => {
        const defaultValue = field?.defaultValue;
        if (typeof defaultValue === "string") {
            for (const group of groupLabels) {
                const found = group.options.find((opt) => `${opt.value}` === `${defaultValue}`);
                if (found) return found;
            }
        }
        return null;
    };

    const getInitValueMulti = () => {
        const defaultValues = Array.isArray(field?.defaultValue)
            ? (field.defaultValue as string[])
            : [];
        const selected: OptionLabel[] = [];
        for (const value of defaultValues) {
            for (const group of groupLabels) {
                const found = group.options.find((opt) => `${opt.value}` === `${value}`);
                if (found) {
                    selected.push(found);
                    break;
                }
            }
        }
        return selected;
    };

    const [value, setValue] = React.useState<SingleValue<OptionLabel>>(getInitValueSingle());
    const [valueArr, setValueArr] = React.useState<MultiValue<OptionLabel>>(getInitValueMulti());

    const handleChangeSingle = (
        newValue: SingleValue<OptionLabel>,
        _actionMeta: ActionMeta<OptionLabel>
    ) => {
        setValue(newValue);
        const nextValue = `${newValue?.value ?? ""}`;
        if (field.handleChange) field.handleChange(nextValue);
        refValues.current[field.id] = nextValue;
        if (field?.updateHiddenStates) field.updateHiddenStates();
    };

    const handleChangeMulti = (
        newValue: MultiValue<OptionLabel>,
        _actionMeta: ActionMeta<OptionLabel>
    ) => {
        setValueArr(newValue);
        const nextValues = newValue.map((opt) => `${opt.value}`);
        if (field.handleChange) field.handleChange(nextValues);
        refValues.current[field.id] = nextValues;
        if (field?.updateHiddenStates) field.updateHiddenStates();
    };

    React.useEffect(() => {
        refValues.current[field.id] = field?.defaultValue ?? (isMulti ? [] : "");
        if (field?.updateHiddenStates) field.updateHiddenStates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <DialogFieldLabelWrapper field={field}>
            {isMulti ? (
                <ReactSelectGrouped
                    isMulti
                    value={valueArr}
                    handleChange={handleChangeMulti}
                    options={groupLabels}
                    hasOptionTags={hasOptionTags}
                    isDisabled={isComponentDisabled}
                    size="small"
                    fullWidth
                />
            ) : (
                <ReactSelectGrouped
                    value={value}
                    handleChange={handleChangeSingle}
                    options={groupLabels}
                    hasOptionTags={hasOptionTags}
                    isDisabled={isComponentDisabled}
                    size="small"
                    fullWidth
                />
            )}
        </DialogFieldLabelWrapper>
    );
};

export default DialogSelectGroupFieldComponent;
