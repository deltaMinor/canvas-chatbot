import type { ComponentProps } from "react";

import { Tabs } from "@mui/material";
import { clsx } from "clsx";

type ContainedTabsComponentProps = ComponentProps<typeof Tabs>;

export const ContainedTabsComponent = ({ className, ...props }: ContainedTabsComponentProps) => (
    <Tabs
        className={clsx("components-contained-tabs__contained-tabs-component", className)}
        {...props}
    />
);
