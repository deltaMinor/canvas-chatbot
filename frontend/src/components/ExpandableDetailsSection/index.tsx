import React from "react";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { Collapse, Stack } from "@mui/material";

import { StyledToggleButton } from "./styled";

interface ExpandableDetailsSectionProps {
    children: React.ReactNode;
    collapsedLabel?: string;
    expandedLabel?: string;
    defaultExpanded?: boolean;
    contentSpacing?: number;
}

const ExpandableDetailsSection = ({
    children,
    collapsedLabel = "Show details",
    expandedLabel = "Hide details",
    defaultExpanded = false,
    contentSpacing = 1.05,
}: ExpandableDetailsSectionProps) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded);

    const toggleExpanded = React.useCallback(() => {
        setExpanded((previousValue) => !previousValue);
    }, []);

    return (
        <Stack spacing={0.9}>
            <Collapse
                in={expanded}
                timeout={220}
            >
                <Stack spacing={contentSpacing}>{children}</Stack>
            </Collapse>
            <StyledToggleButton
                onClick={toggleExpanded}
                endIcon={
                    expanded ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />
                }
            >
                {expanded ? expandedLabel : collapsedLabel}
            </StyledToggleButton>
        </Stack>
    );
};

export default React.memo(ExpandableDetailsSection);
