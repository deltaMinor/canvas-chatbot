import React from "react";
import { useFormContext } from "react-hook-form";

import { Grid, Stack, Typography } from "@mui/material";

import { getAttributeDrawerFieldName } from "#root/constants/attributeDrawerField";
import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

import DrawerFieldDefaultInput from "./DrawerFieldDefaultInput";

interface DrawerFieldMultiInputProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    attribute: BaseFieldAttribute;
    fieldName: string;
    value: Record<string, unknown>;
    disabled?: boolean;
}

const DrawerFieldMultiInputComponent = ({
    sectionRef,
    attribute,
    fieldName,
    value = {},
    disabled,
}: DrawerFieldMultiInputProps) => {
    const { watch } = useFormContext<Record<string, unknown>>();
    const isDisabled = !!disabled;
    const fieldValue = watch(fieldName, value);
    const fieldEntries =
        typeof fieldValue === "object" && !Array.isArray(fieldValue) && !!fieldValue
            ? Object.entries(fieldValue as Record<string, unknown>)
            : [];

    return (
        <Stack spacing={0.5}>
            {fieldEntries.map(([k, v]) => {
                const _attribute = {
                    ...attribute, //
                    label: k,
                };
                return (
                    <Grid
                        container
                        spacing={1}
                        key={k}
                    >
                        <Grid size="grow">
                            <DrawerFieldDefaultInput
                                sectionRef={sectionRef}
                                refKey={fieldName}
                                attribute={_attribute} //
                                fieldName={getAttributeDrawerFieldName(fieldName, k)}
                                value={v as string | number}
                                disabled={!!isDisabled}
                            />
                        </Grid>
                        <Grid alignContent="center">
                            <Typography variant="subtitle2">{k}</Typography>
                        </Grid>
                    </Grid>
                );
            })}
        </Stack>
    );
};

export default React.memo(DrawerFieldMultiInputComponent);
