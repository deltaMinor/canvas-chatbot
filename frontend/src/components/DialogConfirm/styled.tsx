import type { ComponentProps } from "react";

import { Box } from "@mui/material";
import { clsx } from "clsx";

type StyledDataBoxProps = ComponentProps<typeof Box>;

export const StyledDataBox = ({ className, ...props }: StyledDataBoxProps) => (
    <Box
        className={clsx("components-dialog-confirm__styled-data-box", className)}
        {...props}
    />
);
