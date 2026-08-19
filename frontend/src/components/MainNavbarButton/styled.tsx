import React from "react";
import { LinkProps } from "react-router-dom";

import { Button, ButtonProps, darken, styled } from "@mui/material";

import { colors } from "#root/theme/PureLightTheme";

type StyledButtonProps = ButtonProps & {
    isActive: boolean;
    to?: LinkProps["to"];
    component?: React.ElementType;
};

export const StyledButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== "isActive",
})<StyledButtonProps>(({ isActive }) => ({
    backgroundColor: !!isActive ? colors.primary.dark : "unset",
    color: "#fff",
    height: "100%",
    fontWeight: 400,
    borderRadius: 0,
    verticalAlign: "center",
    "&:hover": {
        backgroundColor: darken(colors.primary.main, 0.1),
    },
}));
