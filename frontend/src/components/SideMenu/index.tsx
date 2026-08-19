import React from "react";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Box, Divider, Stack } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

import { MenuProps } from "#root/interfaces/sideMenu";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";

import { StyledMenu } from "./StyledMenu";

const SideMenuComponent = ({
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

    const handleClickMenuButton = React.useCallback(
        (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
            if (!menuitemProps?.length) return;
            setAnchorEl(event.currentTarget);
        },
        [menuitemProps?.length]
    );

    const handleClose = React.useCallback(() => {
        setAnchorEl(null);
        if (!!onMenuClose) onMenuClose();
    }, [onMenuClose]);

    return (
        <>
            <MenuItem
                onClick={handleClickMenuButton} //
                disabled={!!disabled}
                className="w-full"
            >
                <Stack
                    direction="row" //
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={3}
                    className="w-full"
                >
                    <Stack //
                        direction="row"
                        className="pr-1"
                    >
                        {menuIcon && <Box style={{ display: "flex" }}>{menuIcon}</Box>}
                        {menuTitle}
                    </Stack>
                    <KeyboardArrowRightIcon style={{ margin: 0 }} />
                </Stack>
            </MenuItem>
            <StyledMenu
                anchorEl={anchorEl} //
                open={open}
                onClose={handleClose}
            >
                {menuitemProps?.map((m) => {
                    if (m?.label === "DIVIDER") return <Divider key={m?.label} />;
                    if (!!m?.SideMenuComponent)
                        return m.SideMenuComponent({
                            onMenuClose: handleClose,
                        });
                    return (
                        <MenuItem
                            key={m?.label}
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
                            {m?.RightIconComponent}
                        </MenuItem>
                    );
                })}
            </StyledMenu>
        </>
    );
};

export default React.memo(SideMenuComponent);
