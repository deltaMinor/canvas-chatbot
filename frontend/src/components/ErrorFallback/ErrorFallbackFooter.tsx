import React from "react";
import { useSelector } from "react-redux";

import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import MuiButton from "#root/components/MuiButton";
import { RootState } from "#root/redux/store";

interface ErrorFallbackFooterProps {}

const ErrorFallbackFooterComponent = (_props: ErrorFallbackFooterProps) => {
    const secondsLeft = useSelector<RootState>((state) => state?.app?.secondsLeft) as number;

    const handleClickRefresh = React.useCallback(() => {
        window.location.reload();
    }, []);

    return (
        <Box className="py-1">
            <Stack
                direction="column"
                sx={{
                    justifyContent: "center",
                    alignItems: "center",
                }}
                spacing={1}
            >
                <MuiButton //
                    onClick={handleClickRefresh}
                    variant="contained"
                >
                    Refresh Now
                </MuiButton>
                <Stack
                    direction="row"
                    sx={{
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    spacing={1}
                >
                    <CircularProgress size="14px" />
                    <Typography //
                        variant="subtitle1"
                    >
                        Refreshing in {secondsLeft}s
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    );
};

export default React.memo(ErrorFallbackFooterComponent);
