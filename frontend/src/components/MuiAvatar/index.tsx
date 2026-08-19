import React from "react";

import { Avatar, AvatarProps, TooltipProps } from "@mui/material";
import { grey } from "@mui/material/colors";

import MuiTooltip from "#root/components/MuiTooltip";

const defaultAvatarSx = {
    "&.MuiAvatar-square": {
        borderRadius: "4.5px",
    },
};
const defaultAvatarStyle = {
    // fontSize: "20px",
    fontWeight: 500,
    backgroundColor: grey[400],
    color: "#fff",
};

export interface MuiAvatarProps extends AvatarProps {
    tooltipTitle?: React.ReactNode;
    tooltipProps?: Partial<TooltipProps>;
    children?: React.ReactNode;
}

const MuiAvatarComponent = ({
    tooltipTitle, //
    tooltipProps = {},
    children,
    ...avatarProps
}: MuiAvatarProps) => {
    const {
        sx: avatarSx, //
        style: avatarStyle,
        ..._avatarProps
    } = avatarProps || {};

    const style = {
        ...defaultAvatarStyle,
        ...avatarStyle, //
    };
    const sx = {
        ...defaultAvatarSx,
        ...avatarSx,
    };
    return (
        <Avatar
            variant="circular" //
            sx={sx}
            style={style}
            {..._avatarProps}
        >
            <MuiTooltip
                title={tooltipTitle} //
                arrow
                noMaxWidth
                {...tooltipProps}
            >
                <div>{children}</div>
            </MuiTooltip>
        </Avatar>
    );
};

export default React.memo(MuiAvatarComponent);
