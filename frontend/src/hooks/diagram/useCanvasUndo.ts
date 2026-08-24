import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useRetrieveStage, useSetDiagramCanvasHistoryIndex } from "#root/hooks/diagram";
import { CanvasType } from "#root/interfaces/diagram";
import { getDiagramDraftCanvasTypeFromStore } from "#root/stores/projectDiagram/canvas";
import { getDiagramCanvasHistoryIndexFromStore } from "#root/stores/projectDiagram/canvasHistory";

export const useCanvasUndo = () => {
    const setCanvasHistoryIndex = useSetDiagramCanvasHistoryIndex();
    const retrieveStage = useRetrieveStage();
    const instanceId = useDiagramInstanceId();

    return React.useCallback(async () => {
        const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);
        if (selectedCanvasType === CanvasType.data_flow) {
            return;
        }

        const canvasHistoryIndex = getDiagramCanvasHistoryIndexFromStore(instanceId);
        const nextCanvasHistoryIndex = canvasHistoryIndex - 1;
        setCanvasHistoryIndex(nextCanvasHistoryIndex);
        retrieveStage(nextCanvasHistoryIndex);
    }, [instanceId, retrieveStage, setCanvasHistoryIndex]);
};
