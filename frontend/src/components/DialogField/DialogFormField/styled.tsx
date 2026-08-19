import type { ComponentProps } from "react";

import { Box } from "@mui/material";
import { clsx } from "clsx";

type StyledDialogFieldBoxProps = ComponentProps<typeof Box>;

export const StyledDialogFieldBox = ({ className, ...props }: StyledDialogFieldBoxProps) => (
    <Box
        className={clsx(
            "components-dialog-field-dialog-form-field__styled-dialog-field-box",
            className
        )}
        {...props}
    />
);
