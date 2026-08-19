import React from "react";

import { useDeselectAllNodesAndEdges, useDiagramDraftCanvasId } from "#root/hooks/diagram";

export const useDiagramDeselectOnDraftCanvasChangeEffect = () => {
    const draftCanvasId = useDiagramDraftCanvasId();
    const deselectAllNodesAndEdges = useDeselectAllNodesAndEdges();
    const previousDraftCanvasIdRef = React.useRef<string | null>(null);

    React.useEffect(() => {
        if (
            previousDraftCanvasIdRef.current !== null &&
            previousDraftCanvasIdRef.current !== draftCanvasId
        ) {
            deselectAllNodesAndEdges();
        }

        previousDraftCanvasIdRef.current = draftCanvasId;
    }, [deselectAllNodesAndEdges, draftCanvasId]);
};
