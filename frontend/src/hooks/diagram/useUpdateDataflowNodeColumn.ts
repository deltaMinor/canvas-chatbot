import React from "react";

import { enqueueSnackbar } from "notistack";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useAppendCanvasHistory, useHandleSetProcessedNodes } from "#root/hooks/diagram";
import { CanvasColumn, CanvasType } from "#root/interfaces/diagram";
import { getProjectDiagramFromStore } from "#root/stores/backendStore";
import { getBackendArchitectureCanvasFromStore } from "#root/stores/projectDiagram/backend";
import { getDiagramDraftCanvasFromStore } from "#root/stores/projectDiagram/canvas";
import { updateCanvas } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { getUpdatedDFCanvas } from "#root/utils/diagram/diagramCanvasUtil";
import {
    positionDataFlowCanvasNodes,
    updateNodesCanvasColumn,
} from "#root/utils/userStoryDrawerUtil";

export const useUpdateDataflowNodeColumn = () => {
    const instanceId = useDiagramInstanceId();
    const appendCanvasHistory = useAppendCanvasHistory();
    const handleSetProcessedNodes = useHandleSetProcessedNodes();

    return React.useCallback(
        async (
            nodeIds: string[], //
            canvasColumn: CanvasColumn
        ) => {
            try {
                const selectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
                const projectDiagram = getProjectDiagramFromStore();
                const architectureCanvas = getBackendArchitectureCanvasFromStore();
                if (
                    !selectedCanvas ||
                    !projectDiagram ||
                    !architectureCanvas ||
                    !architectureCanvas.nodes.length ||
                    selectedCanvas.canvas_type === CanvasType.architecture
                ) {
                    return;
                }

                const nextSelectedCanvas = getUpdatedDFCanvas(
                    projectDiagram,
                    architectureCanvas,
                    selectedCanvas.canvas_id
                );
                const updatedNodes = updateNodesCanvasColumn(
                    nextSelectedCanvas?.nodes || [],
                    nodeIds,
                    canvasColumn
                );
                const positionedNodes = positionDataFlowCanvasNodes(
                    updatedNodes,
                    architectureCanvas
                );

                handleSetProcessedNodes({
                    canvasNodes: positionedNodes,
                });
                const updatedCanvas = await updateCanvas({
                    instanceId,
                    canvasNodes: positionedNodes,
                    funcRef: "handleSetDataflowNodesCanvasColumn",
                });
                if (updatedCanvas) {
                    appendCanvasHistory(updatedCanvas);
                }
            } catch (error) {
                enqueueSnackbar(`Failed to set dataflow nodes column. ${error}`, {
                    variant: "error",
                });
            }
        },
        [appendCanvasHistory, handleSetProcessedNodes, instanceId]
    );
};
