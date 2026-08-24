import React from "react";

import { CoordinateExtent } from "@xyflow/react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useHandleSetProcessedNodesAndEdges } from "#root/hooks/diagram";
import { CanvasType } from "#root/interfaces/diagram";
import { getDraftCanvasIdFromStore } from "#root/stores/projectDiagram/backend";
import { getDiagramDraftCanvasTypeFromStore } from "#root/stores/projectDiagram/canvas";
import { getDiagramCanvasHistoryFromStore } from "#root/stores/projectDiagram/canvasHistory";
import { updateCanvas } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { updateCanvasHistoryIndex } from "#root/utils/diagram/diagramCanvasHistoryUtil";

export const useRetrieveStage = () => {
    const instanceId = useDiagramInstanceId();
    const handleSetProcessedNodesAndEdges = useHandleSetProcessedNodesAndEdges();

    return React.useCallback(
        async (stageCanvasDataIndex: number) => {
            const canvasHistory = getDiagramCanvasHistoryFromStore(instanceId);
            const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);
            const draftCanvasId = getDraftCanvasIdFromStore(instanceId) ?? "";

            if (
                ![
                    CanvasType.architecture.toString(), //
                    CanvasType.data_flow.toString(),
                ]?.includes(selectedCanvasType || "")
            ) {
                return;
            }

            const canvasData = canvasHistory[stageCanvasDataIndex];
            if (!canvasData) {
                return;
            }

            const historyNodes = canvasData.nodes.map((node) => ({
                ...node,
                extent: [
                    [-Infinity, -Infinity],
                    [Infinity, Infinity],
                ] as CoordinateExtent,
                selected: false,
            }));
            const historyEdges = canvasData.edges;

            handleSetProcessedNodesAndEdges({
                canvasEdges: historyEdges,
                canvasNodes: historyNodes,
                funcRef: "retrieveStage",
            });
            await updateCanvas({
                instanceId,
                canvasEdges: historyEdges,
                canvasNodes: historyNodes,
                draftCanvasId,
            });
            updateCanvasHistoryIndex({
                instanceId,
                canvas_id: draftCanvasId,
                index: stageCanvasDataIndex,
            });
        },
        [handleSetProcessedNodesAndEdges, instanceId]
    );
};
