import React from "react";

import { useReactFlow } from "@xyflow/react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useAppendCanvasHistory } from "#root/hooks/diagram";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { updateCanvas } from "#root/stores/projectDiagramFeaturePersistenceStore";

export const usePersistCanvas = () => {
    const instanceId = useDiagramInstanceId();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();
    const appendCanvasHistory = useAppendCanvasHistory();

    return React.useCallback(
        async ({
            canvasNodes,
            canvasEdges,
            draftCanvasId,
        }: {
            canvasNodes?: DiagramNode[];
            canvasEdges?: DiagramEdge[];
            draftCanvasId?: string;
        }) => {
            const nextSelectedCanvas = await updateCanvas({
                instanceId,
                ...(canvasNodes && { canvasNodes }),
                ...(canvasEdges && { canvasEdges }),
                ...(draftCanvasId && { draftCanvasId }),
                viewport: reactFlow.getViewport(),
            });
            if (nextSelectedCanvas) {
                appendCanvasHistory(nextSelectedCanvas);
            }
            return nextSelectedCanvas;
        },
        [appendCanvasHistory, instanceId, reactFlow]
    );
};
