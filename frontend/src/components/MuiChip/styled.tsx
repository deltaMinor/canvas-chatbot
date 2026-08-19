import type { ComponentProps } from "react";

import { Chip } from "@mui/material";
import { clsx } from "clsx";

type StyledChipProps = ComponentProps<typeof Chip>;

export const StyledChip = ({ className, ...props }: StyledChipProps) => (
    <Chip
        className={clsx("components-mui-chip__styled-chip", className)}
        {...props}
    />
);
