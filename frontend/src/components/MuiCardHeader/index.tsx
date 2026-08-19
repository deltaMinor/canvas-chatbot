import React from "react";

import { CardHeader, CardHeaderProps, Typography, TypographyVariant } from "@mui/material";

import { colors } from "#root/theme/PureLightTheme";

interface MuiCardHeaderProps extends CardHeaderProps {
    title: string;
    align?: "right" | "left" | "center" | "inherit" | "justify";
    color?: string;
    variant?: TypographyVariant;
    style?: React.CSSProperties;
}

const MuiCardHeaderComponent = ({
    title,
    align,
    color,
    variant,
    style: props_style = {},
    className: props__className = "",
    ...props
}: MuiCardHeaderProps) => {
    return (
        <CardHeader
            title={
                <Typography
                    {...(variant && { variant })}
                    {...(align && { align })}
                    style={{ color: color || "white" }}
                >
                    {title}
                </Typography>
            }
            style={{
                backgroundColor: colors.primary.main, //
                ...props_style,
            }}
            className={`ps-2 py-1${props__className}`}
            {...props}
        />
    );
};

export default React.memo(MuiCardHeaderComponent);
