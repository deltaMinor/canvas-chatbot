import React from "react";

import { useDiagramViewActiveSectionEffect, useJoyrideTransitionEffect } from "#root/hooks/diagram";

interface DiagramTransitionEffectsProps {}

const DiagramTransitionEffectsComponent = (_props: DiagramTransitionEffectsProps) => {
    useDiagramViewActiveSectionEffect();
    useJoyrideTransitionEffect();

    return null;
};

export default React.memo(DiagramTransitionEffectsComponent);
