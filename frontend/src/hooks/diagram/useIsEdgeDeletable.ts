import React from "react";

import { useDiagramDraftEdge, useDiagramDraftEdgeLoaded } from "#root/hooks/diagram";

import { useIsEdgeEditable } from "./useIsEdgeEditable";

export const useIsEdgeDeletable = () => {
    const draftEdge = useDiagramDraftEdge();
    const draftEdgeLoaded = useDiagramDraftEdgeLoaded();
    const isEdgeEditable = useIsEdgeEditable(draftEdge);

    return React.useMemo(
        () => draftEdgeLoaded && isEdgeEditable && !!draftEdge?.deletable,
        [draftEdge?.deletable, draftEdgeLoaded, isEdgeEditable]
    );
};
