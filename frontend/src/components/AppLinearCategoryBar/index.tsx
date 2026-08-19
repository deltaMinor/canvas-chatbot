import React from "react";

import { Grid, Stack, Typography } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";

export interface AppLinearCategoryMapping {
    [key: string]: {
        count: number;
        label: string;
        color?: string;
    };
}

const DEFAULT_COLOR = "#00000010";

interface AppLinearCategoryBarProps {
    stateMapping: AppLinearCategoryMapping;
    maxCount: number;
}

const AppLinearCategoryBarComponent = ({
    stateMapping, //
    maxCount,
}: AppLinearCategoryBarProps) => {
    const totalCount = Object.values(stateMapping)?.reduce(
        (acc, val) => acc + val.count, //
        0
    );
    return (
        <Stack
            direction="column"
            sx={{
                justifyContent: "center",
                alignItems: "center",
            }}
            className="h-full w-full"
        >
            <Grid
                container
                style={{ height: "auto" }} //
                className="w-full"
            >
                {Object.entries(stateMapping)?.map(([_key, val]) => {
                    return (
                        <Grid
                            size={(val.count / maxCount) * 12}
                            key={_key}
                        >
                            <MuiTooltip
                                title={val.label}
                                arrow
                            >
                                <div
                                    style={{
                                        backgroundColor: val?.color || DEFAULT_COLOR, //
                                    }}
                                >
                                    <Typography
                                        align="center" //
                                    >
                                        {val.count || ""}
                                    </Typography>
                                </div>
                            </MuiTooltip>
                        </Grid>
                    );
                })}
                <Grid size={((maxCount - totalCount) / maxCount) * 12}>
                    <MuiTooltip title="Unassigned">
                        <div style={{ backgroundColor: DEFAULT_COLOR }}>
                            <Typography
                                align="center" //
                            >
                                {maxCount - totalCount || ""}
                            </Typography>
                        </div>
                    </MuiTooltip>
                </Grid>
            </Grid>
        </Stack>
    );
};

export default React.memo(AppLinearCategoryBarComponent);
