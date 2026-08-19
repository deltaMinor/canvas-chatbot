import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { Box, styled } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const ExpandButtonContainer = styled(Box)(({ theme }) => ({
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: theme.zIndex.drawer + 1,
}));

export const ExpandButton = styled(Box)(({ theme }) => {
    return {
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.primary.light, 0.08)} 100%)`,
        borderRadius: "0 20px 20px 0",
        border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
        borderLeft: "none",
        boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, 0.14)}`,
        width: "28px",
        minHeight: "64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing(0.75, 0.25),
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        gap: theme.spacing(0.15),
        "&:hover": {
            background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.primary.light, 0.14)} 100%)`,
            boxShadow: `0 16px 34px ${alpha(theme.palette.primary.main, 0.2)}`,
            transform: "translateX(3px)",
            borderColor: theme.palette.primary.main,
            "& .expand-icon": {
                color: theme.palette.primary.main,
                transform: "rotate(180deg) translateX(-1px)",
            },
            "& .expand-grip": {
                color: alpha(theme.palette.primary.main, 0.65),
            },
        },
        "&:active": {
            transform: "translateX(2px)",
            boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.14)}`,
        },
        "&:disabled": {
            opacity: 0.4,
            cursor: "not-allowed",
            "&:hover": {
                transform: "none",
                boxShadow: `0 10px 24px ${alpha(theme.palette.common.black, 0.12)}`,
                borderColor: alpha(theme.palette.primary.main, 0.16),
                "& .expand-icon": {
                    color: theme.palette.text.disabled,
                    transform: "rotate(180deg)",
                },
                "& .expand-grip": {
                    color: alpha(theme.palette.text.disabled, 0.75),
                },
            },
        },
    };
});

export const ExpandIcon = styled(ChevronRightRoundedIcon)(({ theme }) => ({
    fontSize: "1.15rem",
    color: alpha(theme.palette.text.primary, 0.8),
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    flexShrink: 0,
    transform: "rotate(180deg)",
}));
