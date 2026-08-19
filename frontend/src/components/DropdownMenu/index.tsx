import React, { memo } from "react";

import { Box, Button, Divider, Stack } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

import { MenuProps } from "#root/interfaces/sideMenu";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import { colors } from "#root/theme/PureLightTheme";

import { StyledMenu } from "./StyledMenu";

const DropdownMenuComponent = ({
    menuitemProps, //
    menuTitle,
    menuIcon,
    disabled,
    onMenuClose,
}: MenuProps) => {
    // Hooks
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    // Hooked variables
    const open = React.useMemo(() => Boolean(anchorEl), [anchorEl]);

    const handleClickMenuButton = React.useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            if (!menuitemProps?.length) return;
            setAnchorEl(event.currentTarget);
        },
        [menuitemProps?.length]
    );

    const handleClose = React.useCallback(() => {
        setAnchorEl(null);
        if (!!onMenuClose) onMenuClose();
    }, [onMenuClose]);

    const handleClickMenuItem = React.useCallback(
        async (
            handleClick: () => Promise<void>, //
            snackbarMessage?: string
        ) => {
            if (!handleClick) return;
            await CallApiWithSnackbar({
                async_func: handleClick,
                ...(snackbarMessage && { message: snackbarMessage }),
            });
        },
        []
    );

    return (
        <>
            <Button
                id="DropdownMenuComponent"
                className="rounded-none"
                onClick={handleClickMenuButton} //
                disabled={!!disabled}
                sx={{
                    "&:hover": {
                        color: colors.primary.main, //
                        backgroundColor: "#fff",
                    },
                    color: open ? colors.primary.main : "#fff",
                    backgroundColor: open ? "#fff" : colors.primary.main,
                }}
            >
                <Stack
                    direction="row" //
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={3}
                >
                    {menuIcon && <Box style={{ display: "flex" }}>{menuIcon}</Box>}
                    {menuTitle}
                </Stack>
            </Button>
            <StyledMenu
                anchorEl={anchorEl} //
                open={open}
                onClose={handleClose}
            >
                {menuitemProps?.map((m, index) => {
                    if (m?.label === "DIVIDER") return <Divider key={`${m?.label}_${index}`} />;
                    if (!!m?.SideMenuComponent)
                        return m.SideMenuComponent({
                            onMenuClose: handleClose,
                        });
                    return (
                        <MenuItem
                            key={`${m?.label}_${index}`}
                            onClick={(_event) => {
                                if (!m?.disableCloseMenuOnClick) handleClose(); //
                                handleClickMenuItem(
                                    m?.handleClick || (async () => {}),
                                    m?.snackbarMessage
                                );
                            }}
                            disabled={!!m?.disabled}
                        >
                            {m?.LeftIconComponent}
                            {m?.label}
                        </MenuItem>
                    );
                })}
            </StyledMenu>
        </>
    );
};

export default memo(DropdownMenuComponent);
