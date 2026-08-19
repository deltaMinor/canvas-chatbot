import React from "react";

import { TabsProps } from "@mui/material";

import { StyledTabs } from "./styled";

interface ShadowTabsProps extends TabsProps {}

const ShadowTabsComponent = ({ children, ...props }: ShadowTabsProps) => {
    return <StyledTabs {...props}>{children}</StyledTabs>;
};

export default React.memo(ShadowTabsComponent);
