import React from "react";

import { Avatar, AvatarProps, Stack } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";

import { DEFAULT_LABEL, DEFAULT_STYLE, DisplayTableCellAvatarVariant } from "./constants";
import { getAvatarStyle } from "./helper";

interface DisplayAvatarProps {
    value: string[];
    labelMapping?: { [key: string]: string };
    colorMapping?: { [key: string]: string };
    abbrMapping?: { [key: string]: string };
    avatarProps?: AvatarProps;
    variant?: "default" | "outlined";
}

const DisplayAvatarComponent = ({
    value, //
    labelMapping = {},
    colorMapping = {},
    abbrMapping = {},
    avatarProps = {},
    variant = DisplayTableCellAvatarVariant.default,
}: DisplayAvatarProps) => {
    const { style, ..._avatarProps } = avatarProps;
    return (
        <Stack
            id="DisplayAvatarComponent" //
            direction="row"
            className="h-full"
            sx={{
                justifyContent: "center",
                alignItems: "center",
                width: "fit-content",
            }}
            spacing={0.5}
        >
            {value?.map((key: string) => {
                const label = labelMapping?.[key as keyof typeof labelMapping] || DEFAULT_LABEL; //
                const avatarStyle = getAvatarStyle(
                    key, //
                    variant,
                    colorMapping
                );
                return (
                    <MuiTooltip
                        title={label}
                        key={key}
                    >
                        <Avatar
                            variant="rounded"
                            style={{
                                ...DEFAULT_STYLE,
                                ...avatarStyle,
                                ...style,
                            }}
                            {..._avatarProps}
                        >
                            {abbrMapping?.[key as keyof typeof abbrMapping] || //
                                label?.slice(0, 2)?.toUpperCase()}
                        </Avatar>
                    </MuiTooltip>
                );
            })}
        </Stack>
    );
};

export default React.memo(DisplayAvatarComponent);
