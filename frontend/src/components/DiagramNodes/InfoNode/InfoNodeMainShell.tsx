import React from "react";

import { Stack } from "@mui/material";

import { DiagramNode } from "#root/interfaces/diagram";

interface InfoNodeMainShellProps {
    children: React.ReactNode;
    data: DiagramNode["data"];
    draggable?: boolean;
    selected?: boolean;
}

const InfoNodeMainShellComponent = ({
    children,
    data,
    draggable,
    selected = false,
}: InfoNodeMainShellProps) => {
    const overlayOpacityValue = data?.["overlayOpacity"];
    const overlayOpacity = typeof overlayOpacityValue === "number" ? overlayOpacityValue : 1;
    const shouldPreventCanvasPan = draggable !== false;

    return (
        <Stack
            className={[
                "info-node-shell",
                shouldPreventCanvasPan ? "nopan" : "",
                selected ? "info-node-shell--selected" : "",
                "h-full",
            ]
                .filter(Boolean)
                .join(" ")}
            id="InfoNode"
            direction="column"
            justifyContent="flex-start"
            alignItems="center"
            style={{ position: "relative", zIndex: 1 }}
            sx={{
                opacity: overlayOpacity,
            }}
            spacing={0}
        >
            {children}
        </Stack>
    );
};

export default React.memo(InfoNodeMainShellComponent);
