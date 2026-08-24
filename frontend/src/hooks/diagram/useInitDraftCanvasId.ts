import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { CanvasType } from "#root/interfaces/diagram";
import {
    getBackendProjectDiagramFromStore,
    getDraftCanvasIdFromStore,
} from "#root/stores/projectDiagram/backend";
import { setDiagramDraftCanvasId } from "#root/stores/projectDiagram/canvas";
import { getInitCanvasId } from "#root/utils/diagram/diagramCanvasUtil";

export const useInitDraftCanvasId = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(() => {
        const projectDiagram = getBackendProjectDiagramFromStore();
        const canvas = projectDiagram.canvas ?? [];
        if (!canvas.length) {
            return;
        }

        const draftCanvasId = getDraftCanvasIdFromStore(instanceId);

        const canvasExists = canvas.some((item) => item.canvas_id === draftCanvasId);

        if (draftCanvasId && canvasExists) {
            return;
        }

        const initialCanvas = canvas.find((item) => item.canvas_type === CanvasType.architecture);

        const nextDraftCanvasId = initialCanvas?.canvas_id ?? getInitCanvasId({ canvas });

        setDiagramDraftCanvasId(nextDraftCanvasId, instanceId);
    }, [instanceId]);
};
