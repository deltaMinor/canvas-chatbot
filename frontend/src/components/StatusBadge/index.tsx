import React from "react";

import { CheckCircle, Error, Info, Warning } from "@mui/icons-material";
import { Box, SxProps, Theme } from "@mui/material";
import { motion } from "motion/react";

type StatusType = "success" | "error" | "warning" | "info";

interface StatusBadgeProps {
    status?: StatusType;
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
    size?: "small" | "medium" | "large";
    sx?: SxProps<Theme>;
}

const statusConfig: Record<StatusType, { icon: React.ElementType; color: string }> = {
    success: { icon: CheckCircle, color: "success.main" },
    error: { icon: Error, color: "error.main" },
    warning: { icon: Warning, color: "warning.main" },
    info: { icon: Info, color: "info.main" },
};

const positionStyles: Record<string, SxProps<Theme>> = {
    "top-right": { top: 16, right: 16 },
    "top-left": { top: 16, left: 16 },
    "bottom-right": { bottom: 16, right: 16 },
    "bottom-left": { bottom: 16, left: 16 },
};

const sizeStyles: Record<string, { fontSize: number }> = {
    small: { fontSize: 20 },
    medium: { fontSize: 24 },
    large: { fontSize: 32 },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status = "success",
    position = "top-right",
    size = "medium",
    sx,
}) => {
    const { icon: Icon, color } = statusConfig[status];
    const positionStyle = positionStyles[position];
    const sizeStyle = sizeStyles[size];

    return (
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
            }}
        >
            <Box
                sx={[
                    {
                        position: "absolute",
                        color,
                        zIndex: 1,
                    },
                    positionStyle,
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
            >
                <Icon sx={sizeStyle} />
            </Box>
        </motion.div>
    );
};

export default StatusBadge;
