import React from "react";

import { Skeleton, SkeletonProps, SxProps, Theme } from "@mui/material";

import { default_skeleton_props } from "#root/constants/skeleton";

interface MuiSkeletonProps extends SkeletonProps {
    minHeight?: number | string;
}

const MuiSkeletonComponent: React.FC<MuiSkeletonProps> = ({ minHeight, sx, ...props }) => {
    const normalizedSx: SxProps<Theme>[] = [
        default_skeleton_props.sx,
        ...(minHeight === undefined ? [] : [{ minHeight }]),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ];

    const skeleton_props = {
        ...default_skeleton_props,
        ...props,
        sx: normalizedSx as SxProps<Theme>,
    };

    return <Skeleton {...skeleton_props} />;
};

export default React.memo(MuiSkeletonComponent);
