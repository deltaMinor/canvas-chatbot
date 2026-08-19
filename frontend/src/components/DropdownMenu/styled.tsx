import React, { type ComponentProps } from "react";

import { Button } from "@mui/material";
import Menu, { MenuProps } from "@mui/material/Menu";
import { alpha, styled } from "@mui/material/styles";
import { clsx } from "clsx";

type StyledButtonProps = ComponentProps<typeof Button>;

export const StyledButton = ({ className, ...props }: StyledButtonProps) => (
    <Button
        className={clsx("components-menu-dropdown-menu__styled-button", className)}
        {...props}
    />
);

export const StyledMenu = React.memo(
    styled((props: MenuProps) => (
        <Menu
            elevation={0}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
            {...props}
        />
    ))(({ theme }) => ({
        "& .MuiPaper-root": {
            borderRadius: 6,
            marginTop: "9px",
            minWidth: 180,
            color: theme.palette.mode === "light" ? "rgb(55, 65, 81)" : theme.palette.grey[300],
            boxShadow:
                "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
            "& .MuiMenu-list": {
                padding: "4px 0",
            },
            "& .MuiMenuItem-root": {
                "& .MuiSvgIcon-root": {
                    fontSize: 18,
                    color: theme.palette.text.secondary,
                    marginRight: theme.spacing(1.5),
                },
                "&:active": {
                    backgroundColor: alpha(
                        theme.palette.primary.main,
                        theme.palette.action.selectedOpacity
                    ),
                },
            },
        },
    }))
);
