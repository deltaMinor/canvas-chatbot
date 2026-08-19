import React from "react";

import {
    useDiagramNodeDrawerEdgeAttributesSyncEffect,
    useDiagramNodeDrawerFocusEffect,
    useDiagramNodeDrawerResetDirtyEffect,
} from "#root/hooks/diagram";

const DiagramNodeDrawerEffects = () => {
    useDiagramNodeDrawerResetDirtyEffect();
    useDiagramNodeDrawerEdgeAttributesSyncEffect();
    useDiagramNodeDrawerFocusEffect();

    return null;
};

export default React.memo(DiagramNodeDrawerEffects);
