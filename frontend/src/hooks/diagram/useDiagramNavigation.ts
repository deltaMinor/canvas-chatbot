import React from "react";

import { useReactFlow } from "@xyflow/react";
import { enqueueSnackbar } from "notistack";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import {
    getActiveEdgesFromStore,
    getActiveNodesFromStore,
} from "#root/stores/projectDiagram/selection";
import {
    getFocusEdgeFitBounds,
    getFocusNodeFitBounds,
} from "#root/utils/diagram/diagramViewportBoundsUtil";

export const useFocusDiagramNode = () => {
    const instanceId = useDiagramInstanceId();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();

    return React.useCallback(
        (focusId: string) => {
            try {
                const activeNodes = getActiveNodesFromStore(instanceId);
                const focusNode = activeNodes.find((node) => {
                    const comparableNodeId = String(node.data?.["originalNodeId"] || node.id || "");
                    return node.id === focusId || comparableNodeId === focusId;
                });

                if (!focusNode) {
                    throw new Error("Node not found in the diagram.");
                }

                const nodesRect = reactFlow.getNodesBounds([focusNode]);
                const clusterBounds = getFocusNodeFitBounds({
                    node: focusNode,
                    allNodes: activeNodes,
                    nodesRect,
                });

                if (clusterBounds) {
                    reactFlow.fitBounds(clusterBounds, {
                        duration: 500,
                        padding: 0.18,
                    });
                    return;
                }

                const centerX = nodesRect.x + nodesRect.width / 2;
                const centerY = nodesRect.y + nodesRect.height / 2;

                reactFlow.setCenter(centerX, centerY, {
                    duration: 500,
                    zoom: 1.2,
                });
            } catch (error) {
                enqueueSnackbar({
                    message: `Error focusing node: ${error}`,
                    variant: "error",
                });
            }
        },
        [instanceId, reactFlow]
    );
};

export const useFocusDiagramEdge = () => {
    const instanceId = useDiagramInstanceId();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();

    return React.useCallback(
        (focusId: string) => {
            try {
                const activeEdges = getActiveEdgesFromStore(instanceId);
                const activeNodes = getActiveNodesFromStore(instanceId);
                const focusEdge = activeEdges.find((edge) => {
                    const comparableEdgeId = String(edge.data?.["originalEdgeId"] || edge.id || "");
                    return edge.id === focusId || comparableEdgeId === focusId;
                });

                if (!focusEdge) {
                    throw new Error("Edge not found in the diagram.");
                }

                const resolveComparableNodeId = (node: DiagramNode) =>
                    String(node.data?.["originalNodeId"] || node.id || "");
                const sourceNode = activeNodes.find((node) => {
                    const comparableNodeId = resolveComparableNodeId(node);
                    return node.id === focusEdge.source || comparableNodeId === focusEdge.source;
                });
                const targetNode = activeNodes.find((node) => {
                    const comparableNodeId = resolveComparableNodeId(node);
                    return node.id === focusEdge.target || comparableNodeId === focusEdge.target;
                });

                if (!sourceNode || !targetNode) {
                    throw new Error("Edge endpoints not found in the diagram.");
                }

                const bounds = getFocusEdgeFitBounds({
                    sourceNode,
                    targetNode,
                    getNodesBounds: reactFlow.getNodesBounds,
                });
                reactFlow.fitBounds(bounds, {
                    duration: 500,
                    padding: 0.2,
                });
            } catch (error) {
                enqueueSnackbar({
                    message: `Error focusing edge: ${error}`,
                    variant: "error",
                });
            }
        },
        [instanceId, reactFlow]
    );
};
