import React from "react";

import { Box, Typography } from "@mui/material";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
}
const PageHeaderComponent = ({
    title, //
    subtitle,
}: PageHeaderProps) => {
    return (
        <Box //
            className="px-2 pt-1"
        >
            <Typography
                variant="h5"
                gutterBottom
            >
                {title}
            </Typography>
            {!!subtitle && (
                <Typography
                    variant="body1"
                    gutterBottom
                >
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
};

export default React.memo(PageHeaderComponent);
