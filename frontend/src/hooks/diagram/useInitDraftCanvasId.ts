import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { CanvasType } from "#root/interfaces/diagram";
import { DetailsSectionType } from "#root/interfaces/sidebar";
import {
    getBackendProjectDiagramFromStore,
    getDraftCanvasIdFromStore,
} from "#root/stores/projectDiagram/backend";
import { setDiagramDraftCanvasId } from "#root/stores/projectDiagram/canvas";
import { getRootStateFromStore } from "#root/stores/root";
import { getInitCanvasId } from "#root/utils/diagram/diagramCanvasUtil";

export const useInitDraftCanvasId = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(() => {
        const projectDiagram = getBackendProjectDiagramFromStore();
        const canvas = projectDiagram.canvas ?? [];
        if (!canvas.length) {
            return;
        }

        const activeSection = getRootStateFromStore().layout.activeSection;
        const draftCanvasId = getDraftCanvasIdFromStore(instanceId);
        const isVirtualCanvasId = [CanvasType.summary.toString()].includes(draftCanvasId || "");

        const canvasExists = canvas.some((item) => item.canvas_id === draftCanvasId);

        if (draftCanvasId && (canvasExists || isVirtualCanvasId)) {
            return;
        }

        const initialCanvas = canvas.find((item) =>
            activeSection === DetailsSectionType.VISUALIZER.toString()
                ? item.canvas_type === CanvasType.threat_scenario
                : item.canvas_type === CanvasType.architecture
        );

        const nextDraftCanvasId = initialCanvas?.canvas_id ?? getInitCanvasId({ canvas });

        setDiagramDraftCanvasId(nextDraftCanvasId, instanceId);
    }, [instanceId]);
};
