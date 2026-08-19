import { TextField, styled } from "@mui/material";

import { colors } from "#root/theme/PureLightTheme";

export const StyledTextField = styled(TextField)(() => ({
    backgroundColor: "#fff",
    "& .MuiInputLabel-root": {
        color: colors.alpha.black[70],
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: colors.primary.main,
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
        backgroundColor: "#fff",
        paddingLeft: "6px",
        paddingRight: "6px",
        borderRadius: "4px",
        transform: "translate(12px, -9px) scale(0.75)",
    },
    "& .MuiInputBase-root": {
        borderRadius: "4.5px",
        paddingRight: "9px",
    },
    "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.primary.main,
    },
    "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderLeftWidth: "4.5px",
        borderColor: colors.primary.main,
    },
    "& .MuiInputBase-root.Mui-disabled": {
        backgroundColor: colors.alpha.black[5],
    },
    "& .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.alpha.black[20],
    },
    "& .MuiInputAdornment-root": {
        height: "100%",
        paddingRight: 0,
    },
}));
