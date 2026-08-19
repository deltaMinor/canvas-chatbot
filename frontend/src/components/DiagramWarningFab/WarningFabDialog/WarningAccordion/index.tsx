import React from "react";

import { Accordion, Box } from "@mui/material";

import { WarningMessage } from "#root/interfaces/diagram";

import WarningAccordionContent from "./WarningAccordionContent";
import WarningAccordionSummary from "./WarningAccordionSummary";

interface WarningAccordionProps {
    warningMessage: WarningMessage;
    warningList: WarningMessage[];
}

const WarningAccordionComponent = ({
    warningMessage, //
    warningList,
}: WarningAccordionProps) => {
    return (
        <Box
            sx={{
                border: "1px dashed", //
                borderColor: "grey.300",
            }}
        >
            <Accordion>
                <WarningAccordionSummary //
                    warningMessage={warningMessage}
                    warningList={warningList}
                />
                <WarningAccordionContent //
                    warningMessage={warningMessage}
                />
            </Accordion>
        </Box>
    );
};

export default React.memo(WarningAccordionComponent);
