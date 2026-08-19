import React from "react";

import {
    useDiagramEdgeDrawerEdgeAttributesSyncEffect,
    useDiagramEdgeDrawerFocusEffect,
    useDiagramEdgeDrawerResetDirtyEffect,
} from "#root/hooks/diagram";

const DiagramEdgeDrawerEffects = () => {
    useDiagramEdgeDrawerResetDirtyEffect();
    useDiagramEdgeDrawerEdgeAttributesSyncEffect();
    useDiagramEdgeDrawerFocusEffect();

    return null;
};

export default React.memo(DiagramEdgeDrawerEffects);
