import React from "react";

import { Storage } from "@mui/icons-material";
import { Badge, Box, Tooltip } from "@mui/material";

interface NodeDataStoredBadgeProps {
    count: number;
    labels: string[];
}

const NodeDataStoredBadge: React.FC<NodeDataStoredBadgeProps> = ({ count, labels }) => {
    return (
        <Tooltip
            title={
                <Box>
                    <Box sx={{ fontWeight: 600, marginBottom: 0.5 }}>Data Stored ({count}):</Box>
                    {labels.map((label, idx) => (
                        <Box
                            key={idx}
                            sx={{ fontSize: "0.75rem" }}
                        >
                            • {label}
                        </Box>
                    ))}
                </Box>
            }
            placement="top"
            arrow
        >
            <Badge
                badgeContent={count}
                color="primary"
                sx={{
                    "& .MuiBadge-badge": {
                        fontSize: "0.625rem",
                        minWidth: "18px",
                        height: "18px",
                        padding: "0 4px",
                    },
                }}
            >
                <Storage
                    sx={{
                        fontSize: "20px",
                        color: "primary.main",
                        cursor: "pointer",
                    }}
                />
            </Badge>
        </Tooltip>
    );
};

export default React.memo(NodeDataStoredBadge);
