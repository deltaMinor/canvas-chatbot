import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useSetDiagramCanvasHistory, useSetDiagramCanvasHistoryIndex } from "#root/hooks/diagram";
import { getProjectIdFromStore } from "#root/stores/backendStore";
import { getDiagramDraftCanvasFromStore } from "#root/stores/projectDiagram/canvas";
import {
    getCanvasHistory,
    updateCanvasHistory,
    updateCanvasHistoryIndex,
} from "#root/utils/diagram/diagramCanvasHistoryUtil";

export const useReloadCanvasHistory = () => {
    const instanceId = useDiagramInstanceId();
    const setCanvasHistory = useSetDiagramCanvasHistory();
    const setCanvasHistoryIndex = useSetDiagramCanvasHistoryIndex();

    return React.useCallback(async () => {
        const selectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
        const project_id = getProjectIdFromStore();
        if (!selectedCanvas || !project_id) {
            return;
        }

        const {
            canvas_data_history, //
            canvas_data_history_index,
        } = getCanvasHistory(project_id, selectedCanvas.canvas_id);

        if (!canvas_data_history.length) {
            setCanvasHistory([selectedCanvas]);
            setCanvasHistoryIndex(0);

            updateCanvasHistory({
                instanceId,
                canvas_id: selectedCanvas.canvas_id,
                canvas: [selectedCanvas],
            });
            updateCanvasHistoryIndex({
                instanceId,
                canvas_id: selectedCanvas.canvas_id,
                index: 0,
            });
            return;
        }

        setCanvasHistory(canvas_data_history);
        setCanvasHistoryIndex(canvas_data_history_index);
    }, [instanceId, setCanvasHistory, setCanvasHistoryIndex]);
};
