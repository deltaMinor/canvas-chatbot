import React from "react";

import { Box, CircularProgress, Portal, Stack, Typography } from "@mui/material";

export interface PageTransitionOverlayProps {
    open: boolean;
    eyebrowText: string;
    titleText: string;
    descriptionText: string;
}

const PageTransitionOverlayComponent = ({
    open,
    eyebrowText,
    titleText,
    descriptionText,
}: PageTransitionOverlayProps) => {
    const overlayContent = (
        <Box
            aria-hidden={!open}
            className={`page-transition-overlay ${
                open ? "page-transition-overlay--open" : "page-transition-overlay--closed"
            }`}
        >
            <Box className="page-transition-overlay__backdrop-orb page-transition-overlay__backdrop-orb--primary" />
            <Box className="page-transition-overlay__backdrop-orb page-transition-overlay__backdrop-orb--secondary" />
            <Stack className="page-transition-overlay__card">
                <Box className="page-transition-overlay__spinner-shell">
                    <Box className="page-transition-overlay__spinner-ring" />
                    <CircularProgress
                        size={24}
                        thickness={5}
                        className="page-transition-overlay__spinner"
                    />
                </Box>
                <Typography
                    variant="overline"
                    className="page-transition-overlay__eyebrow"
                >
                    {eyebrowText}
                </Typography>
                <Typography
                    variant="h5"
                    className="page-transition-overlay__title"
                >
                    {titleText}
                </Typography>
                <Typography
                    variant="body2"
                    className="page-transition-overlay__description"
                >
                    {descriptionText}
                </Typography>
                <Stack
                    direction="row"
                    spacing={1}
                    className="page-transition-overlay__dots"
                >
                    <Box className="page-transition-overlay__dot page-transition-overlay__dot--first" />
                    <Box className="page-transition-overlay__dot page-transition-overlay__dot--second" />
                    <Box className="page-transition-overlay__dot page-transition-overlay__dot--third" />
                </Stack>
            </Stack>
        </Box>
    );

    return <Portal>{overlayContent}</Portal>;
};

export default React.memo(PageTransitionOverlayComponent);
