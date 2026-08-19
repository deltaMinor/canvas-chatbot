import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { DiagramCanvas } from "#root/interfaces/diagram";
import { getProjectIdFromStore } from "#root/stores/backendStore";
import { appendCanvasHistory as appendCanvasHistoryUtil } from "#root/utils/diagram/diagramCanvasHistoryUtil";

export const useAppendCanvasHistory = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(
        (selectedCanvas: DiagramCanvas) => {
            const project_id = getProjectIdFromStore();
            if (!project_id) return;

            appendCanvasHistoryUtil({
                instanceId,
                project_id,
                selectedCanvas,
            });
        },
        [instanceId]
    );
};
