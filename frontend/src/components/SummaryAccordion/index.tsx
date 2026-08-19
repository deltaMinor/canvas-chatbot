import React from "react";

import { Grid } from "@mui/material";

import ResourceAccordion from "#root/components/ResourceAccordion";
import UserStoryStatementv2 from "#root/components/UserStoryStatementv2";
import { useDiagramDraftCanvasRef } from "#root/hooks/diagram";

import SummaryGridItem from "./SummaryGridItem";
import SummaryNodeItem from "./SummaryNodeItem";
import { getStringMapping } from "./helper";

type SummaryAccordionCompound = React.MemoExoticComponent<React.FC> & {
    GridItem: typeof SummaryGridItem;
    NodeItem: typeof SummaryNodeItem;
};

const SummaryAccordionComponent: React.FC = () => {
    const draftCanvasRef = useDiagramDraftCanvasRef();

    const card_ref = React.useMemo(
        () => draftCanvasRef?.card_ref || {},
        [draftCanvasRef?.card_ref]
    );
    const stringMapping = React.useMemo(() => getStringMapping(card_ref), [card_ref]);

    return (
        <ResourceAccordion
            title="Overview"
            defaultExpanded={true}
            sx={{
                borderTop: "none",
            }}
        >
            <Grid
                container
                spacing={1.5}
            >
                <SummaryGridItem
                    label="Title"
                    value={card_ref?.card_title || "-"}
                />
                <SummaryGridItem
                    label="Feature"
                    value={card_ref?.card_feature?.label || "-"}
                />
                <SummaryGridItem label="User Story">
                    <UserStoryStatementv2 stringMapping={stringMapping} />
                </SummaryGridItem>
            </Grid>
        </ResourceAccordion>
    );
};

const SummaryAccordion = Object.assign(React.memo(SummaryAccordionComponent), {
    GridItem: SummaryGridItem,
    NodeItem: SummaryNodeItem,
}) as SummaryAccordionCompound;

export { defaultUserStoryStatementValues, getParsedDFNodeList, getStringMapping } from "./helper";
export default SummaryAccordion;
