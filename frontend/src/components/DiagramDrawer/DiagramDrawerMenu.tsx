import React from "react";

import { MoreVert } from "@mui/icons-material";
import { IconButton, MenuItem } from "@mui/material";

import MuiMenu from "#root/components/MuiMenu";
import MuiTooltip from "#root/components/MuiTooltip";

import { DiagramDrawerMenuOption } from "./types";

export interface DiagramDrawerMenuProps {
    menuOptions: DiagramDrawerMenuOption[];
}

const DiagramDrawerMenuComponent: React.FC<DiagramDrawerMenuProps> = ({ menuOptions }) => {
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleMenuItemClick = async (option: DiagramDrawerMenuOption) => {
        handleMenuClose();
        await option.onClick();
    };

    if (!menuOptions || menuOptions.length === 0) {
        return null;
    }

    return (
        <>
            <MuiTooltip title="More options">
                <IconButton
                    onClick={handleMenuClick}
                    size="small"
                    sx={{
                        color: "text.secondary",
                        "&:hover": {
                            backgroundColor: "action.hover",
                            color: "text.primary",
                        },
                    }}
                >
                    <MoreVert fontSize="small" />
                </IconButton>
            </MuiTooltip>
            <MuiMenu
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                {menuOptions.map((option, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => handleMenuItemClick(option)}
                        {...(option.disabled !== undefined && {
                            disabled: option.disabled,
                        })}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </MuiMenu>
        </>
    );
};

export const DiagramDrawerMenu = React.memo(DiagramDrawerMenuComponent);
