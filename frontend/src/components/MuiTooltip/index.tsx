import React from "react";

import { Typography } from "@mui/material";
import Fade from "@mui/material/Fade";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";

import { NoMaxWidthTooltip } from "./styled";

interface MuiTooltipProps extends TooltipProps {
    children: React.ReactElement;
    noMaxWidth?: boolean;
}

const MuiTooltipComponent = ({
    children, //
    noMaxWidth,
    title,
    slotProps,
    slots,
    ...props
}: MuiTooltipProps) => {
    if (!!noMaxWidth) {
        return (
            <NoMaxWidthTooltip
                title={!!title && <Typography>{title}</Typography>} //
                placement="top"
                slots={{ transition: Fade, ...slots }}
                slotProps={{
                    ...slotProps,
                }}
                {...props}
            >
                {children}
            </NoMaxWidthTooltip>
        );
    }
    return (
        <Tooltip
            title={!!title && <Typography>{title}</Typography>} //
            placement="top"
            slots={{ transition: Fade, ...slots }}
            slotProps={{
                ...slotProps,
            }}
            {...props}
        >
            {children}
        </Tooltip>
    );
};

export default React.memo(MuiTooltipComponent);
