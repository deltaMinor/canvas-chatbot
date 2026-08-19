import type { ComponentProps } from "react";

import { Dialog } from "@mui/material";
import { clsx } from "clsx";

type StyledDialogProps = ComponentProps<typeof Dialog>;

export const StyledDialog = ({ className, ...props }: StyledDialogProps) => (
    <Dialog
        className={clsx("components-mui-dialog__styled-dialog", className)}
        {...props}
    />
);
