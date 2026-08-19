import React from "react";

import { Box, Chip, Typography } from "@mui/material";

interface ExpressionSetAttributesProps {
    setAttribute?: unknown[] | undefined;
}

const ExpressionSetAttributes: React.FC<ExpressionSetAttributesProps> = ({ setAttribute }) => {
    if (!setAttribute || !Array.isArray(setAttribute) || setAttribute.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mt: 1 }}>
            <Typography
                variant="caption"
                sx={{
                    display: "block",
                    fontWeight: 600,
                    color: "text.secondary",
                    mb: 0.5,
                    fontSize: "0.7rem",
                }}
            >
                Set Attributes:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {setAttribute.map((attr, idx) => (
                    <Chip
                        key={idx}
                        label={String(attr)}
                        size="small"
                        variant="outlined"
                        sx={{
                            fontSize: "0.65rem",
                            height: 20,
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default React.memo(ExpressionSetAttributes);
