import { type ReactNode } from "react";

import {
    Box,
    CircularProgress,
    Pagination,
    PaginationItem,
    Stack,
    Typography,
} from "@mui/material";
import { type PaginationProps } from "@mui/material/Pagination";
import { alpha } from "@mui/material/styles";

interface MuiPaginationProps {
    count: number;
    page: number;
    onChange: NonNullable<PaginationProps["onChange"]>;
    boundaryCount?: number;
    children?: ReactNode;
    disabled?: boolean;
    from?: number;
    loading?: boolean;
    showFirstButton?: boolean;
    showLastButton?: boolean;
    siblingCount?: number;
    to?: number;
    total?: number;
}

const MuiPagination = ({
    boundaryCount = 1,
    children,
    count,
    disabled = false,
    from,
    loading = false,
    onChange,
    page,
    showFirstButton = true,
    showLastButton = true,
    siblingCount = 1,
    to,
    total,
}: MuiPaginationProps) => {
    const hasRange = from !== undefined && to !== undefined && total !== undefined;

    return (
        <Stack
            direction="column"
            spacing={1.5}
        >
            <Box
                sx={(theme) => ({
                    minHeight: 64,
                    position: "relative",
                    "&::after": {
                        bgcolor: alpha(theme.palette.background.paper, 0.62),
                        content: '""',
                        inset: 0,
                        opacity: loading ? 1 : 0,
                        pointerEvents: loading ? "auto" : "none",
                        position: "absolute",
                        transition: theme.transitions.create("opacity", {
                            duration: theme.transitions.duration.shortest,
                        }),
                        zIndex: 1,
                    },
                })}
            >
                <Box>{children}</Box>
                {loading && (
                    <Box
                        sx={(theme) => ({
                            alignItems: "center",
                            backdropFilter: "blur(8px)",
                            bgcolor: alpha(theme.palette.background.paper, 0.78),
                            borderRadius: 999,
                            boxShadow: [
                                `0 12px 30px ${alpha(theme.palette.common.black, 0.08)}`,
                                `inset 0 0 0 1px ${alpha(theme.palette.divider, 0.2)}`,
                            ].join(", "),
                            display: "flex",
                            gap: 1,
                            left: "50%",
                            px: 1.25,
                            py: 0.75,
                            position: "absolute",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 2,
                        })}
                    >
                        <CircularProgress size={16} />
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 600, letterSpacing: 0 }}
                        >
                            Loading
                        </Typography>
                    </Box>
                )}
            </Box>
            <Box
                sx={(theme) => ({
                    alignItems: { xs: "stretch", sm: "center" },
                    bgcolor: alpha(theme.palette.action.hover, 0.32),
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1, sm: 1.5 },
                    justifyContent: "space-between",
                    px: 1,
                    py: 0.875,
                })}
            >
                {hasRange && (
                    <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        sx={{ minHeight: 32 }}
                    >
                        <Box
                            aria-hidden="true"
                            sx={(theme) => ({
                                bgcolor: alpha(theme.palette.primary.main, 0.56),
                                borderRadius: "50%",
                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`,
                                height: 5,
                                width: 5,
                            })}
                        />
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                fontWeight: 600,
                                letterSpacing: 0,
                            }}
                        >
                            {from}-{to} of {total}
                        </Typography>
                    </Stack>
                )}
                <Box
                    sx={(theme) => ({
                        alignSelf: { xs: "stretch", sm: "center" },
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 2,
                        boxShadow: [
                            `0 8px 20px ${alpha(theme.palette.common.black, 0.035)}`,
                            `0 0 0 1px ${alpha(theme.palette.divider, 0.16)}`,
                        ].join(", "),
                        display: "flex",
                        justifyContent: { xs: "center", sm: "center" },
                        px: 0.625,
                        py: 0.5,
                    })}
                >
                    <Pagination
                        count={count}
                        page={page}
                        onChange={onChange}
                        size="small"
                        disabled={disabled || loading}
                        boundaryCount={boundaryCount}
                        siblingCount={siblingCount}
                        showFirstButton={showFirstButton}
                        showLastButton={showLastButton}
                        renderItem={({
                            color: _color,
                            shape: _shape,
                            size: _size,
                            variant: _variant,
                            ...item
                        }) => (
                            <PaginationItem
                                {...item}
                                color="standard"
                                shape="rounded"
                                size="small"
                                variant="text"
                                sx={(theme) => ({
                                    border: 0,
                                    borderRadius: 999,
                                    color: "text.secondary",
                                    fontWeight: 700,
                                    height: 28,
                                    minWidth: 28,
                                    mx: 0.125,
                                    transition:
                                        "background-color 120ms ease, color 120ms ease, box-shadow 120ms ease, transform 120ms ease",
                                    "&.Mui-selected": {
                                        bgcolor: alpha(theme.palette.primary.main, 0.92),
                                        boxShadow: [
                                            `0 6px 14px ${alpha(theme.palette.primary.main, 0.16)}`,
                                            `inset 0 0 0 1px ${alpha(
                                                theme.palette.primary.contrastText,
                                                0.1
                                            )}`,
                                        ].join(", "),
                                        color: "primary.contrastText",
                                        "&:hover": {
                                            bgcolor: "primary.main",
                                        },
                                    },
                                    "&:hover": {
                                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                                        transform: "translateY(-1px)",
                                    },
                                    "&.Mui-disabled": {
                                        opacity: 0.34,
                                    },
                                })}
                            />
                        )}
                        sx={{
                            "& .MuiPagination-ul": {
                                flexWrap: "nowrap",
                            },
                        }}
                    />
                </Box>
            </Box>
        </Stack>
    );
};

export default MuiPagination;
