import React from "react";

import Accordion, { AccordionProps } from "@mui/material/Accordion";

interface MuiAccordionProps {
    children: NonNullable<React.ReactNode>;
    accordionProps?: Partial<AccordionProps>;
}

const MuiAccordionComponent = ({
    children, //
    accordionProps = {} as AccordionProps,
}: MuiAccordionProps) => {
    const { sx: accordionSx, ..._accordionProps } = accordionProps;
    return (
        <Accordion
            square //
            sx={{
                "&.MuiAccordion-root": {
                    boxShadow:
                        "0px 2px 4px -1px rgba(0,0,0,0.06), 0px 4px 6px -1px rgba(0,0,0,0.1)",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    overflow: "hidden",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        boxShadow:
                            "0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -1px rgba(0,0,0,0.06)",
                        borderColor: "primary.light",
                    },
                    "&.Mui-expanded": {
                        boxShadow:
                            "0px 4px 8px -2px rgba(0,0,0,0.12), 0px 2px 4px -1px rgba(0,0,0,0.08)",
                        borderColor: "primary.light",
                        margin: "8px 0",
                    },
                    "&::before": {
                        display: "none",
                    },
                },
                "& .MuiAccordionSummary-root": {
                    minHeight: 56,
                    padding: "0 16px",
                    "&.Mui-expanded": {
                        minHeight: 56,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                    },
                    "&:hover": {
                        backgroundColor: "action.hover",
                    },
                },
                "& .MuiAccordionSummary-content": {
                    width: "100%",
                    margin: "12px 0",
                    "&.Mui-expanded": {
                        margin: "12px 0",
                    },
                },
                "& .MuiAccordionDetails-root": {
                    padding: "16px",
                    backgroundColor: "background.paper",
                },
                "& .MuiAccordionSummary-expandIconWrapper": {
                    transition: "transform 0.2s ease-in-out",
                    "&.Mui-expanded": {
                        transform: "rotate(180deg)",
                    },
                },
                ...accordionSx,
            }}
            {..._accordionProps}
        >
            {children}
        </Accordion>
    );
};

export default React.memo(MuiAccordionComponent);
