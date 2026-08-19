import React from "react";

import InfoIcon from "@mui/icons-material/Info";
import { Stack, Typography } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";
import { DialogFieldPropFields } from "#root/interfaces/dialogField";

interface DialogFieldLabelWrapperProps {
    field: DialogFieldPropFields;
    children?: React.ReactNode;
    inline?: boolean;
}

const DialogFieldLabelWrapperComponent = ({
    field,
    children,
    inline = false,
}: DialogFieldLabelWrapperProps) => {
    const labelBlock = (
        <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
        >
            {!!field?.label && <Typography variant="h6">{field?.label}</Typography>}
            {!!field?.tooltipText && (
                <MuiTooltip
                    title={field?.tooltipText}
                    arrow
                    noMaxWidth
                >
                    <InfoIcon
                        style={{ color: "#576aff" }}
                        fontSize="small"
                    />
                </MuiTooltip>
            )}
        </Stack>
    );

    if (inline) {
        return (
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <Stack spacing={0.3}>
                    {labelBlock}
                    {!!field?.helperText && (
                        <Typography
                            variant="subtitle1"
                            style={{ fontSize: "14px" }}
                        >
                            {field?.helperText}
                        </Typography>
                    )}
                </Stack>
                {children}
            </Stack>
        );
    }

    return (
        <Stack spacing={0.3}>
            {labelBlock}
            {!!field?.helperText && (
                <Typography
                    variant="subtitle1"
                    style={{ fontSize: "14px", marginBottom: "7px" }}
                >
                    {field?.helperText}
                </Typography>
            )}
            {children}
        </Stack>
    );
};

export default DialogFieldLabelWrapperComponent;
