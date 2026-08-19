import React from "react";

import { Box } from "@mui/material";

import NodeDataStoredBadge from "#root/components/NodeDataStoredBadge";
import { INFO_NODE_BADGE_BLOCK_CONTAINER_OFFSET_TOP } from "#root/constants/diagramConfig";

interface InfoNodeBadgeBoxProps {
    count: number;
    labels: string[];
}

const badgeBoxStyles: SxProps<Theme> = {
    position: "absolute",
    top: INFO_NODE_BADGE_BLOCK_CONTAINER_OFFSET_TOP,
    left: 0,
    right: 0,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    pt: 0.5,
    pb: 0.5,
    px: 1,
    bgcolor: "background.paper",
    opacity: 0.95,
    borderRadius: 1,
    border: (theme) => `1px solid ${theme.palette.divider}`,
    boxShadow: (theme) =>
        `0 2px 8px ${theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.15)"}`,
};

const InfoNodeBadgeBox: React.FC<InfoNodeBadgeBoxProps> = ({ count, labels }) => {
    return (
        <Box sx={badgeBoxStyles}>
            <NodeDataStoredBadge
                count={count}
                labels={labels}
            />
        </Box>
    );
};

export default React.memo(InfoNodeBadgeBox);
