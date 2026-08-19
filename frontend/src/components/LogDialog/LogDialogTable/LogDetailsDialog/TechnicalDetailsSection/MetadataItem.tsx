import React from "react";

import { Box, Typography } from "@mui/material";

interface MetadataItemProps {
    label: string;
    value: React.ReactNode;
}

const metadataLabelStyles: SxProps<Theme> = {
    color: "text.secondary",
    mb: 0.5,
};

const metadataValueStyles: SxProps<Theme> = {
    color: "text.primary",
};

const MetadataItem: React.FC<MetadataItemProps> = ({ label, value }) => (
    <Box>
        <Typography
            sx={metadataLabelStyles}
            className="log-details-metadata-item__label"
        >
            {label}
        </Typography>
        <Box
            sx={metadataValueStyles}
            className="log-details-metadata-item__value"
        >
            {value}
        </Box>
    </Box>
);

export default React.memo(MetadataItem);
