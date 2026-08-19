import React from "react";

import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { Box, Fade, Stack, Typography } from "@mui/material";

interface DiagramTransitionOverlayProps {
    inTransition: boolean;
    zIndex?: number;
}

const DiagramTransitionOverlayComponent = ({
    inTransition,
    zIndex,
}: DiagramTransitionOverlayProps) => {
    return (
        <Fade
            in={inTransition}
            unmountOnExit
        >
            <Box
                className="diagram-canvas-transition-overlay"
                style={{
                    background: "transparent",
                    zIndex: zIndex ?? 5,
                }}
                sx={(theme) => ({
                    "--diagram-canvas-transition-overlay-bg": "rgba(15, 23, 42, 0.2)",
                    "--diagram-canvas-transition-main": theme.palette.primary.main,
                    "--diagram-canvas-transition-text": theme.palette.primary.dark,
                    background: "transparent",
                    inset: 0,
                    pointerEvents: "auto",
                    position: "absolute",
                })}
            >
                <Box className="diagram-canvas-transition-overlay__backdrop" />
                <Stack className="diagram-canvas-transition-overlay__card">
                    <Box className="diagram-canvas-transition-overlay__orb-shell">
                        <Box className="diagram-canvas-transition-overlay__orb-ring diagram-canvas-transition-overlay__orb-ring--outer" />
                        <Box className="diagram-canvas-transition-overlay__orb-ring diagram-canvas-transition-overlay__orb-ring--inner" />
                        <Box
                            className="diagram-canvas-transition-overlay__orb-core"
                            sx={(theme) => ({
                                color: theme.palette.common.white,
                            })}
                        >
                            <AutorenewRoundedIcon
                                className="diagram-canvas-transition-overlay__orb-icon"
                                sx={{
                                    fontSize: 30,
                                    animation: "canvas-overlay-spin 1.1s linear infinite",
                                    animationPlayState: "running",
                                    transformOrigin: "center",
                                    willChange: "transform",
                                }}
                            />
                        </Box>
                    </Box>
                    <Typography
                        variant="h2"
                        className="diagram-canvas-transition-overlay__title"
                    >
                        Loading
                    </Typography>
                    <Box className="diagram-canvas-transition-overlay__dots">
                        {[0, 1, 2].map((index) => (
                            <Box
                                key={index}
                                className="diagram-canvas-transition-overlay__dot"
                                sx={{
                                    animationDelay: `${index * 0.16}s`,
                                }}
                            />
                        ))}
                    </Box>
                </Stack>
            </Box>
        </Fade>
    );
};

export default React.memo(DiagramTransitionOverlayComponent);
