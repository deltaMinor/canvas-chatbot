import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useRetrieveStage, useSetDiagramCanvasHistoryIndex } from "#root/hooks/diagram";
import { getDiagramCanvasHistoryIndexFromStore } from "#root/stores/projectDiagram/canvasHistory";

export const useCanvasUndo = () => {
    const setCanvasHistoryIndex = useSetDiagramCanvasHistoryIndex();
    const retrieveStage = useRetrieveStage();
    const instanceId = useDiagramInstanceId();

    return React.useCallback(async () => {
        const canvasHistoryIndex = getDiagramCanvasHistoryIndexFromStore(instanceId);
        const nextCanvasHistoryIndex = canvasHistoryIndex - 1;
        setCanvasHistoryIndex(nextCanvasHistoryIndex);
        retrieveStage(nextCanvasHistoryIndex);
    }, [instanceId, retrieveStage, setCanvasHistoryIndex]);
};
