import React from "react";

import { Box, BoxProps, SxProps, Theme } from "@mui/material";

import { colors } from "#root/theme/PureLightTheme";

interface FieldWrapperProps extends BoxProps {
    id?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    sx?: SxProps<Theme>;
    variant?: "filled" | "outlined";
}

const BoxWrapperComponent = ({
    id = "BoxWrapper",
    children,
    style: props__style = {},
    sx,
    variant = "filled",
    className: props__className = "",
    ...props
}: FieldWrapperProps) => {
    if (variant === "outlined") {
        return (
            <Box
                id={id}
                className={`relative h-full w-full rounded border-1 border-solid p-1 ${props__className}`} //
                style={{
                    borderColor: colors.alpha.black[20],
                    ...props__style,
                }}
                {...(sx && { sx })}
                {...props}
            >
                {children}
            </Box>
        );
    }

    return (
        <Box
            id={id}
            className={`relative h-full w-full p-1 ${props__className}`} //
            style={{
                backgroundColor: colors.alpha.black[5],
                ...props__style,
            }}
            {...(sx && { sx })}
            {...props}
        >
            {children}
        </Box>
    );
};

export default React.memo(BoxWrapperComponent);
