import React from "react";

import { Box, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

interface FieldChangesTreeViewWrapperProps {
    children?: React.ReactNode;
}

const containerStyles: SxProps<Theme> = {
    mt: 1,
};

const titleStyles: SxProps<Theme> = {
    color: "primary.main",
    mb: 2,
};

const treeViewContainerStyles: SxProps<Theme> = {
    bgcolor: "background.paper",
    borderRadius: 1,
    p: 2,
    border: (theme) => `1px solid ${theme.palette.divider}`,
    maxHeight: "400px",
    overflow: "auto",
};

const FieldChangesTreeViewWrapper = ({ children }: FieldChangesTreeViewWrapperProps) => {
    return (
        <Box sx={containerStyles}>
            <Typography
                sx={titleStyles}
                className="log-details-field-changes__title"
            >
                Field Changes
            </Typography>
            <Box sx={treeViewContainerStyles}>{children}</Box>
        </Box>
    );
};

export default React.memo(FieldChangesTreeViewWrapper);
