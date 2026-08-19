import React from "react";

import { Box, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

import LogDetailsSummary from "./LogDetailsSummary";

const sectionContainerStyles: SxProps<Theme> = {
    mb: 4,
    p: 3,
    bgcolor: "background.paper",
    borderRadius: 2,
    border: (theme) => `1px solid ${theme.palette.divider}`,
    boxShadow: (theme) =>
        `0 1px 3px ${theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.08)"}`,
};

const titleContainerStyles: SxProps<Theme> = {
    mb: 2.5,
    pb: 2,
    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
};

const titleStyles: SxProps<Theme> = {
    color: "text.primary",
    m: 0,
};

const summaryContentStyles: SxProps<Theme> = {
    color: "text.primary",
    m: 0,
};

const SummarySection = () => {
    return (
        <Box sx={sectionContainerStyles}>
            <Box sx={titleContainerStyles}>
                <Typography
                    variant="overline"
                    sx={titleStyles}
                    className="log-details-summary-section__title"
                >
                    Summary of Changes
                </Typography>
            </Box>
            <Typography
                variant="body1"
                component="div"
                sx={summaryContentStyles}
                className="log-details-summary-section__content"
            >
                <LogDetailsSummary />
            </Typography>
        </Box>
    );
};

export default React.memo(SummarySection);
