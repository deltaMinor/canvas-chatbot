import React from "react";

import { Grid, useTheme } from "@mui/material";

import ColouredBar from "#root/components/ColouredBar";
import MuiTooltip from "#root/components/MuiTooltip";

interface ColouredBarProps {
    score: number;
}

const ColouredBarsComponent = ({
    score, //
}: ColouredBarProps) => {
    const theme = useTheme();
    const neutralColor = "#cfd8dc";
    return (
        <MuiTooltip title="Password Strength">
            <Grid
                container
                direction="row"
                justifyContent="space-around"
                alignItems="center"
                style={{ marginTop: theme.spacing(0.5) }}
                className="w-full"
            >
                <Grid size={3}>
                    <ColouredBar backgroundColor={score > 0 ? "#ff1744" : neutralColor} />
                </Grid>
                <Grid size={3}>
                    <ColouredBar backgroundColor={score > 1 ? "#ff9100" : neutralColor} />
                </Grid>
                <Grid size={3}>
                    <ColouredBar backgroundColor={score > 2 ? "#ffea00" : neutralColor} />
                </Grid>
                <Grid size={3}>
                    <ColouredBar backgroundColor={score > 3 ? "#00e676" : neutralColor} />
                </Grid>
            </Grid>
        </MuiTooltip>
    );
};

export default React.memo(ColouredBarsComponent);
