import React from "react";
import { MultiValue } from "react-select";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useArchitectureCanvas,
    useArchitectureNodes,
    useHandleSetProcessedNodes,
} from "#root/hooks/diagram";
import { OptionLabel, SelectableValue } from "#root/interfaces";
import { DiagramNode } from "#root/interfaces/diagram";
import { getProjectDiagramFromStore } from "#root/stores/backendStore";
import {
    getDiagramDraftCanvasFromStore,
    getDiagramDraftCanvasTypeFromStore,
} from "#root/stores/projectDiagram/canvas";
import { updateCanvas } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { updateArchitectureNodesDataStored } from "#root/utils/userStoryDrawerUtil";

const getComparableNodeId = (node: DiagramNode) => {
    return String(node?.data?.["originalNodeId"] || node?.id || "");
};

const syncCanvasNodesWithUpdatedArchitectureNodes = (
    canvasNodes: DiagramNode[],
    architectureNodes: DiagramNode[]
) => {
    const updatedNodesByComparableId = architectureNodes.reduce(
        (acc, node) => {
            acc[getComparableNodeId(node)] = node;
            return acc;
        },
        {} as Record<string, DiagramNode>
    );

    return canvasNodes.map((node) => {
        const updatedNode = updatedNodesByComparableId[getComparableNodeId(node)];
        if (!updatedNode) {
            return node;
        }

        return {
            ...node,
            data: {
                ...node.data,
                ...updatedNode.data,
            },
        };
    });
};

export const useUpdateNodeDataStored = () => {
    const instanceId = useDiagramInstanceId();
    const handleSetProcessedNodes = useHandleSetProcessedNodes();
    const architectureCanvasFromHook = useArchitectureCanvas();
    const architectureNodesFromHook = useArchitectureNodes();

    return React.useCallback(
        async (
            dataItem: SelectableValue,
            values: MultiValue<OptionLabel> | readonly OptionLabel[]
        ) => {
            const architectureCanvas = architectureCanvasFromHook;
            const architectureNodes = architectureNodesFromHook;
            const projectDiagram = getProjectDiagramFromStore();
            const selectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
            const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);

            if (!selectedCanvasType || !projectDiagram || !selectedCanvas) {
                return;
            }

            const nextSelectedCanvas = projectDiagram?.canvas?.find(
                (c) => c.canvas_id === selectedCanvas.canvas_id
            );
            const selectedCanvasNodes = nextSelectedCanvas?.nodes || [];
            const selectedNodeIds = values.map((node) => String(node.value));
            const updatedArchitectureNodes = updateArchitectureNodesDataStored(
                architectureNodes,
                selectedNodeIds,
                String(dataItem.value)
            );
            const updatedSelectedCanvasNodes = syncCanvasNodesWithUpdatedArchitectureNodes(
                selectedCanvasNodes,
                updatedArchitectureNodes
            );

            handleSetProcessedNodes({
                canvasNodes: updatedSelectedCanvasNodes,
                architectureNodes: updatedArchitectureNodes,
                funcRef: "handleUpdateNodeDataStored",
            });

            updateCanvas({
                instanceId,
                canvasNodes: updatedArchitectureNodes,
                draftCanvasId: architectureCanvas?.canvas_id || "",
                funcRef: "handleUpdateNodeDataStored",
            });
        },
        [architectureCanvasFromHook, architectureNodesFromHook, handleSetProcessedNodes, instanceId]
    );
};
