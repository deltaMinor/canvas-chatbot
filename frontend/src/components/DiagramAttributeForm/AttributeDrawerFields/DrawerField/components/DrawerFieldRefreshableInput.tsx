import React from "react";
import { useFormContext } from "react-hook-form";

import SyncIcon from "@mui/icons-material/Sync";
import { Grid, IconButton } from "@mui/material";

import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

import DrawerFieldDefaultInput from "./DrawerFieldDefaultInput";

interface DrawerFieldRefreshableInputProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    attribute: BaseFieldAttribute;
    fieldName: string;
    value: string;
    disabled?: boolean;
}

const DrawerFieldRefreshableInputComponent = ({
    sectionRef,
    refKey,
    attribute,
    fieldName,
    disabled,
    value,
}: DrawerFieldRefreshableInputProps) => {
    const { watch } = useFormContext<Record<string, unknown>>();
    const [isLoading, setIsLoading] = React.useState(false);
    const fieldValue = `${watch(fieldName, value) ?? ""}`;

    const handleClickRefresh = React.useCallback(async () => {
        const {
            drawerFieldsContext, //
        } = sectionRef.current;
        const {
            property,
            handleRenewAttribute, //
        } = drawerFieldsContext?.[refKey] || {};

        if (property && handleRenewAttribute) {
            setIsLoading(true);

            try {
                await handleRenewAttribute(property, attribute?.key);
            } finally {
                setIsLoading(false);
            }
        }
    }, [attribute?.key, refKey, sectionRef]);

    return (
        <Grid
            container
            columnSpacing={0.5}
        >
            <Grid size="grow">
                <DrawerFieldDefaultInput
                    sectionRef={sectionRef}
                    refKey={refKey}
                    attribute={attribute}
                    fieldName={fieldName}
                    value={fieldValue}
                    disabled={!!disabled}
                />
            </Grid>
            <Grid size="auto">
                <IconButton
                    disabled={isLoading || !!disabled}
                    onClick={handleClickRefresh}
                >
                    <SyncIcon
                        sx={{
                            animation: isLoading ? "spin 1s linear infinite" : "none",
                            "@keyframes spin": {
                                "0%": {
                                    transform: "rotate(0deg)",
                                },
                                "100%": {
                                    transform: "rotate(360deg)",
                                },
                            },
                        }}
                    />
                </IconButton>
            </Grid>
        </Grid>
    );
};

export default React.memo(DrawerFieldRefreshableInputComponent);
