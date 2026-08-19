import { Button, styled } from "@mui/material";

export const StyledButton = styled(Button)(({ theme }) => ({
    "&.MuiButton-contained.MuiButton-colorPrimary": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    "&.MuiButton-contained.MuiButton-colorPrimary:hover": {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
    },
    "&.MuiButton-contained.MuiButton-colorSecondary": {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText ?? theme.palette.common.white,
    },
    "&.MuiButton-contained.MuiButton-colorSecondary:hover": {
        backgroundColor: theme.palette.secondary.dark,
        color: theme.palette.secondary.contrastText ?? theme.palette.common.white,
    },
    "&.MuiButton-contained.MuiButton-colorError": {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
    },
    "&.MuiButton-contained.MuiButton-colorError:hover": {
        backgroundColor: theme.palette.error.dark,
        color: theme.palette.error.contrastText,
    },
    "&.MuiButton-contained.MuiButton-colorInfo": {
        backgroundColor: theme.palette.info.main,
        color: theme.palette.info.contrastText,
    },
    "&.MuiButton-contained.MuiButton-colorInfo:hover": {
        backgroundColor: theme.palette.info.dark,
        color: theme.palette.info.contrastText,
    },
    "&.MuiButton-contained.MuiButton-colorWarning": {
        backgroundColor: theme.palette.warning.main,
        color: theme.palette.warning.contrastText,
    },
    "&.MuiButton-contained.MuiButton-colorWarning:hover": {
        backgroundColor: theme.palette.warning.dark,
        color: theme.palette.warning.contrastText,
    },
    "&.MuiButton-contained.MuiButton-colorSuccess": {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.success.contrastText,
    },
    "&.MuiButton-contained.MuiButton-colorSuccess:hover": {
        backgroundColor: theme.palette.success.dark,
        color: theme.palette.success.contrastText,
    },
    "&.MuiButton-contained.Mui-disabled": {
        backgroundColor: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
    },
}));
