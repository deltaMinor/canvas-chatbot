import React from "react";
import { ActionMeta, MultiValue, SingleValue } from "react-select";

import ReactSelect from "#root/components/ReactSelect";
import { OptionLabel } from "#root/interfaces";
import { DialogFieldComponentProps } from "#root/interfaces/dialogField";
import { getOrderedValue } from "#root/utils/dialogFieldUtil";

import DialogFieldLabelWrapper from "./DialogFieldLabelWrapper";

interface DialogReactSelectProps extends DialogFieldComponentProps {
    isMulti?: boolean;
}

const DialogReactSelectComponent = ({
    field, //
    refValues,
    disabled,
    isMulti,
}: DialogReactSelectProps) => {
    const baseOptions = (field?.options || []) as OptionLabel[];
    const defaultValues = Array.isArray(field?.defaultValue)
        ? (field.defaultValue as string[]).map((value) => `${value}`)
        : [];
    const options =
        field.preserveUnknownOptions && defaultValues.length ? [...baseOptions] : baseOptions;
    const fixedOptions = options.filter((option) => !!option.isFixed);
    const getInitValueArr = () => {
        if (!field?.defaultValue || !Array.isArray(field?.defaultValue)) {
            return [];
        }
        const defaultValue = (field?.defaultValue as string[]) || [];
        let defaultValueArr =
            defaultValue?.reduce((acc, selectedValue) => {
                const option = options?.find((opt) => {
                    return `${opt.value}` === `${selectedValue}`;
                });
                if (!option) return acc;
                acc.push(option);
                return acc;
            }, [] as OptionLabel[]) || [];
        defaultValueArr = getOrderedValue(
            defaultValueArr, //
            options
        );
        return defaultValueArr;
    };

    const getInitValue = () => {
        if (!field?.defaultValue || !!Array.isArray(field?.defaultValue)) {
            return undefined;
        }
        const defaultValue = field.defaultValue as string;
        const defaultValueStr = !!defaultValue
            ? ({
                  label:
                      options?.find((opt) => {
                          return opt?.value === defaultValue;
                      })?.label || "",
                  value: defaultValue || "",
              } as OptionLabel)
            : undefined;
        return defaultValueStr;
    };

    // Hooks
    const [value, setValue] = React.useState<SingleValue<OptionLabel> | undefined>(getInitValue());
    const [valueArr, setValueArr] = React.useState<MultiValue<OptionLabel>>(getInitValueArr());

    const isComponentDisabled = !!disabled || !!field.disabled;

    const handleChangeSelect = (
        newValue: MultiValue<OptionLabel> | SingleValue<OptionLabel>,
        _actionMeta: ActionMeta<OptionLabel>
    ) => {
        const nextValue = { ...newValue } as SingleValue<OptionLabel>;
        setValue(nextValue);
        const fieldValue = `${nextValue?.value}` || "";
        if (!!field.handleChange) field.handleChange(fieldValue);
        refValues.current[field.id] = fieldValue;
        if (!!field?.updateHiddenStates) field.updateHiddenStates();
    };

    const handleChangeSelectMulti = (
        newValue: MultiValue<OptionLabel> | SingleValue<OptionLabel>,
        _actionMeta: ActionMeta<OptionLabel>
    ) => {
        const requestedValue = [...(newValue as MultiValue<OptionLabel>)];
        if (
            _actionMeta.action === "remove-value" &&
            (_actionMeta.removedValue as OptionLabel | undefined)?.isFixed
        ) {
            return;
        }
        const selectedValueSet = new Set(requestedValue.map((option) => `${option.value}`));
        const restoredFixedOptions = fixedOptions.filter(
            (option) => !selectedValueSet.has(`${option.value}`)
        );
        const nextValue = getOrderedValue(
            [...restoredFixedOptions, ...requestedValue],
            options
        ) as MultiValue<OptionLabel>;
        setValueArr(nextValue);

        const fieldValue = nextValue.map((opt) => `${opt.value}`) || [];
        if (!!field.handleChange) field.handleChange(fieldValue);
        refValues.current[field.id] = fieldValue;
        if (!!field?.updateHiddenStates) field.updateHiddenStates();
    };

    React.useEffect(() => {
        if (!field?.required) return;
        refValues.current[field.id] = field?.defaultValue ?? (!!isMulti ? [] : "");
        if (!!field?.updateHiddenStates) field.updateHiddenStates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <DialogFieldLabelWrapper field={field}>
            <ReactSelect
                value={!!isMulti ? valueArr : (value ?? null)} //
                handleChange={!!isMulti ? handleChangeSelectMulti : handleChangeSelect} //
                options={options}
                placeholder={field?.label || ""}
                isDisabled={!!isComponentDisabled}
                menuPortalTarget={document.body}
                maxWidth="unset"
                size="small"
                closeMenuOnSelect={true}
                isMulti={!!isMulti}
            />
        </DialogFieldLabelWrapper>
    );
};

export default DialogReactSelectComponent;
