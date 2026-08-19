import React from "react";

import { Stack, Typography } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";

interface MuiDataGridToolbarTextProps {
    title: string;
}

const MuiDataGridToolbarTextComponent = ({ title }: MuiDataGridToolbarTextProps) => {
    return (
        <Stack //
            direction="row"
            sx={{
                justifyContent: "flex-start",
                alignItems: "center",
            }}
            className="ml-1 px-2 py-1"
        >
            <MuiTooltip title={title}>
                <Typography
                    color="textSecondary" //
                    fontStyle="italic"
                    className="overflow-hidden text-ellipsis whitespace-nowrap"
                >
                    {title}
                </Typography>
            </MuiTooltip>
        </Stack>
    );
};

export default React.memo(MuiDataGridToolbarTextComponent);
