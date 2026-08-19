import {
    Accordion,
    AccordionDetails,
    AccordionProps,
    AccordionSummary,
    styled,
} from "@mui/material";

export const CustomAccordion = styled((props: AccordionProps) => (
    <Accordion
        disableGutters
        elevation={0}
        square
        {...props}
    />
))(({ theme }) => ({
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    marginBottom: theme.spacing(1),
    backgroundColor: "transparent",
    border: "none",
    borderBottom: `1px solid ${theme.palette.divider}`,
    transition: "all 0.2s ease-in-out",
    "&:before": {
        display: "none",
    },
    "&.Mui-expanded": {
        minHeight: "auto",
        margin: `0 0 ${theme.spacing(1)} 0`,
    },
    "&:not(.Mui-expanded)": {
        height: "40px",
        minHeight: "40px",
    },
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
}));

export const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    minHeight: "40px",
    height: "40px",
    padding: `0 ${theme.spacing(1.5)}`,
    backgroundColor: "transparent",
    transition: "all 0.2s ease-in-out",
    "&.Mui-expanded": {
        minHeight: "40px",
        backgroundColor: theme.palette.action.selected,
    },
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
    "& .MuiAccordionSummary-content": {
        margin: 0,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
    },
    "& .MuiAccordionSummary-expandIconWrapper": {
        transition: "transform 0.2s ease-in-out",
        color: theme.palette.text.secondary,
    },
    "&.Mui-expanded .MuiAccordionSummary-expandIconWrapper": {
        transform: "rotate(180deg)",
    },
}));

export const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: theme.spacing(1, 0.5, 3),
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    backgroundColor: theme.palette.background.paper,
}));
