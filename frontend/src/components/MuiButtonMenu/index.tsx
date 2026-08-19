import React from "react";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ButtonProps, MenuItemProps, MenuProps } from "@mui/material";

import MuiButton from "#root/components/MuiButton";
import MuiMenu from "#root/components/MuiMenu";
import MuiMenuItem from "#root/components/MuiMenuItem";
import { SelectableValue } from "#root/interfaces";

export interface MuiButtonMenuOption extends SelectableValue {
    startIcon?: React.ReactNode;
    handleClickMenuItem?: (
        e: React.MouseEvent<HTMLLIElement, MouseEvent>, //
        v: string
    ) => Promise<void>;
}

const defaultButtonStyle = {
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "4.5px",
    minHeight: "unset",
};

const defaultButtonSx = {
    "&.MuiButtonBase-root.MuiButton-root.Mui-disabled": {
        // color: "rgba(34, 51, 84, 0.5)",
    },
};

const defaultMenuStyle = {};

const defaultMenuItemStyle = {};

export interface MuiButtonMenuProps {
    options: MuiButtonMenuOption[];
    handleClickMenu?: (
        e: React.MouseEvent<HTMLButtonElement> //
    ) => Promise<void>;
    handleClickMenuItem?: (
        e: React.MouseEvent<HTMLLIElement, MouseEvent>, //
        v: string
    ) => Promise<void>;
    handleCloseButton?: () => Promise<void>;
    //
    buttonProps?: Partial<ButtonProps>;
    menuItemProps?: Partial<MenuItemProps>;
    menuProps?: Partial<MenuProps>;
    //
    disableCloseMenuOnClick?: boolean;
    disabled?: boolean;
    selectedValue?: string;
    //
    children?: React.ReactNode;
}

const MuiButtonMenuComponent = ({
    options, //
    selectedValue,
    children,
    handleClickMenu: props__handleClickMenu = async () => {},
    handleClickMenuItem: props__handleClickMenuItem = async () => {},
    handleCloseButton: props__handleCloseButton = async () => {},
    ...props
}: MuiButtonMenuProps) => {
    // Hooks
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const shouldDisableComponent = () => {
        return (
            !options?.length || //
            !!props?.disabled
        );
    };
    const isComponentDisabled = shouldDisableComponent();

    const buttonProps: Partial<ButtonProps> = {
        ...(props?.buttonProps || {}), //
        style: {
            ...defaultButtonStyle,
            ...(props?.buttonProps?.style || {}), //
        },
        sx: {
            ...defaultButtonSx,
            ...(props?.buttonProps?.sx || {}), //
        },
        disabled:
            !!isComponentDisabled || //
            !!props?.buttonProps?.disabled,
    };

    const menuProps: Partial<MenuProps> = {
        ...(props?.menuProps || {}), //
        style: {
            ...defaultMenuStyle,
            ...(props?.menuProps?.style || {}), //
        },
    };

    const menuItemProps: Partial<MenuItemProps> = {
        ...(props?.menuItemProps || {}), //
        style: {
            ...defaultMenuItemStyle,
            ...(props?.menuItemProps?.style || {}), //
        },
        disabled:
            !!isComponentDisabled || //
            !!props?.menuItemProps?.disabled,
    };

    const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        props__handleClickMenu(event);
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        props__handleCloseButton();
        setAnchorEl(null);
    };

    const handleClickMenuItem = (
        event: React.MouseEvent<HTMLLIElement, MouseEvent>, //
        opt: MuiButtonMenuOption
    ) => {
        const {
            value, //
            handleClickMenuItem: opt__handleClickMenuItem = () => {},
        } = opt;
        props__handleClickMenuItem(event, value);
        opt__handleClickMenuItem(event, value);
        if (!!props?.disableCloseMenuOnClick) return;
        handleClose();
    };

    return (
        <div
            style={{
                width: !!buttonProps?.fullWidth ? "100%" : "fit-content", //
            }}
        >
            <MuiButton
                onClick={handleClickMenu} //
                endIcon={!!open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                {...buttonProps}
            >
                {children}
            </MuiButton>
            <MuiMenu
                anchorEl={anchorEl} //
                open={open}
                onClose={handleClose}
                {...menuProps}
            >
                {options
                    ?.filter((opt) => !opt.hidden)
                    ?.map((opt, optIdx) => {
                        return (
                            <MuiMenuItem
                                key={optIdx} //
                                selected={opt.value === selectedValue}
                                onClick={(ev) =>
                                    handleClickMenuItem(
                                        ev, //
                                        opt
                                    )
                                }
                                value={`${opt.value}`}
                                {...menuItemProps}
                                disabled={
                                    !!menuItemProps?.disabled || //
                                    !!opt?.disabled ||
                                    !!opt?.ref?.["disabled"]
                                }
                            >
                                {opt.startIcon && (
                                    <span style={{ marginRight: "8px", display: "inline-flex" }}>
                                        {opt.startIcon}
                                    </span>
                                )}
                                {opt.label}
                            </MuiMenuItem>
                        );
                    })}
            </MuiMenu>
        </div>
    );
};

export default React.memo(MuiButtonMenuComponent);
