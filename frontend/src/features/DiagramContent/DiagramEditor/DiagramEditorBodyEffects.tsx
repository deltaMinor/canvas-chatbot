import React from "react";

import {
    useDiagramCanvasHistorySyncEffect,
    useDiagramCapabilitiesSyncEffect,
    useDiagramDeselectOnDraftCanvasChangeEffect,
    useDiagramInitDraftCanvasIdEffect,
    useDiagramNodeEdgeMappingSyncEffect,
    useDiagramResizeObserverEffect,
    useDiagramSelectionChangeSync,
    useDiagramSetupFileSelectionEffect,
    useDiagramViewDraftCanvasEffect,
    useDiagramViewSyncEffect,
    useInitDiagramJoyrideEffect,
} from "#root/hooks/diagram";

const DiagramEditorBodyEffects = () => {
    useInitDiagramJoyrideEffect();
    useDiagramCapabilitiesSyncEffect();
    useDiagramDeselectOnDraftCanvasChangeEffect();
    useDiagramInitDraftCanvasIdEffect();
    useDiagramViewDraftCanvasEffect();
    useDiagramSetupFileSelectionEffect();
    useDiagramViewSyncEffect();
    useDiagramNodeEdgeMappingSyncEffect();
    useDiagramResizeObserverEffect();
    useDiagramSelectionChangeSync();
    useDiagramCanvasHistorySyncEffect();

    return null;
};

export default React.memo(DiagramEditorBodyEffects);
