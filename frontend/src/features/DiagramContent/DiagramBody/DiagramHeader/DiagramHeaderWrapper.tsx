import React from "react";

import { AppBar, Stack, Toolbar } from "@mui/material";

import { colors } from "#root/theme/PureLightTheme";

interface DiagramHeaderWrapperProps {
    children?: React.ReactNode;
}

const DiagramHeaderWrapperComponent = ({ children }: DiagramHeaderWrapperProps) => {
    return (
        <AppBar //
            id="DiagramHeaderWrapperComponent"
            className="relative z-1"
            sx={{
                boxShadow: colors.shadows.cardSm,
            }}
        >
            <Toolbar>
                <Stack
                    direction="row" //
                    className="h-full w-full p-[2px]"
                >
                    {children}
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default React.memo(DiagramHeaderWrapperComponent);
