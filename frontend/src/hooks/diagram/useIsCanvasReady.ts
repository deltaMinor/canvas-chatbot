import React from "react";

import { useDiagramDraftCanvasId, useDiagramDraftCanvasType } from "#root/hooks/diagram";

export const useIsCanvasReady = () => {
    const selectedCanvasId = useDiagramDraftCanvasId();
    const selectedCanvasType = useDiagramDraftCanvasType();

    return React.useMemo(() => {
        return !!selectedCanvasId && !!selectedCanvasType;
    }, [selectedCanvasId, selectedCanvasType]);
};

export default useIsCanvasReady;
