import React from "react";

import { enqueueSnackbar } from "notistack";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useArchitectureCanvas, useHandleSetProcessedNodes } from "#root/hooks/diagram";
import { getProjectDiagramFromStore } from "#root/stores/backendStore";
import { getDraftCanvasIdFromStore } from "#root/stores/projectDiagram/backend";
import { updateProjectDiagram } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { getArchitectureCanvas } from "#root/utils/diagram/backendDiagramUtil";
import { updateDataFlowCanvases } from "#root/utils/userStoryDrawerUtil";

export const useUpdateDataFlowNodePosition = () => {
    const handleSetProcessedNodes = useHandleSetProcessedNodes();
    const architectureCanvasFromHook = useArchitectureCanvas();
    const instanceId = useDiagramInstanceId();

    return React.useCallback(async () => {
        try {
            const projectDiagram = getProjectDiagramFromStore();
            const architectureCanvas =
                architectureCanvasFromHook ?? getArchitectureCanvas(projectDiagram);
            const draftCanvasId = getDraftCanvasIdFromStore(instanceId);

            if (!projectDiagram || !architectureCanvas || !architectureCanvas.nodes.length) {
                return;
            }

            const nextCanvasList = updateDataFlowCanvases(
                projectDiagram.canvas,
                architectureCanvas
            );
            await updateProjectDiagram({
                canvas: nextCanvasList,
            });

            const nextSelectedCanvas = nextCanvasList.find((c) => c.canvas_id === draftCanvasId);
            if (!nextSelectedCanvas) {
                return;
            }

            handleSetProcessedNodes({
                canvasNodes: nextSelectedCanvas.nodes,
                funcRef: "useUpdateDataFlowNodePosition",
            });
        } catch (error) {
            enqueueSnackbar(`Failed to update dataflow node positions. ${error}`, {
                variant: "error",
            });
        }
    }, [architectureCanvasFromHook, handleSetProcessedNodes, instanceId]);
};
