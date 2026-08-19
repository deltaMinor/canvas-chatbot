import React from "react";

import {
    useDiagramDraftCanvasType,
    useDiagramDraftCanvasViewOnly,
    useDiagramDraftEdge,
    useDiagramDraftEdgeLoaded,
} from "#root/hooks/diagram";
import { DiagramEdge } from "#root/interfaces/diagram";

export const useIsEdgeEditable = (draftEdgeOverride?: DiagramEdge | null) => {
    const draftCanvasType = useDiagramDraftCanvasType();
    const draftCanvasViewOnly = useDiagramDraftCanvasViewOnly();
    const draftEdge = useDiagramDraftEdge();
    const draftEdgeLoaded = useDiagramDraftEdgeLoaded();
    const nextDraftEdge = draftEdgeOverride ?? draftEdge;

    return React.useMemo(
        () =>
            !draftCanvasViewOnly &&
            draftEdgeLoaded &&
            draftCanvasType === nextDraftEdge?.data?.type,
        [draftCanvasType, draftCanvasViewOnly, draftEdgeLoaded, nextDraftEdge?.data?.type]
    );
};
