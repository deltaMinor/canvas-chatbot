import React from "react";

import { Box, CardContent, Stack, useTheme } from "@mui/material";

interface SimpleCardContentProps {
    children?: React.ReactNode;
}

const SimpleCardContentComponent = ({ children }: SimpleCardContentProps) => {
    const theme = useTheme();

    return (
        <CardContent
            id="SimpleCardContentComponent"
            sx={{
                "&:last-child": {
                    paddingBottom: theme.spacing(2),
                },
                padding: theme.spacing(2, 3),
            }}
        >
            <Box>
                <Stack spacing={2}>{children}</Stack>
            </Box>
        </CardContent>
    );
};

export default React.memo(SimpleCardContentComponent);
