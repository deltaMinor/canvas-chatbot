import React from "react";

import { ArrowBack, ChevronRightRounded, ShieldOutlined } from "@mui/icons-material";
import { Box, Divider, IconButton, Stack, SxProps, Theme, Typography } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";

import { DiagramDrawerMenu } from "./DiagramDrawerMenu";
import { DiagramDrawerMenuOption } from "./types";

export interface DiagramDrawerHeaderProps {
    title: string;
    subtitle?: string;
    headerIcon?: React.ReactNode | undefined;
    actions?: React.ReactNode;
    showBackButton?: boolean;
    hideCloseDrawerButton?: boolean;
    anchor: "bottom" | "left" | "right" | "top";
    menuOptions?: DiagramDrawerMenuOption[];
    handleCloseDrawer: () => void;
    handleClickBack?: () => Promise<void>;
}

const iconButtonStyles: SxProps<Theme> = {
    color: "text.secondary",
    "&:hover": {
        backgroundColor: "action.hover",
        color: "text.primary",
    },
};

const headerStyles: SxProps<Theme> = {
    padding: (theme) => theme.spacing(1.5, 2),
    backgroundColor: "background.paper",
    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
    minHeight: "72px",
};

const titleStyles: SxProps<Theme> = {
    fontSize: "1rem",
    fontWeight: 600,
    color: "text.primary",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
};

const subtitleStyles: SxProps<Theme> = {
    fontSize: "0.6875rem",
    fontWeight: 700,
    color: "text.secondary",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    lineHeight: 1.2,
};

const dividerStyles: SxProps<Theme> = {
    height: "24px",
    alignSelf: "center",
};

const DiagramDrawerHeaderComponent: React.FC<DiagramDrawerHeaderProps> = ({
    title,
    subtitle,
    headerIcon,
    actions,
    showBackButton = false,
    hideCloseDrawerButton,
    menuOptions,
    handleCloseDrawer,
    handleClickBack = async () => {},
}) => {
    return (
        <Stack
            id="DiagramDrawerHeader"
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={headerStyles}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ flex: 1, minWidth: 0 }}
            >
                {showBackButton && (
                    <>
                        <MuiTooltip title="Back">
                            <IconButton
                                onClick={handleClickBack}
                                size="small"
                                sx={iconButtonStyles}
                                aria-label="Go back"
                            >
                                <ArrowBack fontSize="small" />
                            </IconButton>
                        </MuiTooltip>
                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={dividerStyles}
                        />
                    </>
                )}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ flex: 1, minWidth: 0 }}
                >
                    <Box
                        sx={(theme) => ({
                            width: 38,
                            height: 38,
                            flexShrink: 0,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: theme.colors.primary.lighter,
                            color: theme.palette.primary.main,
                        })}
                    >
                        {headerIcon ?? <ShieldOutlined fontSize="small" />}
                    </Box>
                    <Stack
                        spacing={0.25}
                        sx={{ flex: 1, minWidth: 0 }}
                    >
                        <Typography
                            variant="h6"
                            sx={titleStyles}
                        >
                            {title}
                        </Typography>
                        {!!subtitle && <Typography sx={subtitleStyles}>{subtitle}</Typography>}
                    </Stack>
                </Stack>
            </Stack>
            <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
            >
                {actions}
                {menuOptions && <DiagramDrawerMenu menuOptions={menuOptions} />}
                {!hideCloseDrawerButton && (
                    <MuiTooltip title="Collapse drawer">
                        <IconButton
                            onClick={handleCloseDrawer}
                            size="small"
                            sx={(theme) => ({
                                ...iconButtonStyles,
                                width: 34,
                                height: 34,
                                borderRadius: 1.5,
                                border: `1px solid ${theme.palette.divider}`,
                            })}
                            aria-label="Collapse drawer"
                        >
                            <ChevronRightRounded fontSize="small" />
                        </IconButton>
                    </MuiTooltip>
                )}
            </Stack>
        </Stack>
    );
};

export const DiagramDrawerHeader = React.memo(DiagramDrawerHeaderComponent);
