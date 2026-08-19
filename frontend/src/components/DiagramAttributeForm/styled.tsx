import {
    Accordion,
    AccordionDetails,
    AccordionProps,
    AccordionSummary,
    alpha,
    styled,
} from "@mui/material";

export const AttributeDrawerAccordionRoot = styled((props: AccordionProps) => (
    <Accordion
        disableGutters
        elevation={0}
        square={false}
        {...props}
    />
))(({ theme }) => ({
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    marginBottom: theme.spacing(1.25),
    borderRadius: theme.spacing(1.4),
    border: `1px solid ${alpha(theme.palette.common.black, 0.05)}`,
    backgroundColor: theme.palette.common.white,
    boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.03)}, 0 8px 18px ${alpha(theme.palette.common.black, 0.05)}`,
    overflow: "hidden",
    "&:before": {
        display: "none",
    },
    "&.Mui-expanded": {
        margin: `0 0 ${theme.spacing(1.25)} 0`,
    },
    "&:hover": {
        borderColor: alpha(theme.palette.primary.main, 0.16),
    },
}));

export const AttributeDrawerAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    minHeight: "38px",
    padding: theme.spacing(0, 1.35),
    backgroundColor: alpha(theme.palette.primary.main, 0.028),
    "& .MuiAccordionSummary-content": {
        margin: theme.spacing(0.9, 0),
        minWidth: 0,
        alignItems: "center",
    },
    "& .MuiAccordionSummary-expandIconWrapper": {
        color: theme.palette.primary.main,
        transition: "transform 0.2s ease, color 0.2s ease",
    },
    "&.Mui-expanded": {
        minHeight: "38px",
        borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.04)}`,
        "& .MuiAccordionSummary-expandIconWrapper": {
            color: theme.palette.primary.dark,
        },
    },
    "&.Mui-expanded .MuiAccordionSummary-content": {
        margin: theme.spacing(0.9, 0),
    },
    "& .AttributeDrawerAccordion-dot": {
        backgroundColor: alpha(theme.palette.text.secondary, 0.45),
        transition: "background-color 0.2s ease",
    },
    "&.Mui-expanded .AttributeDrawerAccordion-dot": {
        backgroundColor: theme.palette.primary.main,
    },
}));

export const AttributeDrawerAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: theme.spacing(1.45, 1.55, 1.55),
    backgroundColor: theme.palette.common.white,
}));
