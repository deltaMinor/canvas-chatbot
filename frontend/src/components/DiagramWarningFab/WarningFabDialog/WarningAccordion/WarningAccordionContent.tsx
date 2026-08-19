import { Stack } from "@mui/material";

import { WarningMessage } from "#root/interfaces/diagram";

import WarningAccordionRow from "./WarningAccordionRow";

interface WarningAccordionContentProps {
    warningMessage: WarningMessage;
}

const WarningAccordionContentComponent = ({
    warningMessage, //
}: WarningAccordionContentProps) => {
    const {
        edgeId, //
        nodeId,
        description,
        timestamp,
    } = warningMessage;

    return (
        <Stack
            direction="column"
            spacing={2}
            className="px-2 pb-2"
        >
            {!!edgeId && (
                <WarningAccordionRow //
                    title="Edge ID"
                    body={edgeId || ""}
                />
            )}
            {!!nodeId && (
                <WarningAccordionRow //
                    title="Node ID"
                    body={nodeId || ""}
                />
            )}
            {!!description && (
                <WarningAccordionRow //
                    title="Description"
                    body={description || ""}
                />
            )}
            {!!timestamp && (
                <WarningAccordionRow //
                    title="Timestamp"
                    body={timestamp || ""}
                />
            )}
        </Stack>
    );
};

export default WarningAccordionContentComponent;
