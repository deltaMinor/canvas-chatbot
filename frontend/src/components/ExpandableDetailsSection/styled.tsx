import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledToggleButton = styled(Button)(({ theme }) => ({
    alignSelf: "flex-start",
    minHeight: 28,
    padding: 0,
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.84rem",
    letterSpacing: "normal",
    color: theme.palette.text.secondary,
    backgroundColor: "transparent",
    "&:hover": {
        backgroundColor: "transparent",
        color: theme.colors.primary.dark,
    },
    "& .MuiButton-endIcon": {
        marginLeft: 6,
    },
}));
