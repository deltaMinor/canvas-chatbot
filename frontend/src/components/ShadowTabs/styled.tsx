import type { ComponentProps } from "react";

import { Tabs } from "@mui/material";
import { clsx } from "clsx";

type StyledTabsProps = ComponentProps<typeof Tabs>;

export const StyledTabs = ({ className, ...props }: StyledTabsProps) => (
    <Tabs
        className={clsx("components-shadow-tabs__styled-tabs", className)}
        {...props}
    />
);
