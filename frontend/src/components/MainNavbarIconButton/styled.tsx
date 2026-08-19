import React from "react";
import { LinkProps } from "react-router-dom";

import { IconButton, IconButtonProps, darken, styled } from "@mui/material";

import { colors } from "#root/theme/PureLightTheme";

type StyledIconButtonProps = IconButtonProps & {
    isActive: boolean;
    to?: LinkProps["to"];
    component?: React.ElementType;
};

export const StyledIconButton = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== "isActive",
})<StyledIconButtonProps>(({ isActive }) => ({
    backgroundColor: !!isActive ? colors.primary.dark : "unset",
    color: "#fff",
    height: "100%",
    fontWeight: 400,
    borderRadius: 0,
    "&:hover": {
        backgroundColor: darken(colors.primary.main, 0.1),
    },
}));
