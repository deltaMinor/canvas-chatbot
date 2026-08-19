import React from "react";
import { useFormContext } from "react-hook-form";
import { ActionMeta, SingleValue } from "react-select";

import ReactSelect from "#root/components/ReactSelect";
import { OptionLabel } from "#root/interfaces";
import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

interface DrawerFieldReactSelectProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    attribute: BaseFieldAttribute;
    fieldName: string;
    value: string;
    disabled?: boolean;
}

const DrawerFieldReactSelectComponent = ({
    attribute,
    fieldName,
    value: props__value = "",
    disabled,
}: DrawerFieldReactSelectProps) => {
    const { register, setValue, watch } = useFormContext<Record<string, unknown>>();
    const isDisabled = !!attribute?.disabled || !!disabled;
    const formValue = `${watch(fieldName, props__value) ?? ""}`;
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
    const selectionOption =
        options.find((opt) => {
            return formValue === String(opt.value);
        }) ?? null;

    React.useEffect(() => {
        register(fieldName);
    }, [fieldName, register]);

    const handleChange = (
        _selectionOption: SingleValue<OptionLabel>,
        _actionMeta: ActionMeta<OptionLabel>
    ) => {
        setValue(fieldName, _selectionOption?.value || "", {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    return (
        <ReactSelect<OptionLabel, false>
            closeMenuOnSelect={false}
            controlled
            handleChange={handleChange} //
            isDisabled={!!isDisabled}
            menuPortalTarget={document.body}
            options={options}
            placeholder={attribute.label}
            size="small"
            value={selectionOption}
        />
    );
};

export default React.memo(DrawerFieldReactSelectComponent);
