import React from "react";

import { useInitDiagramInstanceEffect } from "#root/hooks/diagram";
import { DiagramInstanceState } from "#root/redux/projectDiagramFeatureSlice";

interface DiagramInstanceEffectsProps {
    initialState?: Partial<DiagramInstanceState>;
}

const DiagramInstanceEffects = ({ initialState }: DiagramInstanceEffectsProps) => {
    useInitDiagramInstanceEffect({ initialState });

    return null;
};

export default React.memo(DiagramInstanceEffects);
