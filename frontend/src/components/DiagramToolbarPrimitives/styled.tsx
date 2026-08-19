import type { ComponentProps } from "react";

import { Divider } from "@mui/material";
import { clsx } from "clsx";

import MuiButton from "#root/components/MuiButton";

type DiagramToolbarDividerProps = ComponentProps<typeof Divider>;

export const DiagramToolbarDivider = ({ className, ...props }: DiagramToolbarDividerProps) => (
    <Divider
        className={clsx(
            "components-diagram-toolbar-primitives__diagram-toolbar-divider",
            className
        )}
        {...props}
    />
);

type DiagramToolbarButtonProps = ComponentProps<typeof MuiButton>;

export const DiagramToolbarButton = ({ className, ...props }: DiagramToolbarButtonProps) => (
    <MuiButton
        className={clsx("components-diagram-toolbar-primitives__diagram-toolbar-button", className)}
        {...props}
    />
);
