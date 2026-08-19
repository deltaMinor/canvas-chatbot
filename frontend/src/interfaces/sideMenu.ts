export interface MenuItemProps {
    disabled?: boolean;
    handleClick?: () => Promise<void>;
    label: string;
    disableCloseMenuOnClick?: boolean;
    snackbarMessage?: string;
    SideMenuComponent?: (props?: MenuProps) => React.ReactNode;
    LeftIconComponent?: React.ReactNode;
    RightIconComponent?: React.ReactNode;
}

export interface MenuProps {
    menuTitle?: string;
    menuitemProps?: MenuItemProps[];
    menuIcon?: React.ReactNode;
    disabled?: boolean;
    onMenuClose?: () => void;
}
