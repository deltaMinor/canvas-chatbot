import React from "react";

import { Box, Divider, Typography, useTheme } from "@mui/material";

interface SimpleCardTitleProps {
    title: string;
}

const SimpleCardTitleComponent = ({ title }: SimpleCardTitleProps) => {
    const theme = useTheme();

    if (!title) return null;

    return (
        <>
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    backgroundColor: theme.palette.background.paper,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        letterSpacing: "0.01em",
                    }}
                >
                    {title}
                </Typography>
            </Box>
            <Divider
                sx={{
                    backgroundColor: theme.colors.alpha.black[10],
                    border: "none",
                    height: 1,
                }}
            />
        </>
    );
};

export default React.memo(SimpleCardTitleComponent);
