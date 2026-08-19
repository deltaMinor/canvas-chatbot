import { Card, styled } from "@mui/material";

export const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.general.borderRadiusSm,
    boxShadow: "none",
    border: `1px solid ${theme.colors.alpha.black[10]}`,
    backgroundColor: theme.palette.background.paper,
    transition: "all 0.2s ease-in-out",
    overflow: "hidden",
    "&:hover": {
        // borderColor: theme.colors.alpha.black[20],
        borderColor: theme.colors.primary.main,
    },
}));
