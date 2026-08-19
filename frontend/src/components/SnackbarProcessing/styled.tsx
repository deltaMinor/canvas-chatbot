import type { ComponentProps } from "react";

import { clsx } from "clsx";
import { SnackbarContent } from "notistack";

type StyledSnackbarContentProps = ComponentProps<typeof SnackbarContent>;

export const StyledSnackbarContent = ({ className, ...props }: StyledSnackbarContentProps) => (
    <SnackbarContent
        className={clsx("components-snackbar-processing__styled-snackbar-content", className)}
        {...props}
    />
);
