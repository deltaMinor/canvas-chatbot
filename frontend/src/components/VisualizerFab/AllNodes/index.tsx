import React from "react";
import { Transition } from "react-transition-group";

import HubRoundedIcon from "@mui/icons-material/HubRounded";
import { Box, ButtonBase, CircularProgress, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

import { useDiagramView } from "#root/hooks/diagram";

interface ViewAllNodesFabProps {
    isOpen: boolean;
    isPending?: boolean;
    onPendingEntered?: () => void;
    handleClick: () => Promise<void> | void;
}

const ViewAllNodesFabComponent = ({
    isOpen,
    isPending = false,
    onPendingEntered,
    handleClick,
}: ViewAllNodesFabProps) => {
    const transitionNodeRef = React.useRef<HTMLDivElement | null>(null);
    const diagramView = useDiagramView();

    if (diagramView !== "visualizer") {
        return <></>;
    }

    return (
        <Box
            sx={{
                position: "relative",
                display: "flex",
                justifyContent: "flex-end",
            }}
        >
            <Transition
                in={isPending}
                nodeRef={transitionNodeRef}
                timeout={220}
                mountOnEnter
                unmountOnExit
                onEntered={() => {
                    if (isPending) {
                        onPendingEntered?.();
                    }
                }}
            >
                {() => (
                    <Box
                        ref={transitionNodeRef}
                        sx={{
                            position: "absolute",
                            width: 0,
                            height: 0,
                            overflow: "hidden",
                            opacity: 0,
                            pointerEvents: "none",
                        }}
                    />
                )}
            </Transition>
            <ButtonBase
                id="ViewAllNodesFabComponent__button"
                disabled={isPending}
                onClick={handleClick}
                sx={(theme) => ({
                    position: "relative",
                    height: 36,
                    width: 36,
                    minWidth: 36,
                    pl: 0,
                    pr: 0,
                    borderRadius: "999px",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    border: `1px solid ${theme.palette.primary.main}`,
                    backgroundColor: isOpen ? theme.palette.primary.main : "#fff",
                    color: isOpen ? theme.palette.common.white : theme.palette.primary.main,
                    boxShadow: isOpen
                        ? `0 10px 24px ${alpha(theme.palette.primary.main, 0.24)}`
                        : `0 8px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
                    transition:
                        "width 220ms ease, padding 220ms ease, background-color 180ms ease, color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
                    ...(isPending && {
                        width: 106,
                        minWidth: 106,
                        pl: 1.75,
                        pr: 0.75,
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                        boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.28)}`,
                        transform: "translateY(-1px) scale(1.01)",
                    }),
                    "&:hover": {
                        width: 106,
                        minWidth: 106,
                        pl: 1.75,
                        pr: 0.75,
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                        boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.28)}`,
                        transform: "translateY(-1px)",
                    },
                    "&:hover .view-all-nodes-label": {
                        opacity: 1,
                        maxWidth: 62,
                    },
                    "&:hover .view-all-nodes-icon-slot": {
                        left: "auto",
                        top: "50%",
                        right: 0,
                        transform: "translateY(-50%)",
                    },
                    ...(isPending && {
                        "& .view-all-nodes-label": {
                            opacity: 1,
                            maxWidth: 62,
                        },
                        "& .view-all-nodes-icon-slot": {
                            left: "auto",
                            top: "50%",
                            right: 0,
                            transform: "translateY(-50%)",
                        },
                    }),
                })}
            >
                <Typography
                    variant="caption"
                    className="view-all-nodes-label"
                    sx={{
                        position: "absolute",
                        left: 14,
                        right: 36,
                        opacity: 0,
                        maxWidth: 0,
                        fontWeight: 700,
                        letterSpacing: "0.01em",
                        textAlign: "right",
                        lineHeight: 1,
                        textTransform: "none",
                        transition: "opacity 140ms ease, max-width 220ms ease",
                    }}
                >
                    Nodes
                </Typography>
                <Box
                    className="view-all-nodes-icon-slot"
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        lineHeight: 0,
                        borderRadius: "999px",
                        transform: "translate(-50%, -50%)",
                        "& .MuiSvgIcon-root, & .MuiCircularProgress-root": {
                            display: "block",
                        },
                    }}
                >
                    {isPending ? (
                        <CircularProgress
                            size={16}
                            color="inherit"
                        />
                    ) : (
                        <HubRoundedIcon sx={{ fontSize: 20, width: 20, height: 20 }} />
                    )}
                </Box>
            </ButtonBase>
        </Box>
    );
};

export default React.memo(ViewAllNodesFabComponent);
