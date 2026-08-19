import React from "react";
import { useFormContext } from "react-hook-form";

import { Grid, Icon, Stack } from "@mui/material";

import NodeIcon from "#root/components/NodeIcon";
import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

import DrawerFieldReactSelect from "./DrawerFieldReactSelect";

interface DrawerFieldSelectIconProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    attribute: BaseFieldAttribute;
    fieldName: string;
    value: string;
    disabled?: boolean;
}

const DrawerFieldSelectIconComponent = ({
    sectionRef,
    refKey,
    attribute,
    fieldName,
    value,
    disabled,
}: DrawerFieldSelectIconProps) => {
    const { watch } = useFormContext<Record<string, unknown>>();
    const iconName = `${watch(fieldName, value) ?? ""}`;

    return (
        <Grid
            container
            spacing={1}
        >
            <Grid size="grow">
                <DrawerFieldReactSelect
                    sectionRef={sectionRef}
                    refKey={refKey}
                    attribute={attribute}
                    fieldName={fieldName}
                    value={`${value}`}
                    disabled={!!disabled}
                />
            </Grid>
            <Grid size="auto">
                <Stack>
                    <Icon className="diagram-attribute-form__select-icon-preview">
                        <NodeIcon
                            alt="N/A" //
                            name={iconName}
                        />
                    </Icon>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default React.memo(DrawerFieldSelectIconComponent);
