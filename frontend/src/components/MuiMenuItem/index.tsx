import React from "react";

import { MenuItem, MenuItemProps } from "@mui/material";

interface MuiMenuItemProps extends MenuItemProps {}

const MuiMenuItemComponent = ({
    ...props //
}: MuiMenuItemProps) => {
    return <MenuItem {...props} />;
};

export default React.memo(MuiMenuItemComponent);
