import React from "react";
import { useFormContext } from "react-hook-form";

import MuiTextField from "#root/components/MuiTextField";
import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";
import { getDefaultAttributeValue } from "#root/utils/diagram/diagramAttributeUtil";

interface DrawerFieldDefaultInputProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    attribute: BaseFieldAttribute;
    fieldName: string;
    value: string | number;
    overrideUpdateField?: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        key: string,
        type: string
    ) => void;

    disabled?: boolean;
}

const DrawerFieldDefaultInputComponent = ({
    attribute,
    fieldName,
    disabled,
    value,
    overrideUpdateField: props__updateField,
}: DrawerFieldDefaultInputProps) => {
    const { register, setValue, watch } = useFormContext<Record<string, unknown>>();
    const isDisabled = !!disabled || !!attribute?.disabled;
    const fieldValue = watch(fieldName, value);

    React.useEffect(() => {
        register(fieldName);
    }, [fieldName, register]);

    const handleUpdateField = React.useCallback(
        async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type: string) => {
            const nextValue =
                type === "number" ? Number(event.target.value) : `${event.target.value}`;

            setValue(fieldName, nextValue, {
                shouldDirty: true,
                shouldTouch: true,
            });

            if (!!props__updateField) {
                props__updateField(event, attribute?.key, type);
            }
        },
        [attribute?.key, fieldName, props__updateField, setValue]
    );

    return (
        <MuiTextField
            id={attribute?.key}
            disabled={!!isDisabled}
            fullWidth
            maxRows={3}
            minRows={1}
            size="small"
            type={attribute?.type}
            value={fieldValue ?? getDefaultAttributeValue(attribute?.type)}
            handleChange={(evt) => handleUpdateField(evt, attribute?.type)}
            error={
                !attribute?.disabled && !!attribute?.validation
                    ? !attribute?.validation(fieldValue)
                    : false
            }
            helperText={
                !attribute?.disabled &&
                !!attribute?.validation &&
                !attribute?.validation(fieldValue)
                    ? `Invalid ${typeof fieldValue}`
                    : ""
            }
        />
    );
};

export default React.memo(DrawerFieldDefaultInputComponent);
