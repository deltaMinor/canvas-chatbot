import React from "react";

import {
    useDiagramWarningListEffect,
    useDiagramWarningListMappingEffect,
} from "#root/hooks/diagram";

const DiagramWarningFabEffects = () => {
    useDiagramWarningListMappingEffect();
    useDiagramWarningListEffect();

    return null;
};

export default React.memo(DiagramWarningFabEffects);
