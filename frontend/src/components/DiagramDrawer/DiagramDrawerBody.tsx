import React from "react";

import { Box, SxProps, Theme } from "@mui/material";

import { DiagramDrawerSkeleton } from "./DiagramDrawerSkeleton";

export interface DiagramDrawerBodyProps {
    children: React.ReactNode;
    bodyHeight?: string;
    contentSx?: SxProps<Theme>;
    loaded?: boolean;
    skeletonLines?: number;
    includeFooter?: boolean;
}

const DiagramDrawerBodyComponent = ({
    children, //
    contentSx,
    loaded = true,
    skeletonLines,
}: DiagramDrawerBodyProps) => {
    return (
        <Box
            id="DiagramDrawerBody"
            sx={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                height: "calc(100dvh - 224px)",
                maxHeight: "calc(100dvh - 224px)",
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                ...contentSx,
            }}
        >
            {loaded ? (
                children
            ) : (
                <DiagramDrawerSkeleton
                    {...(skeletonLines !== undefined ? { lines: skeletonLines } : {})}
                />
            )}
        </Box>
    );
};

export const DiagramDrawerBody = React.memo(DiagramDrawerBodyComponent);
