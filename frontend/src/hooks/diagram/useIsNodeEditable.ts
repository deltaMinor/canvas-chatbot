import React from "react";

import {
    useDiagramDraftCanvasType,
    useDiagramDraftCanvasViewOnly,
    useDiagramDraftNode,
    useDiagramDraftNodeLoaded,
} from "#root/hooks/diagram";
import { DiagramNode } from "#root/interfaces/diagram";

export const useIsNodeEditable = (draftNodeOverride?: DiagramNode | null) => {
    const draftCanvasType = useDiagramDraftCanvasType();
    const draftCanvasViewOnly = useDiagramDraftCanvasViewOnly();
    const draftNode = useDiagramDraftNode();
    const draftNodeLoaded = useDiagramDraftNodeLoaded();
    const nextDraftNode = draftNodeOverride ?? draftNode;

    return React.useMemo(
        () =>
            !draftCanvasViewOnly &&
            draftNodeLoaded &&
            draftCanvasType === nextDraftNode?.data?.type,
        [draftCanvasType, draftCanvasViewOnly, draftNodeLoaded, nextDraftNode?.data?.type]
    );
};
