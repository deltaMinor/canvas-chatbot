import React from "react";
import { useFormContext } from "react-hook-form";

import { colord } from "colord";

import BoxWrapper from "#root/components/BoxWrapper";
import RgbaColorPicker from "#root/components/RgbaColorPicker";
import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

interface DrawerFieldColorPickerProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    attribute: BaseFieldAttribute;
    fieldName: string;
    value: string;
    disabled?: boolean;
}

const DrawerFieldColorPickerComponent = ({
    attribute,
    fieldName,
    value: propsValue,
    disabled,
}: DrawerFieldColorPickerProps) => {
    const { register, setValue, watch } = useFormContext<Record<string, unknown>>();
    const isDisabled = !!attribute?.disabled || !!disabled;
    const value = `${watch(fieldName, propsValue) ?? ""}`;

    React.useEffect(() => {
        register(fieldName);
    }, [fieldName, register]);

    const updateColorField = React.useCallback(
        (newColor: string) => {
            const nextColor = colord(newColor).toHex();
            setValue(fieldName, nextColor, {
                shouldDirty: true,
                shouldTouch: true,
            });
        },
        [fieldName, setValue]
    );
    return (
        <BoxWrapper variant="outlined">
            <RgbaColorPicker
                color={value}
                setColor={updateColorField}
                attribute_key={attribute?.key}
                disabled={!!isDisabled}
            />
        </BoxWrapper>
    );
};

export default React.memo(DrawerFieldColorPickerComponent);
