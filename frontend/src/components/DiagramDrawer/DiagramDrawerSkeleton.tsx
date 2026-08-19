import React from "react";

import { Box, Skeleton, Stack } from "@mui/material";

export interface DiagramDrawerSkeletonProps {
    lines?: number;
}

const DiagramDrawerSkeletonComponent: React.FC<DiagramDrawerSkeletonProps> = ({ lines = 3 }) => {
    return (
        <Stack
            spacing={2}
            sx={{
                p: 2,
            }}
        >
            <Skeleton
                variant="rounded"
                height={36}
            />
            {Array.from({ length: lines }, (_, index) => (
                <Skeleton
                    key={index}
                    variant="rounded"
                    height={64}
                />
            ))}
            <Box sx={{ flex: 1 }} />
        </Stack>
    );
};

export const DiagramDrawerSkeleton = React.memo(DiagramDrawerSkeletonComponent);
