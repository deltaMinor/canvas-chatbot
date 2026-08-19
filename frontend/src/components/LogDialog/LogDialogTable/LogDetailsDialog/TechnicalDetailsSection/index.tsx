import React from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AccordionDetails, AccordionSummary, Box } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

import MuiAccordion from "#root/components/MuiAccordion";

import AccordionSummaryContent from "./AccordionSummaryContent";
import FieldChangesTreeView from "./FieldChangesTreeView";
import MetadataSection from "./MetadataSection";

const sectionStyles: SxProps<Theme> = {
    mt: 2,
};

const detailsContainerStyles: SxProps<Theme> = {
    pt: 1,
};

const TechnicalDetailsSection = () => {
    return (
        <Box sx={sectionStyles}>
            <MuiAccordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <AccordionSummaryContent />
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={detailsContainerStyles}>
                        <MetadataSection />
                        <FieldChangesTreeView />
                    </Box>
                </AccordionDetails>
            </MuiAccordion>
        </Box>
    );
};

export default React.memo(TechnicalDetailsSection);
