import type { ComponentProps } from "react";

import { ToggleButtonGroup } from "@mui/material";
import { clsx } from "clsx";

type StyledToggleButtonGroupProps = ComponentProps<typeof ToggleButtonGroup>;

export const StyledToggleButtonGroup = ({ className, ...props }: StyledToggleButtonGroupProps) => (
    <ToggleButtonGroup
        className={clsx(
            "components-mui-toggle-button-group__styled-toggle-button-group",
            className
        )}
        {...props}
    />
);
