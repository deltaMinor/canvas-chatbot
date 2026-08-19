import React from "react";
import { FallbackProps } from "react-error-boundary";
import { useSelector } from "react-redux";

import { Box, Grid, Stack, Typography, alpha } from "@mui/material";
import { getReasonPhrase } from "http-status-codes";

import { ErrorDetails } from "#root/interfaces/error";
import { RootState } from "#root/redux/store";

import ErrorFallbackFooter from "./ErrorFallbackFooter";
import code_400 from "./media/code_400.png";
import code_401 from "./media/code_401.png";
import code_403 from "./media/code_403.png";
import code_404 from "./media/code_404.png";
import code_405 from "./media/code_405.png";
import code_408 from "./media/code_408.png";
import code_409 from "./media/code_409.png";
import code_429 from "./media/code_429.png";
import code_500 from "./media/code_500.png";
import code_502 from "./media/code_502.png";
import code_503 from "./media/code_503.png";
import code_504 from "./media/code_504.png";
import code_generic from "./media/generic.png";

const DEFAULT_WIDTH = "300px";
const DEFAULT_HEIGHT = "300px";

const image_src_mapping = {
    400: code_400, //
    401: code_401, //
    403: code_403, //
    404: code_404, //
    405: code_405, //
    408: code_408, //
    409: code_409, //
    429: code_429, //
    500: code_500, //
    502: code_502, //
    503: code_503, //
    504: code_504, //
};

interface ErrorFallbackBodyProps extends FallbackProps {}

const ErrorFallbackBodyComponent = ({
    error, //
    // resetErrorBoundary,
}: ErrorFallbackBodyProps) => {
    const errorDetails = useSelector<RootState>(
        (state) => state?.app?.errorDetails
    ) as ErrorDetails[];
    const error_message = error instanceof Error ? error.message : "Unknown error";

    const code = errorDetails?.[0]?.code ?? 0;
    const src = image_src_mapping?.[code as keyof typeof image_src_mapping] || code_generic;

    return (
        <Stack
            spacing={1}
            sx={{
                justifyContent: "center",
                alignItems: "center",
            }}
            className="w-full"
        >
            <Grid
                maxWidth="md"
                container
                direction="row"
                sx={{
                    backgroundColor: "#fff",
                    justifyContent: "center",
                    alignItems: "stretch",
                }}
            >
                {!!errorDetails?.length && (
                    <Grid
                        size="grow" //
                        minWidth="400px"
                    >
                        <Box className="w-full p-1">
                            <Stack spacing={1}>
                                {errorDetails?.map((errorDetailsItem, eIdx) => {
                                    const code = errorDetailsItem?.code ?? 0;
                                    const short_msg = !!code ? getReasonPhrase(code) : "";
                                    return (
                                        <Box
                                            key={eIdx}
                                            className="w-full px-2 pt-2 pb-1"
                                            style={{
                                                backgroundColor: alpha("#223354", 0.05),
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                gutterBottom
                                            >
                                                {`Code: ${code || "None"} `}
                                                {!!short_msg && `(${short_msg})`}
                                            </Typography>
                                            <Box
                                                style={{
                                                    backgroundColor: "#fff",
                                                    maxHeight: "250px",
                                                }}
                                                className="max-h-[250px] overflow-y-auto px-1 py-0.5"
                                            >
                                                <Typography gutterBottom>
                                                    {error_message || "None"}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Box>
                    </Grid>
                )}
                {!!src && (
                    <Grid size="auto">
                        <Box //
                            className="p-1"
                        >
                            <img
                                width={DEFAULT_WIDTH}
                                height={DEFAULT_HEIGHT}
                                src={src}
                            />
                        </Box>
                    </Grid>
                )}
            </Grid>
            <ErrorFallbackFooter />
        </Stack>
    );
};

export default React.memo(ErrorFallbackBodyComponent);
