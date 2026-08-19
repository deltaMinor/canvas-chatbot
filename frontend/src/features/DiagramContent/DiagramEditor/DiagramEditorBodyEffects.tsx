import React from "react";

import {
    useDiagramCanvasHistorySyncEffect,
    useDiagramCapabilitiesSyncEffect,
    useDiagramDeselectOnDraftCanvasChangeEffect,
    useDiagramDrawerSyncEffect,
    useDiagramInitDraftCanvasIdEffect,
    useDiagramKeyboardCopyPasteEffect,
    useDiagramKeyboardDeleteEffect,
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
    useDiagramDrawerSyncEffect();
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
    useDiagramKeyboardCopyPasteEffect();
    useDiagramKeyboardDeleteEffect();

    return null;
};

export default React.memo(DiagramEditorBodyEffects);
