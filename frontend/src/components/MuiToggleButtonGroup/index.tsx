import React from "react";

import { ToggleButtonGroupProps } from "@mui/material";

import { StyledToggleButtonGroup } from "./styled";

interface MuiToggleButtonGroupProps extends ToggleButtonGroupProps {}

const MuiToggleButtonGroupComponent = ({
    children, //
    ...props
}: MuiToggleButtonGroupProps) => {
    return (
        <StyledToggleButtonGroup
            {...props} //
        >
            {children}
        </StyledToggleButtonGroup>
    );
};

export default React.memo(MuiToggleButtonGroupComponent);
