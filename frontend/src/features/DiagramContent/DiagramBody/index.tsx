import React from "react";

import { Stack } from "@mui/material";

import { DEFAULT_ZINDEX_DIAGRAM_DRAWER } from "#root/constants/diagram";
import { useDiagramInTransition } from "#root/hooks/diagram";
import { colors } from "#root/theme/PureLightTheme";

import DiagramHeader from "./DiagramHeader";
import DiagramTransitionOverlay from "./DiagramTransitionOverlay";

interface DiagramBodyProps {
    children?: React.ReactNode;
}

const DiagramBodyComponent = ({
    children, //
}: DiagramBodyProps) => {
    const inTransition = useDiagramInTransition();

    return (
        <Stack
            id="DiagramBodyComponent" //
            className="diagram-body-root border border-solid" //
            sx={{
                borderColor: colors.primary.main,
                position: "relative",
            }}
            direction="column"
        >
            <DiagramTransitionOverlay
                inTransition={!!inTransition}
                zIndex={DEFAULT_ZINDEX_DIAGRAM_DRAWER + 2}
            />
            <DiagramHeader />
            <Stack
                id="DiagramBody__Stack__Inner"
                className="diagram-body__inner"
                direction="row" //
            >
                {children}
            </Stack>
        </Stack>
    );
};

export default React.memo(DiagramBodyComponent);
