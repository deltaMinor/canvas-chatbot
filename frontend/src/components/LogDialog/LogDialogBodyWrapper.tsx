import React from "react";

import { DialogContent, Stack } from "@mui/material";

interface LogDialogBodyWrapperProps {
    children?: React.ReactNode;
}

const LogDialogBodyWrapperComponent = ({ children }: LogDialogBodyWrapperProps) => {
    return (
        <DialogContent>
            <Stack
                direction="column"
                sx={{ justifyContent: "center", alignItems: "center" }}
                spacing={2}
                className="w-full"
            >
                <Stack
                    spacing={0.5}
                    sx={{ backgroundColor: "#00000010" }}
                    className="w-full p-1"
                >
                    {children}
                </Stack>
            </Stack>
        </DialogContent>
    );
};

export default React.memo(LogDialogBodyWrapperComponent);
