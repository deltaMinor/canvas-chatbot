import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useDiagramDraftCanvasId, useReloadCanvasHistory } from "#root/hooks/diagram";

export const useDiagramCanvasHistorySyncEffect = () => {
    const instanceId = useDiagramInstanceId();
    const selectedCanvasId = useDiagramDraftCanvasId();
    const reloadCanvasHistory = useReloadCanvasHistory();

    React.useEffect(() => {
        reloadCanvasHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instanceId, selectedCanvasId]);
};
