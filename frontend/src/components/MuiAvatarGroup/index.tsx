import React from "react";

import { AvatarGroup, AvatarGroupProps, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";

import MuiTooltip from "#root/components/MuiTooltip";

const defaultAvatarGroupSx = {};
const defaultAvatarGroupStyle = {};
const defaultMuiAvatarGroupSlotPropsSurplus = {
    style: {
        backgroundColor: grey[400], //
        // fontSize: "14px",
        fontWeight: 400,
    },
};
const DEFAULT_GROUP_MAX = 3;

export interface MuiAvatarGroupProps extends AvatarGroupProps {
    value?: string[];
    children?: React.ReactNode[];
}
const MuiAvatarGroupComponent: React.FC<MuiAvatarGroupProps> = ({
    children, //
    value = [],
    ...muiAvatarProps
}) => {
    const {
        sx: muiAvatarGroupSx, //
        style: muiAvatarGroupStyle,
        slotProps: muiAvatarGroupSlotProps,
        ..._muiAvatarProps
    } = muiAvatarProps;

    const sx = {
        ...defaultAvatarGroupSx,
        ...muiAvatarGroupSx, //
    };
    const style = {
        ...defaultAvatarGroupStyle,
        ...muiAvatarGroupStyle, //
    };
    const {
        surplus: muiAvatarGroupSlotPropsSurplus, //
        ..._muiAvatarGroupSlotProps
    } = muiAvatarGroupSlotProps || {};
    const slotProps = {
        surplus: {
            ...defaultMuiAvatarGroupSlotPropsSurplus,
            ...muiAvatarGroupSlotPropsSurplus, //
        },
        ..._muiAvatarGroupSlotProps, //
    };

    const renderSurplus = (surplus: number) => {
        const surplusValue = value.slice(value.length - surplus);
        return (
            <MuiTooltip
                title={surplusValue.join(", ")} //
                arrow
                noMaxWidth
            >
                <Typography
                    style={{
                        // fontSize: "16px", //
                        fontWeight: 400,
                        color: "#fff",
                    }}
                >{`+${surplus}`}</Typography>
            </MuiTooltip>
            // <MuiAvatar
            //     style={{
            //         backgroundColor: "#00000020", //
            //         fontSize: "16px",
            //         fontWeight: 400,
            //     }} //
            //     tooltipTitle={surplusValue.join(", ")}
            // >{`+${surplus}`}</MuiAvatar>
        );
    };
    return (
        <AvatarGroup
            max={DEFAULT_GROUP_MAX}
            spacing="medium"
            sx={sx}
            style={style}
            slotProps={slotProps}
            renderSurplus={renderSurplus}
            {..._muiAvatarProps} //
        >
            {children}
        </AvatarGroup>
    );
};

export default React.memo(MuiAvatarGroupComponent);
