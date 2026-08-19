import type { ComponentProps } from "react";

import { clsx } from "clsx";

import MuiDrawer from "#root/components/MuiDrawer";

type DiagramDrawerShellProps = ComponentProps<typeof MuiDrawer>;

export const DiagramDrawerShell = ({ className, ...props }: DiagramDrawerShellProps) => (
    <MuiDrawer
        className={clsx("components-diagram-drawer__diagram-drawer-shell", className)}
        useRelativePaperPosition
        {...props}
    />
);
