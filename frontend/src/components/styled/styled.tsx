import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material";
import Accordion, { AccordionProps } from "@mui/material/Accordion";
import AccordionDetails, { AccordionDetailsProps } from "@mui/material/AccordionDetails";
import AccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary";

export const StyledAccordion = styled((props: AccordionProps) => (
    <Accordion
        disableGutters
        elevation={0}
        square
        {...props} //
    />
))(({ theme }) => ({
    width: "100%",
    border: `1px solid ${theme.palette.divider}`,
    "&:not(:last-child)": {
        borderBottom: 0,
    },
    "&:before": {
        display: "none",
    },
}));

export const StyledAccordionSummary = styled((props: AccordionSummaryProps) => (
    <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        {...props} //
    />
))(() => ({
    backgroundColor: "rgba(0, 0, 0, .05)",
    ".MuiAccordionSummary-content": {
        margin: "0",
    },
}));

export const StyledAccordionDetails = styled((props: AccordionDetailsProps) => (
    <AccordionDetails
        {...props} //
    />
))(({ theme }) => ({
    padding: theme.spacing(1),
    borderTop: "1px solid rgba(0, 0, 0, .125)",
}));
