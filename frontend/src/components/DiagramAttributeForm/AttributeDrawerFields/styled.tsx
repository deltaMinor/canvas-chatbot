import { Button, styled } from "@mui/material";

export const StyledAddButton = styled(Button)(({ theme }) => ({
    width: "100%",
    minHeight: 42,
    borderRadius: 10,
    border: `1px dashed ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.common.white,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "0.72rem",
    fontWeight: 700,
    lineHeight: 1.2,
    justifyContent: "center",
    gap: theme.spacing(0.55),
    "&:hover": {
        borderColor: theme.palette.primary.light,
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.primary.main,
    },
}));
