import React from "react";

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { Box, Button, Paper, Typography } from "@mui/material";

interface LoadErrorPageProps {
    title?: string;
    message?: string;
    onRetry?: (() => void) | null;
}

const LoadErrorPageComponent = ({
    title = "Failed to load content",
    message = "Something went wrong while loading this page. Try refreshing and loading it again.",
    onRetry = null,
}: LoadErrorPageProps) => {
    return (
        <Box className="flex h-full min-h-[320px] w-full items-center justify-center p-6">
            <Paper
                className="flex w-full max-w-xl flex-col items-center gap-4 rounded-3xl px-8 py-10 text-center"
                elevation={3}
            >
                <Box className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <ErrorOutlineOutlinedIcon fontSize="large" />
                </Box>
                <Typography
                    variant="h5"
                    fontWeight={700}
                >
                    {title}
                </Typography>
                <Typography color="text.secondary">{message}</Typography>
                <Box className="flex gap-3">
                    {onRetry && (
                        <Button
                            variant="contained"
                            onClick={onRetry}
                        >
                            Retry
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        onClick={() => window.location.reload()}
                    >
                        Refresh page
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default React.memo(LoadErrorPageComponent);
