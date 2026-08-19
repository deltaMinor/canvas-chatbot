import { Box, Stack, styled } from "@mui/material";

export const StyledValueBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.25, 1.5),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
        borderColor: theme.palette.primary.main,
        boxShadow: theme.shadows[1],
    },
}));

export const StyledNodeItem = styled(Stack)(({ theme }) => ({
    padding: theme.spacing(0.75, 1),
    borderRadius: theme.shape.borderRadius,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
}));

export const SecondaryNodeContainer = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(3.5),
    paddingLeft: theme.spacing(1),
    borderLeft: `2px solid ${theme.palette.divider}`,
}));
