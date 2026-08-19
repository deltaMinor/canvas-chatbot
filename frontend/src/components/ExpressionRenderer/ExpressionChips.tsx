import React from "react";

import { Box, Chip } from "@mui/material";

interface ExpressionChipsProps {
    expression?: string | undefined;
    parameterType?: string | undefined;
}

const ExpressionChips: React.FC<ExpressionChipsProps> = ({ expression, parameterType }) => {
    if (!expression) return null;

    return (
        <Box sx={{ mb: 0.5 }}>
            <Chip
                label={expression}
                size="small"
                color="primary"
                sx={{
                    fontSize: "0.7rem",
                    height: 22,
                    fontWeight: 600,
                    fontFamily: "monospace",
                }}
            />
            {parameterType && (
                <Chip
                    label={`Type: ${parameterType}`}
                    size="small"
                    variant="outlined"
                    sx={{
                        fontSize: "0.65rem",
                        height: 20,
                        ml: 0.5,
                    }}
                />
            )}
        </Box>
    );
};

export default React.memo(ExpressionChips);
