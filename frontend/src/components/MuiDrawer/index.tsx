import React from "react";

import CloseIcon from "@mui/icons-material/Close";
import {
    Box,
    BoxProps,
    Drawer,
    DrawerProps,
    IconButton,
    IconButtonProps,
    Stack,
    StackProps,
    Typography,
    TypographyProps,
} from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { clsx } from "clsx";

export interface MuiDrawerProps extends DrawerProps {
    useRelativePaperPosition?: boolean;
    unsetPaperZIndex?: boolean;
}

const getSxList = (sx: SxProps<Theme> | undefined) => (Array.isArray(sx) ? sx : sx ? [sx] : []);

const MuiDrawerRoot = ({
    children, //
    className: props__className = "",
    sx,
    useRelativePaperPosition = false,
    unsetPaperZIndex = false,
    ...props
}: MuiDrawerProps) => {
    const drawerSx = [
        {
            "& .MuiDrawer-paper": {
                maxWidth: "100vw",
                position: useRelativePaperPosition ? "relative" : "fixed",
                width: {
                    xs: "100vw",
                    sm: 560,
                    md: "50vw",
                },
                "& > *": {
                    boxSizing: "border-box",
                    width: "100%",
                },
            },
        },
        ...(unsetPaperZIndex
            ? [
                  {
                      "& .MuiDrawer-paper": {
                          zIndex: "unset",
                      },
                  },
              ]
            : []),
        ...getSxList(sx),
    ];

    return (
        <Drawer
            className={clsx("components-mui-drawer__styled-drawer", props__className)}
            sx={drawerSx}
            {...props}
        >
            {children}
        </Drawer>
    );
};

interface MuiDrawerHeaderProps extends Omit<StackProps, "onClose" | "title"> {
    closeButtonProps?: IconButtonProps;
    onClose?: IconButtonProps["onClick"];
    title: React.ReactNode;
    titleTypographyProps?: TypographyProps;
}

const MuiDrawerHeader = ({
    children,
    closeButtonProps,
    onClose,
    sx,
    title,
    titleTypographyProps,
    ...props
}: MuiDrawerHeaderProps) => (
    <Stack
        direction="row"
        sx={[
            {
                alignItems: "center",
                justifyContent: "space-between",
            },
            ...getSxList(sx),
        ]}
        {...props}
    >
        <Typography
            variant="h6"
            {...titleTypographyProps}
        >
            {title}
        </Typography>
        <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center" }}
        >
            {children}
            {!!onClose && (
                <IconButton
                    size="small"
                    {...closeButtonProps}
                    onClick={onClose}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            )}
        </Stack>
    </Stack>
);

const MuiDrawerBody = ({ children, sx, ...props }: BoxProps) => (
    <Box
        sx={[
            {
                height: "100%",
                overflowY: "auto",
                p: 2,
                width: "100%",
            },
            ...getSxList(sx),
        ]}
        {...props}
    >
        {children}
    </Box>
);

const Root = React.memo(MuiDrawerRoot);

const MuiDrawer = Object.assign(Root, {
    Body: React.memo(MuiDrawerBody),
    Header: React.memo(MuiDrawerHeader),
    Root,
});

export default MuiDrawer;
