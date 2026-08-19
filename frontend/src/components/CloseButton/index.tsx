import React from "react";

import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, useTheme } from "@mui/material";

interface CloseButtonProps {
    reveal: boolean;
    handleClick: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const CloseButtonComponent = ({
    reveal, //
    handleClick,
}: CloseButtonProps) => {
    const theme = useTheme();
    return (
        <Box
            style={{
                display: reveal ? "flex" : "none",
                justifyContent: "flex-end",
            }}
        >
            <IconButton
                size="small"
                style={{
                    borderRadius: theme.spacing(0.5),
                    boxShadow:
                        "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
                }}
                onClick={handleClick}
            >
                <CloseIcon />
            </IconButton>
        </Box>
    );
};

export default React.memo(CloseButtonComponent);
