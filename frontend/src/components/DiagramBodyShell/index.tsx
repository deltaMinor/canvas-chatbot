import React from "react";
import { ErrorBoundary } from "react-error-boundary";

import { Box } from "@mui/material";

import ErrorFallback from "#root/components/ErrorFallback";

interface DiagramBodyShellProps {
    children: React.ReactNode;
    id: string;
    containerRef?: React.Ref<unknown>;
}

const DiagramBodyShellComponent = ({ children, id, containerRef }: DiagramBodyShellProps) => {
    return (
        <Box
            id={id}
            {...(containerRef ? { ref: containerRef } : {})}
            className="diagram-canvas-body"
        >
            <Box className="diagram-canvas-body__surface">
                <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
            </Box>
        </Box>
    );
};

export default React.memo(DiagramBodyShellComponent);
