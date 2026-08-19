import { LinearProgress } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";

interface LinearProgressProps {
    progress: number;
    title?: string;
}

const LinearProgressComponent = ({ progress, title = "" }: LinearProgressProps) => {
    return (
        <MuiTooltip
            title={title || "unknown"} //
            placement="top"
            arrow
            style={{ margin: "auto" }}
        >
            <LinearProgress
                variant="determinate"
                value={progress * 100}
                sx={{ width: "100px" }}
            />
        </MuiTooltip>
    );
};

export default LinearProgressComponent;
