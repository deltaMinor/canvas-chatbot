import { MenuItemProps } from "@mui/material";

import { SelectableValue } from "#root/interfaces";

export interface ActionItemMenuProps extends SelectableValue {
    handleClickMenuItem: (
        ev: React.MouseEvent<HTMLLIElement, MouseEvent> //
    ) => Promise<void>;
    menuItemProps?: Partial<MenuItemProps>;
    disabled?: boolean;
    startIcon?: React.ReactNode;
}
