import React from "react";
import { useFormContext } from "react-hook-form";

import { Checkbox, FormControlLabel } from "@mui/material";

import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

interface DrawerFieldCheckboxProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    attribute: BaseFieldAttribute;
    fieldName: string;
    value: boolean;
    disabled?: boolean;
}

const DrawerFieldCheckboxComponent = ({
    attribute,
    fieldName,
    value: propsValue,
    disabled,
}: DrawerFieldCheckboxProps) => {
    const { register, setValue, watch } = useFormContext<Record<string, unknown>>();
    const isDisabled = !!attribute?.disabled || !!disabled;
    const value = Boolean(watch(fieldName, propsValue));

    React.useEffect(() => {
        register(fieldName);
    }, [fieldName, register]);

    return (
        <FormControlLabel
            control={
                <Checkbox
                    size="small"
                    id={attribute?.key}
                    checked={value}
                    onChange={(_event, checked) =>
                        setValue(fieldName, checked, {
                            shouldDirty: true,
                            shouldTouch: true,
                        })
                    }
                    disabled={!!isDisabled}
                />
            }
            label={attribute?.label}
        />
    );
};

export default React.memo(DrawerFieldCheckboxComponent);
