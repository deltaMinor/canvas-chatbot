import React from "react";
import { useFormContext } from "react-hook-form";
import { ActionMeta, GroupBase, MultiValue } from "react-select";

import ReactSelectCreatable from "#root/components/ReactSelectCreatable";
import { OptionLabel } from "#root/interfaces";
import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

interface DrawerFieldReactSelectCreatableProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    attribute: BaseFieldAttribute;
    fieldName: string;
    value: string[];
    disabled?: boolean;
}

const mapOptions = (options: BaseFieldAttribute["options"]): OptionLabel[] => {
    return (options || []).map((opt) => {
        const option: OptionLabel = {
            label: String(opt.label),
            value: opt.value,
        };
        if (opt.domains) option.domains = opt.domains;
        if (opt.disabled !== undefined) option.isDisabled = opt.disabled;
        return option;
    });
};

const DrawerFieldReactSelectCreatableComponent = ({
    attribute,
    fieldName,
    value: props__value = [],
    disabled,
}: DrawerFieldReactSelectCreatableProps) => {
    const { register, setValue: setValueForm, watch } = useFormContext<Record<string, unknown>>();
    const isDisabled = !!attribute?.disabled || !!disabled;
    const formValue = watch(fieldName, props__value);
    const selectedValues = React.useMemo(
        () => (Array.isArray(formValue) ? formValue.map((v) => `${v}`) : []),
        [formValue]
    );

    const [options, setOptions] = React.useState<OptionLabel[]>(() =>
        mapOptions(attribute.options)
    );

    React.useEffect(() => {
        register(fieldName);
    }, [fieldName, register]);

    // Ensure options always include currently selected values
    React.useEffect(() => {
        setOptions((prev) => {
            const existingValues = new Set(prev.map((o) => String(o.value)));
            const missing = selectedValues
                .filter((v) => !existingValues.has(String(v)))
                .map((v) => ({ label: String(v), value: String(v) }));
            if (missing.length === 0) return prev;
            return [...prev, ...missing];
        });
    }, [selectedValues]);

    const selectionOptions = React.useMemo(() => {
        const valueSet = new Set(selectedValues.map((v) => String(v)));
        return options.filter((opt) => valueSet.has(String(opt.value)));
    }, [options, selectedValues]);

    const setFieldValue = (newValues: string[]) => {
        setValueForm(fieldName, newValues, {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    const handleChange = (
        _selectionOptions: MultiValue<OptionLabel>,
        _actionMeta?: ActionMeta<OptionLabel>
    ) => {
        const nextValues = _selectionOptions.map((v) => String(v.value));
        setFieldValue(nextValues);
    };

    const handleCreate = (newValue: string) => {
        const trimmed = newValue.trim();
        if (!trimmed) return;
        const newOption: OptionLabel = { label: trimmed, value: trimmed };
        setOptions((prev) => [...prev, newOption]);
        const nextValues = [...selectedValues, trimmed];
        setFieldValue(nextValues);
    };

    return (
        <ReactSelectCreatable<OptionLabel, true, GroupBase<OptionLabel>>
            isMulti
            handleChange={handleChange}
            handleCreate={handleCreate}
            isDisabled={!!isDisabled}
            menuPortalTarget={document.body}
            options={options}
            placeholder={attribute.label}
            size="small"
            value={selectionOptions}
        />
    );
};

export default React.memo(DrawerFieldReactSelectCreatableComponent);
