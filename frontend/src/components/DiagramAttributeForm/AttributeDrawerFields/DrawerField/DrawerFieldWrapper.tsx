import React from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import { Grid, IconButton, Stack, Typography } from "@mui/material";

import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

interface DrawerFieldWrapperProps {
    children: React.ReactNode;
    attribute: BaseFieldAttribute;
    removeAttribute: (key: string) => void;
    disabled?: boolean;
    hideTitle?: boolean;
    title?: string;
}

const DrawerFieldWrapperComponent = ({
    children, //
    attribute,
    disabled,
    hideTitle,
    removeAttribute,
}: DrawerFieldWrapperProps) => {
    return (
        <Grid
            container //
            alignItems="flex-start"
            className="diagram-attribute-form__fill-width"
            columnSpacing={0.5}
        >
            {!hideTitle && (
                <Grid size={12}>
                    <Typography
                        variant="subtitle2" //
                    >
                        {attribute.label}
                    </Typography>
                </Grid>
            )}
            <Grid //
                size="grow"
            >
                <Stack className="diagram-attribute-form__fill-width">{children}</Stack>
            </Grid>
            {attribute?.deletable && (
                <Grid size="auto">
                    <IconButton
                        onClick={() => {
                            return removeAttribute(attribute?.key);
                        }}
                        disabled={!!disabled}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Grid>
            )}
        </Grid>
    );
};

export default React.memo(DrawerFieldWrapperComponent);
