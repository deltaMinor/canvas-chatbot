import { MenuItem, Select, alpha, styled } from "@mui/material";

import { colors } from "#root/theme/PureLightTheme";

export const StyledMenuItem = styled(MenuItem)(() => ({
    "&.MuiMenuItem-root": {
        borderRadius: "6px",
        margin: "2px 8px",
        padding: "10px 16px",
        minHeight: "40px",
        transition: "all 0.2s ease-in-out",
        fontSize: "14px",
    },
    "&.MuiMenuItem-root:hover": {
        backgroundColor: alpha(colors.primary.main, 0.1),
        color: colors.primary.main,
        transform: "translateX(2px)",
    },
    "&.MuiMenuItem-root.Mui-selected": {
        backgroundColor: alpha(colors.primary.main, 0.15),
        color: colors.primary.main,
        fontWeight: 500,
        "&:hover": {
            backgroundColor: alpha(colors.primary.main, 0.2),
        },
        "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "3px",
            height: "60%",
            backgroundColor: colors.primary.main,
            borderRadius: "0 2px 2px 0",
        },
    },
    "&.MuiMenuItem-root.Mui-disabled": {
        opacity: 0.5,
        fontStyle: "italic",
    },
}));

export const StyledSelect = styled(Select)(() => ({
    "&.MuiInputBase-root": {
        borderRadius: "4.5px",
    },
}));
