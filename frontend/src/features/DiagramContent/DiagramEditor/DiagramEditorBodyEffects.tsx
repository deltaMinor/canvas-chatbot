import React from "react";

import {
    useDiagramCanvasHistorySyncEffect,
    useDiagramCapabilitiesSyncEffect,
    useDiagramDeselectOnDraftCanvasChangeEffect,
    useDiagramInitDraftCanvasIdEffect,
    useDiagramLockedCanvasNoticeEffect,
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
    useDiagramLockedCanvasNoticeEffect();
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
