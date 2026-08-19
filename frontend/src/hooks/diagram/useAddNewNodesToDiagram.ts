import React from "react";

import { enqueueSnackbar } from "notistack";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAppendCanvasHistory,
    useDiagramDraftCanvasType,
    useHandleSetProcessedNodes,
} from "#root/hooks/diagram";
import { DiagramNode } from "#root/interfaces/diagram";
import { getDiagramDraftCanvasNodesFromStore } from "#root/stores/projectDiagram/canvas";
import { updateCanvas } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { getFilteredCanvasNodesOrEdges } from "#root/utils/diagram";

export const useAddNewNodesToDiagram = () => {
    const instanceId = useDiagramInstanceId();
    const appendCanvasHistory = useAppendCanvasHistory();
    const selectedCanvasType = useDiagramDraftCanvasType();
    const handleSetProcessedNodes = useHandleSetProcessedNodes();

    return React.useCallback(
        async (newNodes: DiagramNode[]) => {
            try {
                const contextNodes = getDiagramDraftCanvasNodesFromStore(instanceId);

                if (!selectedCanvasType) {
                    throw new Error("Invalid canvas type.");
                }
                const canvasNodes = getFilteredCanvasNodesOrEdges<DiagramNode>(
                    contextNodes, //
                    selectedCanvasType
                );

                const nodesAddedIdList = [] as string[];
                const nextCanvasNodes: DiagramNode[] = canvasNodes.map((canvasNode) => {
                    const newNode = newNodes.find((node) => node.id === canvasNode.id);
                    if (newNode) {
                        nodesAddedIdList.push(newNode.id);
                        return {
                            ...canvasNode,
                            ...newNode,
                            selected: true,
                            hidden: false,
                        };
                    }
                    return {
                        ...canvasNode,
                        selected: false,
                    };
                });

                newNodes.forEach((newNode) => {
                    if (nodesAddedIdList.includes(newNode.id)) return;
                    nextCanvasNodes.push({
                        ...newNode,
                        selected: true,
                    });
                    nodesAddedIdList.push(newNode.id);
                });

                handleSetProcessedNodes({
                    canvasNodes: nextCanvasNodes,
                });
                const nextSelectedCanvas = await updateCanvas({
                    instanceId,
                    canvasNodes: nextCanvasNodes,
                });
                if (nextSelectedCanvas) {
                    appendCanvasHistory(nextSelectedCanvas);
                }
            } catch (e) {
                enqueueSnackbar(`Failed to add new node to diagram. ${e}`, {
                    variant: "error",
                });
            }
        },
        [appendCanvasHistory, handleSetProcessedNodes, instanceId, selectedCanvasType]
    );
};
