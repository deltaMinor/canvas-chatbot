import React from "react";

import { DEFAULT_ZINDEX_DIAGRAM_DRAWER } from "#root/constants/diagram";
import { waitForNextFrame } from "#root/utils/animationFrameUtil";

import { DiagramDrawerBody } from "./DiagramDrawerBody";
import { DiagramDrawerHeader } from "./DiagramDrawerHeader";
import { DiagramDrawerMenu } from "./DiagramDrawerMenu";
import { DiagramDrawerSkeleton } from "./DiagramDrawerSkeleton";
import { DiagramDrawerShell } from "./styled";

export type { DiagramDrawerBodyProps } from "./DiagramDrawerBody";
export type { DiagramDrawerHeaderProps } from "./DiagramDrawerHeader";
export type { DiagramDrawerMenuProps } from "./DiagramDrawerMenu";
export type { DiagramDrawerSkeletonProps } from "./DiagramDrawerSkeleton";
export type { DiagramDrawerMenuOption } from "./types";

export interface DiagramDrawerRootProps {
    openDrawer: boolean;
    drawerWidth: string;
    anchor: "bottom" | "left" | "right" | "top";
    children: React.ReactNode;
    zIndex?: number;
    joyrideClassName?: string;
    onDrawerSettled?: (openDrawer: boolean) => void;
}

const DiagramDrawerRootComponent = ({
    openDrawer,
    drawerWidth,
    anchor,
    children,
    zIndex,
    joyrideClassName,
    onDrawerSettled,
}: DiagramDrawerRootProps) => {
    const previousOpenDrawerRef = React.useRef(openDrawer);
    const resolvedZIndex = zIndex ?? DEFAULT_ZINDEX_DIAGRAM_DRAWER;
    const closedTransform = React.useMemo(() => {
        switch (anchor) {
            case "left":
                return "translateX(-100%)";
            case "right":
                return "translateX(100%)";
            case "top":
                return "translateY(-100%)";
            case "bottom":
                return "translateY(100%)";
            default:
                return "translateX(-100%)";
        }
    }, [anchor]);

    React.useEffect(() => {
        const didDrawerStateChange = openDrawer !== previousOpenDrawerRef.current;
        previousOpenDrawerRef.current = openDrawer;

        if (!didDrawerStateChange || !onDrawerSettled) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            void waitForNextFrame(1, () => {
                onDrawerSettled(openDrawer);
                void waitForNextFrame(1, () => {
                    window.dispatchEvent(new Event("resize"));
                });
            });
        }, 240);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [onDrawerSettled, openDrawer]);

    return (
        <DiagramDrawerShell
            id="DiagramDrawerComponent"
            style={{
                width: openDrawer ? drawerWidth : 0,
                minWidth: openDrawer ? drawerWidth : 0,
                maxWidth: openDrawer ? drawerWidth : 0,
                zIndex: resolvedZIndex,
                overflowX: openDrawer ? "visible" : "hidden",
                overflowY: "hidden",
            }}
            sx={{
                overflowX: openDrawer ? "visible" : "hidden",
                overflowY: "hidden",
                "& .MuiDrawer-paper": {
                    zIndex: resolvedZIndex,
                    width: openDrawer ? drawerWidth : 0,
                    minWidth: openDrawer ? drawerWidth : 0,
                    maxWidth: openDrawer ? drawerWidth : 0,
                    overflowX: openDrawer ? "visible" : "hidden",
                    overflowY: "hidden",
                    pointerEvents: openDrawer ? "auto" : "none",
                    visibility: openDrawer ? "visible" : "hidden",
                    transform: openDrawer ? "translate3d(0, 0, 0)" : closedTransform,
                    transition:
                        "width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms, transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms, visibility 225ms linear",
                },
            }}
            variant="persistent"
            anchor={anchor}
            open={openDrawer}
            className={["diagram-drawer-root", joyrideClassName].filter(Boolean).join(" ")}
        >
            {children}
        </DiagramDrawerShell>
    );
};

const DiagramDrawerRoot = React.memo(DiagramDrawerRootComponent);

const DiagramDrawer = Object.assign(DiagramDrawerRoot, {
    Root: DiagramDrawerRoot,
    Header: DiagramDrawerHeader,
    Body: DiagramDrawerBody,
    Menu: DiagramDrawerMenu,
    Skeleton: DiagramDrawerSkeleton,
});

export default DiagramDrawer;
