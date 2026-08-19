import React from "react";
import { useFormContext } from "react-hook-form";
import { ActionMeta, MultiValue } from "react-select";

import ReactSelect from "#root/components/ReactSelect";
import { OptionLabel } from "#root/interfaces";
import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

interface DrawerFieldReactSelectMultiProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    attribute: BaseFieldAttribute;
    fieldName: string;
    value: string[];
    disabled?: boolean;
}

const DrawerFieldReactSelectMultiComponent = ({
    attribute,
    fieldName,
    value: props__value = [],
    disabled,
}: DrawerFieldReactSelectMultiProps) => {
    const { register, setValue, watch } = useFormContext<Record<string, unknown>>();
    const isDisabled = !!attribute?.disabled || !!disabled;
    const formValue = watch(fieldName, props__value);
    const selectedValues = Array.isArray(formValue) ? formValue.map((v) => `${v}`) : [];
    const options: OptionLabel[] = (attribute.options || []).map((opt) => {
        const option: OptionLabel = {
            label: String(opt.label),
            value: opt.value,
        };
        if (opt.domains) {
            option.domains = opt.domains;
        }
        if (opt.disabled !== undefined) {
            option.isDisabled = opt.disabled;
        }
        return option;
    });
    const selectionOptions = options.filter((opt) => {
        return selectedValues.includes(String(opt.value));
    });

    React.useEffect(() => {
        register(fieldName);
    }, [fieldName, register]);

    const handleChange = (
        _selectionOptions: MultiValue<OptionLabel>,
        _actionMeta: ActionMeta<OptionLabel>
    ) => {
        const _value = _selectionOptions.map((v) => `${v.value}`);
        setValue(fieldName, _value, {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    return (
        <ReactSelect<OptionLabel, true>
            closeMenuOnSelect={false}
            controlled
            handleChange={handleChange} //
            isDisabled={!!isDisabled}
            isMulti
            menuPortalTarget={document.body}
            options={options}
            placeholder={attribute.label}
            size="small"
            value={selectionOptions}
        />
    );
};

export default React.memo(DrawerFieldReactSelectMultiComponent);
